/**
 * /api/user/learning-profile
 *
 * GET — Returns the authenticated user's DB-backed learning profile:
 *   - total EXP (sum of exp ledger)
 *   - current level + progress
 *   - recent activities (last 20)
 *   - activity counts by type
 *
 * REQUIRES authenticated session.
 *
 * RESPONSE 200: LearningProfileResponse
 * RESPONSE 401: not authenticated
 */

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userActivities, userExpLedger } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getLevelFromExp } from "@/lib/exp-system";

export const runtime = "nodejs";

export interface ActivityRow {
  id: string;
  activityType: string;
  activityLabel: string;
  score: number | null;
  domain: string | null;
  occurredAt: string;
}

export interface LearningProfileResponse {
  totalExp: number;
  level: number;
  levelTitle: string;
  progressPct: number;
  expToNext: number | null;
  totalActivities: number;
  questCount: number;
  challengeCount: number;
  scanCount: number;
  recentActivities: ActivityRow[];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }
  const userId = session.user.id;

  // 1. Sum EXP from ledger
  const expResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${userExpLedger.delta}), 0)::int` })
    .from(userExpLedger)
    .where(eq(userExpLedger.userId, userId));

  const totalExp = expResult[0]?.total ?? 0;
  const levelInfo = getLevelFromExp(totalExp);

  // 2. Count activities by type
  const countResult = await db
    .select({
      activityType: userActivities.activityType,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(userActivities)
    .where(eq(userActivities.userId, userId))
    .groupBy(userActivities.activityType);

  let questCount = 0;
  let challengeCount = 0;
  let scanCount = 0;
  let totalActivities = 0;

  for (const row of countResult) {
    totalActivities += row.count;
    if (row.activityType === "quest") questCount = row.count;
    else if (row.activityType === "challenge") challengeCount = row.count;
    else if (row.activityType === "scan_save") scanCount = row.count;
  }

  // 3. Recent activities
  const recent = await db
    .select({
      id: userActivities.id,
      activityType: userActivities.activityType,
      activityLabel: userActivities.activityLabel,
      score: userActivities.score,
      domain: userActivities.domain,
      occurredAt: userActivities.occurredAt,
    })
    .from(userActivities)
    .where(eq(userActivities.userId, userId))
    .orderBy(desc(userActivities.occurredAt))
    .limit(20);

  const recentActivities: ActivityRow[] = recent.map((r) => ({
    id: r.id,
    activityType: r.activityType,
    activityLabel: r.activityLabel,
    score: r.score,
    domain: r.domain,
    occurredAt: r.occurredAt.toISOString(),
  }));

  const response: LearningProfileResponse = {
    totalExp,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    progressPct: levelInfo.progressPct,
    expToNext: levelInfo.expToNext,
    totalActivities,
    questCount,
    challengeCount,
    scanCount,
    recentActivities,
  };

  return Response.json(response);
}
