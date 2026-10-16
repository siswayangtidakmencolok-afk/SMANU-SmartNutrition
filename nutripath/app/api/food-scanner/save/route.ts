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
 * }
 *
 * RESPONSE 200: { id: string }
 * RESPONSE 401: not authenticated
 * RESPONSE 400: validation error
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { foodScanLogs } from "@/lib/db/schema";
import { estimateNutrition } from "@/lib/food-database";

export const runtime = "nodejs";

interface SaveBody {
  recognizedFoodId?:   string | null;
  recognizedFoodName:  string;
  candidatesJson?:     unknown;
  portionG:            number;
  portionLabel:        string;
  modelUsed?:          string;
  confidenceNote?:     string;
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

  const { recognizedFoodId, recognizedFoodName, candidatesJson, portionG, portionLabel,
          modelUsed, confidenceNote } = body;

  if (!recognizedFoodName?.trim()) {
    return Response.json({ error: "recognizedFoodName diperlukan." }, { status: 400 });
  }
  if (typeof portionG !== "number" || portionG <= 0 || portionG > 5000) {
    return Response.json({ error: "portionG harus angka positif (max 5000 g)." }, { status: 400 });
  }

  // 3. Compute nutrition estimate if food is in DB
  let nutrition: ReturnType<typeof estimateNutrition> = null;
  let dataSourceUsed: string | undefined;
  let assumptions: string | undefined;

  if (recognizedFoodId) {
    nutrition = estimateNutrition(recognizedFoodId, portionG);
    if (nutrition) {
      dataSourceUsed = nutrition.dataSource;
      assumptions    = nutrition.assumptions;
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
      estimatedEnergyKcal: nutrition?.energyKcal ?? null,
      estimatedProteinG:   nutrition?.proteinG   ?? null,
      estimatedFatG:       nutrition?.fatG       ?? null,
      estimatedCarbG:      nutrition?.carbG      ?? null,
      modelUsed:           modelUsed?.slice(0, 100)      ?? "gemini-2.0-flash",
      confidenceNote:      confidenceNote?.slice(0, 50)  ?? null,
      dataSourceUsed:      dataSourceUsed                 ?? null,
      assumptions:         assumptions?.slice(0, 1000)   ?? null,
    }).returning({ id: foodScanLogs.id });

    return Response.json({ id: saved.id });
  } catch (err) {
    console.error("[food-scanner/save] DB error:", err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Gagal menyimpan hasil scan. Coba lagi." }, { status: 500 });
  }
}
