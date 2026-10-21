/**
 * /api/food-scanner/save
 *
 * POST — Save a confirmed food scan result to the database.
 * REQUIRES authenticated session (JWT).
 *
 * REQUEST body:
 * {
 *   recognizedFoodId:    string | null,
 *   recognizedFoodName:  string,
 *   candidatesJson?:     unknown,
 *   portionG:            number,
 *   portionLabel:        string,
 *   modelUsed?:          string,
 *   confidenceNote?:     string,
 *   // Optional: pre-computed nutrition from the client (from /api/food-scanner/nutrition)
 *   estimatedEnergyKcal?: number | null,
 *   estimatedProteinG?:   number | null,
 *   estimatedFatG?:       number | null,
 *   estimatedCarbG?:      number | null,
 *   dataSourceUsed?:      string,
 *   assumptions?:         string,
 * }
 *
 * RESPONSE 200: { id: string }
 * RESPONSE 401: not authenticated
 * RESPONSE 400: validation error
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { foodScanLogs, foodItems } from "@/lib/db/schema";
import { getFoodById, estimateNutrition } from "@/lib/food-database";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

interface SaveBody {
  recognizedFoodId?:    string | null;
  recognizedFoodName:   string;
  candidatesJson?:      unknown;
  portionG:             number;
  portionLabel:         string;
  modelUsed?:           string;
  confidenceNote?:      string;
  // Pre-computed nutrition — no server re-query when client supplies these
  estimatedEnergyKcal?: number | null;
  estimatedProteinG?:   number | null;
  estimatedFatG?:       number | null;
  estimatedCarbG?:      number | null;
  estimatedFiberG?:     number | null;
  dataSourceUsed?:      string;
  dataStatus?:          string;
  energyRange?:         string;
  assumptions?:         string;
  // AI explanation blob (7-section structured report)
  explanationJson?:     unknown;
}

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan untuk menyimpan hasil scan." }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Parse body
  let body: SaveBody;
  try {
    body = await req.json() as SaveBody;
  } catch {
    return Response.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  const {
    recognizedFoodId, recognizedFoodName, candidatesJson, portionG, portionLabel,
    modelUsed, confidenceNote,
  } = body;

  if (!recognizedFoodName?.trim()) {
    return Response.json({ error: "recognizedFoodName diperlukan." }, { status: 400 });
  }
  if (typeof portionG !== "number" || portionG <= 0 || portionG > 5000) {
    return Response.json({ error: "portionG harus angka positif (max 5000 g)." }, { status: 400 });
  }

  // 3. Resolve nutrition values — prefer client-supplied, then compute server-side
  let energyKcal: number | null = body.estimatedEnergyKcal ?? null;
  let proteinG:   number | null = body.estimatedProteinG   ?? null;
  let fatG:       number | null = body.estimatedFatG       ?? null;
  let carbG:      number | null = body.estimatedCarbG      ?? null;
  let dataSourceUsed:  string | undefined = body.dataSourceUsed;
  let assumptions:     string | undefined = body.assumptions;

  // If nutrition wasn't pre-supplied by client, compute server-side
  const needsCompute = recognizedFoodId &&
    energyKcal === null && proteinG === null &&
    fatG === null && carbG === null;

  if (needsCompute && recognizedFoodId) {
    const scale = portionG / 100;

    // Try TKPI in-memory first
    const memFood = getFoodById(recognizedFoodId);
    if (memFood) {
      const n = estimateNutrition(recognizedFoodId, portionG);
      if (n) {
        energyKcal     = n.energyKcal;
        proteinG       = n.proteinG;
        fatG           = n.fatG;
        carbG          = n.carbG;
        dataSourceUsed = n.dataSource;
        assumptions    = n.assumptions;
      }
    } else {
      // Try Neon food_items (USDA-FDC)
      try {
        const rows = await db
          .select()
          .from(foodItems)
          .where(eq(foodItems.foodId, recognizedFoodId))
          .limit(1);

        if (rows.length > 0) {
          const row = rows[0];
          energyKcal     = row.energyKcal != null ? Math.round(row.energyKcal * scale) : null;
          proteinG       = row.proteinG   != null ? Math.round(row.proteinG   * scale * 10) / 10 : null;
          fatG           = row.fatG       != null ? Math.round(row.fatG       * scale * 10) / 10 : null;
          carbG          = row.carbG      != null ? Math.round(row.carbG      * scale * 10) / 10 : null;
          dataSourceUsed = row.dataSource;
          assumptions    =
            `Nilai per 100 g dari ${row.dataSource}. Porsi diasumsikan ${portionG} g.`;
        }
      } catch (err) {
        // Non-fatal: save log without nutrition values
        console.warn("[food-scanner/save] Neon lookup failed:", err instanceof Error ? err.message : err);
      }
    }
  }

  // 4. Write to DB
  try {
    const [saved] = await db.insert(foodScanLogs).values({
      userId,
      recognizedFoodId:    recognizedFoodId ?? null,
      recognizedFoodName:  recognizedFoodName.trim().slice(0, 200),
      candidatesJson:      candidatesJson ?? null,
      portionG,
      portionLabel:        portionLabel?.trim().slice(0, 100) ?? null,
      estimatedEnergyKcal: energyKcal ?? null,
      estimatedProteinG:   proteinG   ?? null,
      estimatedFatG:       fatG       ?? null,
      estimatedCarbG:      carbG      ?? null,
      estimatedFiberG:     body.estimatedFiberG ?? null,
      modelUsed:           modelUsed?.slice(0, 100)      ?? "gemini-flash-lite-latest",
      confidenceNote:      confidenceNote?.slice(0, 50)  ?? null,
      dataSourceUsed:      dataSourceUsed                 ?? null,
      dataStatus:          body.dataStatus?.slice(0, 30) ?? "database_verified",
      energyRange:         body.energyRange?.slice(0, 80) ?? null,
      assumptions:         assumptions?.slice(0, 1000)   ?? null,
      explanationJson:     body.explanationJson ?? null,
    }).returning({ id: foodScanLogs.id });

    return Response.json({ id: saved.id });
  } catch (err) {
    console.error("[food-scanner/save] DB error:", err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Gagal menyimpan hasil scan. Coba lagi." }, { status: 500 });
  }
}
