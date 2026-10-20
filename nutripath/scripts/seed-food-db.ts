/**
 * scripts/seed-food-db.ts
 *
 * Seeds the food_items table with Phase 1 data from lib/food-database.ts.
 *
 * Usage:
 *   npx tsx scripts/seed-food-db.ts
 *
 * Requirements:
 *   DATABASE_URL must be set in .env.local
 *
 * Behaviour:
 *   - Uses INSERT ... ON CONFLICT (food_id) DO UPDATE (upsert).
 *   - Safe to run multiple times — existing rows are updated, not duplicated.
 *   - Prints a summary of inserted/updated rows.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import { FOOD_DATABASE } from "../lib/food-database";

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("❌  DATABASE_URL is not set. Add it to .env.local");
    process.exit(1);
  }

  const db = drizzle(neon(rawUrl), { schema });

  console.log(`\n🌱  Seeding food_items table — ${FOOD_DATABASE.length} items…`);

  let inserted = 0;

  for (const item of FOOD_DATABASE) {
    // Strip potassiumMg — it's not in the DB schema (Phase 1 micro-nutrients)
    const { potassiumMg: _unused, ...rest } = item as typeof item & { potassiumMg?: number };
    void _unused;

    const row: schema.NewFoodItem = {
      foodId: rest.foodId,
      namePrimary: rest.namePrimary,
      nameAliases: rest.nameAliases,
      nameEnglish: rest.nameEnglish ?? null,
      category: rest.category,
      subCategory: rest.subCategory ?? null,
      cookingMethod: rest.cookingMethod ?? null,
      energyKcal: rest.energyKcal,
      proteinG: rest.proteinG,
      fatG: rest.fatG,
      carbG: rest.carbG,
      fiberG: rest.fiberG ?? null,
      waterG: rest.waterG ?? null,
      sodiumMg: rest.sodiumMg ?? null,
      calciumMg: rest.calciumMg ?? null,
      ironMg: rest.ironMg ?? null,
      vitaminCMg: rest.vitaminCMg ?? null,
      typicalPortionG: rest.typicalPortionG,
      typicalPortionLabel: rest.typicalPortionLabel,
      dataSource: rest.dataSource,
      dataSourceId: rest.dataSourceId ?? null,
      dataCapturedAt: new Date("2025-01-01"),
      isEstimate: rest.isEstimate,
      estimateNote: rest.estimateNote ?? null,
      verified: rest.verified,
    };

    // Upsert on food_id unique constraint
    const result = await db
      .insert(schema.foodItems)
      .values(row)
      .onConflictDoUpdate({
        target: schema.foodItems.foodId,
        set: {
          namePrimary: row.namePrimary,
          nameAliases: row.nameAliases,
          nameEnglish: row.nameEnglish,
          category: row.category,
          subCategory: row.subCategory,
          cookingMethod: row.cookingMethod,
          energyKcal: row.energyKcal,
          proteinG: row.proteinG,
          fatG: row.fatG,
          carbG: row.carbG,
          fiberG: row.fiberG,
          waterG: row.waterG,
          sodiumMg: row.sodiumMg,
          calciumMg: row.calciumMg,
          ironMg: row.ironMg,
          vitaminCMg: row.vitaminCMg,
          typicalPortionG: row.typicalPortionG,
          typicalPortionLabel: row.typicalPortionLabel,
          dataSource: row.dataSource,
          dataSourceId: row.dataSourceId,
          dataCapturedAt: row.dataCapturedAt,
          isEstimate: row.isEstimate,
          estimateNote: row.estimateNote,
          verified: row.verified,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: schema.foodItems.id });

    if (result.length > 0) {
      inserted++;
    }
    process.stdout.write(`  ✓ ${row.namePrimary} (${row.dataSource})\n`);
  }

  console.log(`\n✅  Done — ${inserted} upserted (${FOOD_DATABASE.length} total).\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
