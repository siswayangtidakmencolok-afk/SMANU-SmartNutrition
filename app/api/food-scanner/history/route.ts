/**
 * /api/food-scanner/history
 *
 * GET /api/food-scanner/history?limit=20&offset=0
 *
 * Returns the authenticated user's food scan log history, ordered newest first.
 * Photos are never stored — only metadata and nutrition snapshots.
 *
 * REQUIRES: valid Auth.js session.
 *
 * RESPONSE 200:
 * {
 *   scans: ScanLogEntry[];
 *   total: number;
 *   limit: number;
 *   offset: number;
 * }
 *
 * DELETE /api/food-scanner/history/:id  (via query param ?id=<scanId>)
 * Deletes a single scan log owned by the authenticated user.
 *
 * RESPONSE 401: not authenticated
 * RESPONSE 403: scan not owned by this user
 * RESPONSE 404: scan not found
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { foodScanLogs } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

export const runtime = "nodejs";

export interface ScanLogEntry {
  id:                  string;
  recognizedFoodName:  string;
  recognizedFoodId:    string | null;
  portionG:            number | null;
  portionLabel:        string | null;
  estimatedEnergyKcal: number | null;
  estimatedProteinG:   number | null;
  estimatedFatG:       number | null;
  estimatedCarbG:      number | null;
  estimatedFiberG:     number | null;
  dataSourceUsed:      string | null;
  dataStatus:          string | null;
  energyRange:         string | null;
  confidenceNote:      string | null;
  modelUsed:           string | null;
  assumptions:         string | null;
  explanationJson:     unknown;   // AiSections object | null
  scannedAt:           string;    // ISO string
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const rawLimit  = parseInt(searchParams.get("limit")  ?? "20", 10);
  const rawOffset = parseInt(searchParams.get("offset") ?? "0",  10);
  const limit  = Math.min(Math.max(rawLimit,  1), 100);
  const offset = Math.max(rawOffset, 0);

  try {
    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id:                  foodScanLogs.id,
          recognizedFoodName:  foodScanLogs.recognizedFoodName,
          recognizedFoodId:    foodScanLogs.recognizedFoodId,
          portionG:            foodScanLogs.portionG,
          portionLabel:        foodScanLogs.portionLabel,
          estimatedEnergyKcal: foodScanLogs.estimatedEnergyKcal,
          estimatedProteinG:   foodScanLogs.estimatedProteinG,
          estimatedFatG:       foodScanLogs.estimatedFatG,
          estimatedCarbG:      foodScanLogs.estimatedCarbG,
          estimatedFiberG:     foodScanLogs.estimatedFiberG,
          dataSourceUsed:      foodScanLogs.dataSourceUsed,
          dataStatus:          foodScanLogs.dataStatus,
          energyRange:         foodScanLogs.energyRange,
          confidenceNote:      foodScanLogs.confidenceNote,
          modelUsed:           foodScanLogs.modelUsed,
          assumptions:         foodScanLogs.assumptions,
          explanationJson:     foodScanLogs.explanationJson,
          scannedAt:           foodScanLogs.scannedAt,
        })
        .from(foodScanLogs)
        .where(eq(foodScanLogs.userId, userId))
        .orderBy(desc(foodScanLogs.scannedAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ total: count() })
        .from(foodScanLogs)
        .where(eq(foodScanLogs.userId, userId)),
    ]);

    const scans: ScanLogEntry[] = rows.map((r) => ({
      ...r,
      scannedAt: r.scannedAt.toISOString(),
    }));

    return Response.json({ scans, total: total ?? 0, limit, offset });
  } catch (err) {
    console.error("[food-scanner/history] GET error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal mengambil riwayat scan." }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("id")?.trim();
  if (!scanId) {
    return Response.json({ error: "id diperlukan." }, { status: 400 });
  }

  try {
    // Verify ownership before delete
    const existing = await db
      .select({ id: foodScanLogs.id, userId: foodScanLogs.userId })
      .from(foodScanLogs)
      .where(eq(foodScanLogs.id, scanId))
      .limit(1);

    if (existing.length === 0) {
      return Response.json({ error: "Scan tidak ditemukan." }, { status: 404 });
    }
    if (existing[0].userId !== userId) {
      return Response.json(
        { error: "Tidak diizinkan menghapus scan milik pengguna lain." },
        { status: 403 }
      );
    }

    await db
      .delete(foodScanLogs)
      .where(and(eq(foodScanLogs.id, scanId), eq(foodScanLogs.userId, userId)));

    return Response.json({ deleted: true, id: scanId });
  } catch (err) {
    console.error("[food-scanner/history] DELETE error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal menghapus scan." }, { status: 500 });
  }
}
