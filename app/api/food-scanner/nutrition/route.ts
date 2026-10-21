/**
 * /api/food-scanner/nutrition
 *
 * GET /api/food-scanner/nutrition?foodId=<id>&portionG=<g>
 *
 * Returns a scaled nutrition estimate for a food item, resolved from:
 *   1. In-memory FOOD_DATABASE (TKPI-2017) — first priority.
 *   2. Neon food_items table (USDA-FDC and any future additions) — fallback.
 *
 * This endpoint exists because the client cannot access the Neon DB directly,
 * and estimateNutrition() in food-database.ts only covers TKPI-2017.
 * USDA-FDC records are stored in Neon and are not available in-memory.
 *
 * All values are per 100 g in the database; this route scales them to portionG.
 *
 * RESPONSE 200:
 * {
 *   foodId:        string;
 *   namePrimary:   string;
 *   portionG:      number;
 *   energyKcal:    number | null;   // null = not measured / not available
 *   proteinG:      number | null;
 *   fatG:          number | null;
 *   carbG:         number | null;
 *   fiberG:        number | null;
 *   dataSource:    "TKPI-2017" | "USDA-FDC" | "estimate";
 *   isEstimate:    boolean;
 *   assumptions:   string;
 *   typicalPortionG:     number | null;   // for portion-picker pre-fill
 *   typicalPortionLabel: string | null;
 * }
 *
 * RESPONSE 400: { error: string }   bad parameters
 * RESPONSE 404: { error: string }   foodId not found in either source
 *
 * SECURITY: No auth required (nutrition data is public reference data).
 * Rate-limiting is handled at the edge/proxy level.
 */

import { NextRequest } from "next/server";
import { getFoodById } from "@/lib/food-database";
import { db } from "@/lib/db";
import { foodItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export interface NutritionApiResponse {
  foodId:              string;
  namePrimary:         string;
  portionG:            number;
  energyKcal:          number | null;
  proteinG:            number | null;
  fatG:                number | null;
  carbG:               number | null;
  fiberG:              number | null;
  dataSource:          string;
  isEstimate:          boolean;
  assumptions:         string;
  typicalPortionG:     number | null;
  typicalPortionLabel: string | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // ── Parse & validate params ──────────────────────────────────────────────
  const foodId = searchParams.get("foodId")?.trim();
  if (!foodId) {
    return Response.json({ error: "foodId diperlukan." }, { status: 400 });
  }

  const portionRaw = searchParams.get("portionG");
  const portionG = portionRaw ? parseFloat(portionRaw) : 100;
  if (!portionG || portionG <= 0 || portionG > 5000) {
    return Response.json(
      { error: "portionG harus angka positif antara 1–5000." },
      { status: 400 }
    );
  }

  const scale = portionG / 100;

  // ── Source 1: in-memory TKPI-2017 ────────────────────────────────────────
  const memFood = getFoodById(foodId);
  if (memFood) {
    const assumptions: string[] = [
      `Nilai per 100 g dari ${memFood.dataSource} (${
        memFood.dataSource === "TKPI-2017"
          ? "Tabel Komposisi Pangan Indonesia 2017, Kemenkes RI"
          : "USDA FoodData Central"
      }).`,
      `Porsi diasumsikan ${portionG} g — bukan hasil timbangan langsung.`,
    ];
    if (memFood.isEstimate) {
      assumptions.push(memFood.estimateNote ?? "Nilai merupakan estimasi.");
    }

    const response: NutritionApiResponse = {
      foodId:              memFood.foodId,
      namePrimary:         memFood.namePrimary,
      portionG,
      energyKcal:          memFood.energyKcal != null
                             ? Math.round(memFood.energyKcal * scale)
                             : null,
      proteinG:            memFood.proteinG != null
                             ? Math.round(memFood.proteinG * scale * 10) / 10
                             : null,
      fatG:                memFood.fatG != null
                             ? Math.round(memFood.fatG * scale * 10) / 10
                             : null,
      carbG:               memFood.carbG != null
                             ? Math.round(memFood.carbG * scale * 10) / 10
                             : null,
      fiberG:              memFood.fiberG != null
                             ? Math.round(memFood.fiberG * scale * 10) / 10
                             : null,
      dataSource:          memFood.dataSource,
      isEstimate:          memFood.isEstimate,
      assumptions:         assumptions.join(" "),
      typicalPortionG:     memFood.typicalPortionG,
      typicalPortionLabel: memFood.typicalPortionLabel,
    };
    return Response.json(response);
  }

  // ── Source 2: Neon food_items (USDA-FDC) ─────────────────────────────────
  try {
    const rows = await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.foodId, foodId))
      .limit(1);

    if (rows.length === 0) {
      return Response.json(
        { error: `Makanan dengan foodId "${foodId}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    const row = rows[0];

    // Build assumptions string — note which nutrients are unavailable
    const missingFields: string[] = [];
    if (row.energyKcal == null) missingFields.push("energi");
    if (row.proteinG == null)   missingFields.push("protein");
    if (row.fatG == null)       missingFields.push("lemak");
    if (row.carbG == null)      missingFields.push("karbohidrat");

    const assumptions: string[] = [
      `Nilai per 100 g dari ${row.dataSource} (${
        row.dataSource === "USDA-FDC"
          ? "USDA FoodData Central — Foundation Foods"
          : row.dataSource
      }).`,
      `Porsi diasumsikan ${portionG} g — bukan hasil timbangan langsung.`,
    ];
    if (missingFields.length > 0) {
      assumptions.push(
        `Data ${missingFields.join(", ")} tidak tersedia dalam sumber ini.`
      );
    }
    if (row.isEstimate) {
      assumptions.push(row.estimateNote ?? "Nilai merupakan estimasi.");
    }

    const response: NutritionApiResponse = {
      foodId:              row.foodId,
      namePrimary:         row.namePrimary,
      portionG,
      energyKcal:          row.energyKcal != null
                             ? Math.round(row.energyKcal * scale)
                             : null,
      proteinG:            row.proteinG != null
                             ? Math.round(row.proteinG * scale * 10) / 10
                             : null,
      fatG:                row.fatG != null
                             ? Math.round(row.fatG * scale * 10) / 10
                             : null,
      carbG:               row.carbG != null
                             ? Math.round(row.carbG * scale * 10) / 10
                             : null,
      fiberG:              row.fiberG != null
                             ? Math.round(row.fiberG * scale * 10) / 10
                             : null,
      dataSource:          row.dataSource,
      isEstimate:          row.isEstimate,
      assumptions:         assumptions.join(" "),
      typicalPortionG:     row.typicalPortionG ?? null,
      typicalPortionLabel: row.typicalPortionLabel ?? null,
    };
    return Response.json(response);
  } catch (err) {
    console.error("[food-scanner/nutrition] DB error:", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Database tidak dapat dihubungi. Coba lagi." },
      { status: 503 }
    );
  }
}
