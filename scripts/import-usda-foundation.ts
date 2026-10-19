/**
 * scripts/import-usda-foundation.ts
 *
 * USDA FoodData Central — Foundation Foods JSON Importer
 *
 * Usage:
 *   npx tsx scripts/import-usda-foundation.ts --dry-run
 *   npx tsx scripts/import-usda-foundation.ts
 *   npx tsx scripts/import-usda-foundation.ts --limit 50
 *   npx tsx scripts/import-usda-foundation.ts --file path/to/custom.json
 *
 * Flags:
 *   --dry-run   Parse and map records without writing to DB. Safe to run anytime.
 *   --limit N   Import only the first N records (for testing).
 *   --file PATH Custom path to the JSON file.
 *
 * Rules:
 *   - Uses Drizzle ORM insert + onConflictDoUpdate — safe to run multiple times.
 *   - Never overwrites a row where dataSource = "TKPI-2017".
 *   - Missing nutrients stored as null — no fabricated zeros.
 *   - All values are per 100 g as reported by USDA.
 *   - Credentials read from DATABASE_URL env var — never hardcoded.
 */

import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { foodItems } from "@/lib/db/schema";
import * as dotenv from "dotenv";

// ── Load env ────────────────────────────────────────────────────────────────
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

// ── CLI flags ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT_IDX = args.indexOf("--limit");
const LIMIT = LIMIT_IDX >= 0 ? parseInt(args[LIMIT_IDX + 1] ?? "0", 10) : 0;
const FILE_IDX = args.indexOf("--file");
const JSON_FILENAME =
  FILE_IDX >= 0
    ? args[FILE_IDX + 1]
    : "FoodData_Central_foundation_food_json_2026-04-30.json";

// Resolve path: try CWD first (nutripath/), then parent
const JSON_PATH = fs.existsSync(path.join(process.cwd(), JSON_FILENAME))
  ? path.join(process.cwd(), JSON_FILENAME)
  : path.join(process.cwd(), "..", JSON_FILENAME);

// ── USDA Nutrient IDs ───────────────────────────────────────────────────────
// FDC nutrient number → field mapping.
// These IDs are stable across FoodData Central releases.
// Source: https://fdc.nal.usda.gov/data-documentation
const NUTRIENT_MAP: Record<number, string> = {
  1008: "energyKcal",   // Energy (kcal)
  1003: "proteinG",     // Protein (g)
  1004: "fatG",         // Total lipid / fat (g)
  1005: "carbG",        // Carbohydrate, by difference (g)
  1079: "fiberG",       // Fiber, total dietary (g)
  1051: "waterG",       // Water (g)
  1093: "sodiumMg",     // Sodium, Na (mg)
  1087: "calciumMg",    // Calcium, Ca (mg)
  1089: "ironMg",       // Iron, Fe (mg)
  1162: "vitaminCMg",   // Vitamin C, total ascorbic acid (mg)
};

// ── USDA JSON structures ────────────────────────────────────────────────────
interface UsdaNutrient {
  id: number;
  name: string;
  number: string;
  unitName: string;
}

interface UsdaFoodNutrient {
  type: string;
  id?: number;
  nutrient: UsdaNutrient;
  amount?: number;
  median?: number;
  dataPoints?: number;
  foodNutrientDerivation?: {
    code: string;
    description: string;
    foodNutrientSource?: { id: number; code: string; description: string };
  };
}

interface UsdaFoodItem {
  foodClass: string;
  description: string;
  fdcId: number;
  publicationDate?: string;
  foodNutrients: UsdaFoodNutrient[];
  foodCategory?: { id: number; code: string; description: string };
}

