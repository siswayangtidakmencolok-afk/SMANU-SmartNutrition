/**
 * /api/admin/ml-stats
 *
 * GET — Internal ML dashboard data for the SMANU team.
 *
 * REQUIRES: authenticated session with role = 'admin'
 * (Role is set directly in DB — there is no self-service role upgrade.)
 *
 * Returns:
 *   - candidate_foods counts by status
 *   - food_scan_logs aggregate stats
 *   - photo_contributions counts by status
 *   - recent scan logs (last 10, anonymized)
 */

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { candidateFoods, foodScanLogs, photoContributions, users } from "@/lib/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  // 1. Auth + role check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }

  // Look up role from DB
  const userRow = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userRow.length || userRow[0].role !== "admin") {
    return Response.json({ error: "Akses ditolak. Halaman khusus tim SMANU." }, { status: 403 });
  }

  // 2. Candidate foods by status
  const candidateStats = await db
    .select({
      status: candidateFoods.status,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(candidateFoods)
    .groupBy(candidateFoods.status);

  // 3. Scan logs aggregate
  const scanAgg = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      withFoodId: sql<number>`COUNT(${foodScanLogs.recognizedFoodId})::int`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${foodScanLogs.userId})::int`,
      avgPortionG: sql<number>`ROUND(AVG(${foodScanLogs.portionG}))::int`,
    })
    .from(foodScanLogs);

  // 4. Recent scan logs (anonymized — no userId, no candidatesJson)
  const recentScans = await db
    .select({
      id: foodScanLogs.id,
      recognizedFoodName: foodScanLogs.recognizedFoodName,
      portionG: foodScanLogs.portionG,
      dataSourceUsed: foodScanLogs.dataSourceUsed,
      modelUsed: foodScanLogs.modelUsed,
      confidenceNote: foodScanLogs.confidenceNote,
      scannedAt: foodScanLogs.scannedAt,
    })
    .from(foodScanLogs)
    .orderBy(desc(foodScanLogs.scannedAt))
    .limit(10);

  // 5. Photo contributions by status
  const photoStats = await db
    .select({
      status: photoContributions.status,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(photoContributions)
    .groupBy(photoContributions.status);

  // 6. Model usage breakdown
  const modelStats = await db
    .select({
      modelUsed: foodScanLogs.modelUsed,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(foodScanLogs)
    .groupBy(foodScanLogs.modelUsed);

  return Response.json({
    candidateFoods: candidateStats,
    scanLogs: {
      ...scanAgg[0],
      byModel: modelStats,
    },
    photoContributions: photoStats,
    recentScans: recentScans.map((s) => ({
      ...s,
      scannedAt: s.scannedAt.toISOString(),
    })),
    generatedAt: new Date().toISOString(),
  });
}
