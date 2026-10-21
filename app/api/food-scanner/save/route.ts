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
 *   // AI estimate fields (present when dataStatus === "ai_estimate")
 *   dataStatus?:         "database_verified" | "ai_estimate" | "unavailable",
 *   dataSourceUsed?:     string,
 *   energyRange?:        string | null,
 *   estimatedEnergyKcal?: number | null,
 *   estimatedProteinG?:   number | null,
 *   estimatedFatG?:       number | null,
 *   estimatedCarbG?:      number | null,
 *   estimatedFiberG?:     number | null,
 *   assumptions?:         string,
 *   explanationJson?:     unknown,
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

export const runtime = "nodejs";

interface SaveBody {
  recognizedFoodId?:    string | null;
  recognizedFoodName:   string;
  candidatesJson?:      unknown;
  portionG:             number;
  portionLabel:         string;
  modelUsed?:           string;
  confidenceNote?:      string;
  // AI-estimate fields
  dataStatus?:          string | null;
  dataSourceUsed?:      string | null;
  energyRange?:         string | null;
  estimatedEnergyKcal?: number | null;
  estimatedProteinG?:   number | null;
  estimatedFatG?:       number | null;
  estimatedCarbG?:      number | null;
  estimatedFiberG?:     number | null;
  assumptions?:         string | null;
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
    dataStatus, dataSourceUsed, energyRange,
    estimatedEnergyKcal, estimatedProteinG, estimatedFatG, estimatedCarbG, estimatedFiberG,
    assumptions, explanationJson,
  } = body;

  if (!recognizedFoodName?.trim()) {
    return Response.json({ error: "recognizedFoodName diperlukan." }, { status: 400 });
  }
  if (typeof portionG !== "number" || portionG <= 0 || portionG > 5000) {
    return Response.json({ error: "portionG harus angka positif (max 5000 g)." }, { status: 400 });
  }

  // 3. Write to DB
  try {
    const [saved] = await db.insert(foodScanLogs).values({
      userId,
      recognizedFoodId:    recognizedFoodId ?? null,
      recognizedFoodName:  recognizedFoodName.trim().slice(0, 200),
      candidatesJson:      candidatesJson ?? null,
      portionG,
      portionLabel:        portionLabel?.trim().slice(0, 100) ?? null,
      modelUsed:           modelUsed?.slice(0, 100)      ?? "gemini-flash-lite-latest",
      confidenceNote:      confidenceNote?.slice(0, 50)  ?? null,
      // AI estimate / DB fields — all optional
      dataStatus:          dataStatus?.slice(0, 50)      ?? "database_verified",
      dataSourceUsed:      dataSourceUsed?.slice(0, 100) ?? null,
      energyRange:         energyRange?.slice(0, 80)     ?? null,
      estimatedEnergyKcal: typeof estimatedEnergyKcal === "number" ? estimatedEnergyKcal : null,
      estimatedProteinG:   typeof estimatedProteinG   === "number" ? estimatedProteinG   : null,
      estimatedFatG:       typeof estimatedFatG       === "number" ? estimatedFatG       : null,
      estimatedCarbG:      typeof estimatedCarbG      === "number" ? estimatedCarbG      : null,
      estimatedFiberG:     typeof estimatedFiberG     === "number" ? estimatedFiberG     : null,
      assumptions:         assumptions?.slice(0, 1000) ?? null,
      explanationJson:     explanationJson             ?? null,
    }).returning({ id: foodScanLogs.id });

    return Response.json({ id: saved.id });
  } catch (err) {
    console.error("[food-scanner/save] DB error:", err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Gagal menyimpan hasil scan. Coba lagi." }, { status: 500 });
  }
}