interface UsdaFoundationFile {
  FoundationFoods: UsdaFoodItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convert USDA description to a stable slug */
function toSlug(desc: string): string {
  return (
    "usda-" +
    desc
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
  );
}

/** Extract nutrient value from foodNutrients array by USDA nutrient id */
function extractNutrient(
  nutrients: UsdaFoodNutrient[],
  nutrientId: number
): number | null {
  const hit = nutrients.find((n) => n.nutrient?.id === nutrientId);
  if (!hit) return null;
  // Prefer `amount`; fall back to `median` for analytical records
  const val = hit.amount ?? hit.median ?? null;
  if (val === null || val === undefined) return null;
  // Return null for effectively-zero analytical values that are genuine 0.0
  // to distinguish from "not measured". We keep 0.0 as 0.0 — it IS a value.
  return val;
}

/** Determine derivation type from the first nutrient source */
function derivationType(item: UsdaFoodItem): "analytical" | "calculated" | "unknown" {
  const first = item.foodNutrients[0];
  if (!first?.foodNutrientDerivation) return "unknown";
  const code = first.foodNutrientDerivation.code ?? "";
  if (code === "A" || code === "AS") return "analytical";
  if (code === "NC" || code === "C") return "calculated";
  return "unknown";
}

/** Map one USDA record to a DB-ready object */
function mapRecord(item: UsdaFoodItem): {
  foodId: string;
  namePrimary: string;
  nameAliases: string[];
  nameEnglish: string;
  category: string;
  dataSource: string;
  dataSourceId: string;
  isEstimate: boolean;
  estimateNote: string | null;
  energyKcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbG: number | null;
  fiberG: number | null;
  waterG: number | null;
  sodiumMg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  vitaminCMg: number | null;
} {
  const n = item.foodNutrients;
  const deriv = derivationType(item);
  const catDesc = item.foodCategory?.description ?? "USDA Foundation";

  return {
    foodId: toSlug(item.description),
    namePrimary: item.description,
    nameAliases: [],
    nameEnglish: item.description,
    category: catDesc,
    dataSource: "USDA-FDC",
    dataSourceId: String(item.fdcId),
    isEstimate: deriv === "calculated",
    estimateNote:
      deriv === "calculated"
        ? "Nilai dihitung (calculated) dari USDA FoodData Central — bukan pengukuran langsung."
        : null,
    energyKcal: extractNutrient(n, 1008),
    proteinG: extractNutrient(n, 1003),
    fatG: extractNutrient(n, 1004),
    carbG: extractNutrient(n, 1005),
    fiberG: extractNutrient(n, 1079),
    waterG: extractNutrient(n, 1051),
    sodiumMg: extractNutrient(n, 1093),
    calciumMg: extractNutrient(n, 1087),
    ironMg: extractNutrient(n, 1089),
    vitaminCMg: extractNutrient(n, 1162),
  };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(" SMANU · USDA Foundation Foods Importer");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Mode   : ${DRY_RUN ? "DRY-RUN (no DB writes)" : "LIVE"}`);
  console.log(`  File   : ${JSON_PATH}`);
  if (LIMIT > 0) console.log(`  Limit  : ${LIMIT} records`);
  console.log("");

  // ── 1. Read JSON ──────────────────────────────────────────────────────────
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`❌ File not found: ${JSON_PATH}`);
    console.error(
      "   Place FoodData_Central_foundation_food_json_*.json in nutripath/ directory."
    );
    process.exit(1);
  }

  console.log("📂 Reading JSON file...");
  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  let parsed: UsdaFoundationFile;
  try {
    parsed = JSON.parse(raw) as UsdaFoundationFile;
  } catch (e) {
    console.error("❌ Failed to parse JSON:", e);
    process.exit(1);
  }

  const allItems = (parsed.FoundationFoods ?? []).filter(
    (item) => item !== null && item !== undefined && typeof item === "object" && Array.isArray(item.foodNutrients)
  );
  const items = LIMIT > 0 ? allItems.slice(0, LIMIT) : allItems;
  const nullCount = (parsed.FoundationFoods ?? []).length - allItems.length;
  console.log(`📊 Total records in file : ${(parsed.FoundationFoods ?? []).length}`);
  if (nullCount > 0) console.log(`⚠️  Null/invalid records skipped: ${nullCount}`);
  console.log(`📊 Records to process    : ${items.length}`);
  console.log("");

  // ── 2. Map records ────────────────────────────────────────────────────────
  const mapped = items.map(mapRecord);

  // Stats
  const withEnergy = mapped.filter((r) => r.energyKcal !== null).length;
  const withProtein = mapped.filter((r) => r.proteinG !== null).length;
  const withFiber = mapped.filter((r) => r.fiberG !== null).length;
  const estimates = mapped.filter((r) => r.isEstimate).length;

  console.log("📋 Mapping summary:");
  console.log(`   Records mapped          : ${mapped.length}`);
  console.log(`   With energy (kcal)      : ${withEnergy}`);
  console.log(`   With protein            : ${withProtein}`);
  console.log(`   With fiber              : ${withFiber}`);
  console.log(`   Calculated (estimated)  : ${estimates}`);
  console.log(`   Analytical              : ${mapped.length - estimates}`);
  console.log("");

  // Sample preview
  if (mapped.length > 0) {
    console.log("🔍 Sample record (first):");
    const s = mapped[0];
    console.log(`   foodId    : ${s.foodId}`);
    console.log(`   name      : ${s.namePrimary}`);
    console.log(`   category  : ${s.category}`);
    console.log(`   energy    : ${s.energyKcal ?? "null"} kcal`);
    console.log(`   protein   : ${s.proteinG ?? "null"} g`);
    console.log(`   fat       : ${s.fatG ?? "null"} g`);
    console.log(`   carbs     : ${s.carbG ?? "null"} g`);
    console.log(`   fiber     : ${s.fiberG ?? "null"} g`);
    console.log(`   sodium    : ${s.sodiumMg ?? "null"} mg`);
    console.log(`   isEstimate: ${s.isEstimate}`);
    console.log(`   sourceId  : ${s.dataSourceId}`);
    console.log("");
  }

  if (DRY_RUN) {
    console.log("✅ DRY-RUN complete — no database changes made.");
    console.log("   Run without --dry-run to import.");
    return;
  }

  // ── 3. DB insert (batch, Drizzle ORM) ────────────────────────────────────
  const client = neon(DATABASE_URL!);
  const db = drizzle(client);

  const BATCH_SIZE = 25; // smaller to stay under Neon's statement limit
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`🚀 Importing to Neon (batch size: ${BATCH_SIZE})...`);

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(mapped.length / BATCH_SIZE);

    try {
      // Build Drizzle insert values — array form is type-safe and handles null correctly
      const values = batch.map((r) => ({
        foodId: r.foodId,
        namePrimary: r.namePrimary,
        nameAliases: r.nameAliases,    // string[] — Drizzle handles pg array cast
        nameEnglish: r.nameEnglish,
        category: r.category,
        dataSource: r.dataSource,
        dataSourceId: r.dataSourceId,
        isEstimate: r.isEstimate,
        estimateNote: r.estimateNote,
        energyKcal: r.energyKcal,
        proteinG: r.proteinG,
        fatG: r.fatG,
        carbG: r.carbG,
        fiberG: r.fiberG,
        waterG: r.waterG,
        sodiumMg: r.sodiumMg,
        calciumMg: r.calciumMg,
        ironMg: r.ironMg,
        vitaminCMg: r.vitaminCMg,
        verified: false,
        dataCapturedAt: new Date(),
      }));

      // onConflictDoUpdate: protect TKPI-2017 rows using SQL CASE expressions
      await db
        .insert(foodItems)
        .values(values)
        .onConflictDoUpdate({
          target: foodItems.foodId,
          set: {
            namePrimary:  sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.name_primary  ELSE EXCLUDED.name_primary  END`,
            energyKcal:   sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.energy_kcal  ELSE EXCLUDED.energy_kcal  END`,
            proteinG:     sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.protein_g    ELSE EXCLUDED.protein_g    END`,
            fatG:         sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.fat_g        ELSE EXCLUDED.fat_g        END`,
            carbG:        sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.carb_g       ELSE EXCLUDED.carb_g       END`,
            fiberG:       sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.fiber_g      ELSE EXCLUDED.fiber_g      END`,
            waterG:       sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.water_g      ELSE EXCLUDED.water_g      END`,
            sodiumMg:     sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.sodium_mg    ELSE EXCLUDED.sodium_mg    END`,
            calciumMg:    sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.calcium_mg   ELSE EXCLUDED.calcium_mg   END`,
            ironMg:       sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.iron_mg      ELSE EXCLUDED.iron_mg      END`,
            vitaminCMg:   sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.vitamin_c_mg ELSE EXCLUDED.vitamin_c_mg END`,
            isEstimate:   sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.is_estimate  ELSE EXCLUDED.is_estimate  END`,
            estimateNote: sql`CASE WHEN food_items.data_source = 'TKPI-2017' THEN food_items.estimate_note ELSE EXCLUDED.estimate_note END`,
            updatedAt:    sql`NOW()`,
          },
        });

      imported += batch.length;
      process.stdout.write(`\r   Batch ${batchNum}/${totalBatches} — imported: ${imported}, failed: ${failed}`);
    } catch (batchErr) {
      const msg = batchErr instanceof Error ? batchErr.message.slice(0, 120) : String(batchErr);
      process.stdout.write(`\n   ❌ Batch ${batchNum} failed: ${msg}\n`);
      failed += batch.length;
      skipped += batch.length;
    }
  }

  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(" Import Complete");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Total records processed : ${mapped.length}`);
  console.log(`  Successfully imported   : ${imported}`);
  console.log(`  Failed rows             : ${failed}`);
  console.log(`  Skipped (batch error)   : ${skipped}`);
  console.log(`  TKPI-2017 rows protected: (existing TKPI rows not overwritten)`);
  console.log("═══════════════════════════════════════════════════════════════");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
