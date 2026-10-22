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
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { achievements, userActivities, userAchievements, userExpLedger } from "@/lib/db/schema";
import { getLevelFromExp, getTierFromExp } from "@/lib/exp-system";

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
  tier: string;
  tierIcon: string;
  tierProgressPct: number;
  expToNextTier: number | null;
  totalActivities: number;
  questCount: number;
  challengeCount: number;
  scanCount: number;
  domainStats: DomainActivitySummary[];
  recentActivities: ActivityRow[];
  latestQuestActivity: ActivityRow | null;
  latestChallengeActivity: ActivityRow | null;
  recentScoredActivities: ScoredActivityRow[];
  expHistory: ExpHistoryRow[];
}

export interface DomainActivitySummary {
  domain: string;
  attempts: number;
  averagePct: number;
  bestPct: number;
}

export interface ScoredActivityRow extends ActivityRow {
  activityType: "quest" | "challenge";
  score: number;
}

export interface ExpHistoryRow {
  id: string;
  delta: number;
  reason: string;
  activityType: string | null;
  activityLabel: string;
  score: number | null;
  domain: string | null;
  occurredAt: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const expResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${userExpLedger.delta}), 0)::int` })
      .from(userExpLedger)
      .where(and(eq(userExpLedger.userId, userId), eq(userExpLedger.verified, true)));

    const totalExp = expResult[0]?.total ?? 0;
    const levelInfo = getLevelFromExp(totalExp);
    const tierInfo = getTierFromExp(totalExp);

    const countResult = await db
      .select({
        activityType: userActivities.activityType,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(userActivities)
      .where(and(eq(userActivities.userId, userId), eq(userActivities.verified, true)))
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
      .where(and(eq(userActivities.userId, userId), eq(userActivities.verified, true)))
      .orderBy(desc(userActivities.occurredAt))
      .limit(20);

    const recentActivities: ActivityRow[] = recent.map((row) => ({
      id: row.id,
      activityType: row.activityType,
      activityLabel: row.activityLabel,
      score: row.score,
      domain: row.domain,
      occurredAt: row.occurredAt.toISOString(),
    }));

    const [domainRows, latestQuestRows, latestChallengeRows, recentScoreRows] = await Promise.all([
      db
        .select({
          domain: userActivities.domain,
          attempts: sql<number>`COUNT(*)::int`,
          averagePct: sql<number>`ROUND(AVG(${userActivities.score}))::int`,
          bestPct: sql<number>`MAX(${userActivities.score})::int`,
        })
        .from(userActivities)
        .where(and(
          eq(userActivities.userId, userId),
          eq(userActivities.verified, true),
          sql`${userActivities.domain} IS NOT NULL`,
          sql`${userActivities.score} IS NOT NULL`,
        ))
        .groupBy(userActivities.domain),
      db
        .select({
          id: userActivities.id,
          activityType: userActivities.activityType,
          activityLabel: userActivities.activityLabel,
          score: userActivities.score,
          domain: userActivities.domain,
          occurredAt: userActivities.occurredAt,
        })
        .from(userActivities)
        .where(and(
          eq(userActivities.userId, userId),
          eq(userActivities.verified, true),
          eq(userActivities.activityType, "quest"),
        ))
        .orderBy(desc(userActivities.occurredAt))
        .limit(1),
      db
        .select({
          id: userActivities.id,
          activityType: userActivities.activityType,
          activityLabel: userActivities.activityLabel,
          score: userActivities.score,
          domain: userActivities.domain,
          occurredAt: userActivities.occurredAt,
        })
        .from(userActivities)
        .where(and(
          eq(userActivities.userId, userId),
          eq(userActivities.verified, true),
          eq(userActivities.activityType, "challenge"),
        ))
        .orderBy(desc(userActivities.occurredAt))
        .limit(1),
      db
        .select({
          id: userActivities.id,
          activityType: userActivities.activityType,
          activityLabel: userActivities.activityLabel,
          score: userActivities.score,
          domain: userActivities.domain,
          occurredAt: userActivities.occurredAt,
        })
        .from(userActivities)
        .where(and(
          eq(userActivities.userId, userId),
          eq(userActivities.verified, true),
          inArray(userActivities.activityType, ["quest", "challenge"]),
          sql`${userActivities.score} IS NOT NULL`,
          sql`${userActivities.occurredAt} >= NOW() - INTERVAL '7 days'`,
        ))
        .orderBy(asc(userActivities.occurredAt))
        .limit(50),
    ]);

    const toActivityRow = (row: typeof recent[number]): ActivityRow => ({
      id: row.id,
      activityType: row.activityType,
      activityLabel: row.activityLabel,
      score: row.score,
      domain: row.domain,
      occurredAt: row.occurredAt.toISOString(),
    });
    const domainStats: DomainActivitySummary[] = domainRows.flatMap((row) =>
      row.domain
        ? [{
            domain: row.domain,
            attempts: Number(row.attempts),
            averagePct: Number(row.averagePct),
            bestPct: Number(row.bestPct),
          }]
        : []
    );
    const latestQuestActivity = latestQuestRows[0] ? toActivityRow(latestQuestRows[0]) : null;
    const latestChallengeActivity = latestChallengeRows[0] ? toActivityRow(latestChallengeRows[0]) : null;
    const recentScoredActivities: ScoredActivityRow[] = recentScoreRows.flatMap((row) =>
      (row.score !== null && (row.activityType === "quest" || row.activityType === "challenge"))
        ? [{ ...toActivityRow(row), activityType: row.activityType, score: row.score }]
        : []
    );

    const recentLedger = await db
      .select({
        id: userExpLedger.id,
        delta: userExpLedger.delta,
        reason: userExpLedger.reason,
        activityType: userActivities.activityType,
        activityLabel: userActivities.activityLabel,
        score: userActivities.score,
        domain: userActivities.domain,
        achievementTitle: achievements.title,
        occurredAt: userExpLedger.createdAt,
      })
      .from(userExpLedger)
      .leftJoin(userActivities, eq(userExpLedger.activityRef, userActivities.id))
      .leftJoin(
        userAchievements,
        and(
          eq(userAchievements.userId, userExpLedger.userId),
          sql`${userExpLedger.idempotencyKey} = ${userAchievements.idempotencyKey} || ':exp'`,
        ),
      )
      .leftJoin(achievements, eq(userAchievements.achievementKey, achievements.key))
      .where(and(eq(userExpLedger.userId, userId), eq(userExpLedger.verified, true)))
      .orderBy(desc(userExpLedger.createdAt))
      .limit(20);

    const expHistory: ExpHistoryRow[] = recentLedger.map((row) => ({
      id: row.id,
      delta: row.delta,
      reason: row.reason,
      activityType: row.activityType,
      activityLabel: row.activityLabel ?? (
        row.achievementTitle ? `Achievement · ${row.achievementTitle}` : "Penyesuaian EXP"
      ),
      score: row.score,
      domain: row.domain,
      occurredAt: row.occurredAt.toISOString(),
    }));

    const response: LearningProfileResponse = {
      totalExp,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      progressPct: levelInfo.progressPct,
      expToNext: levelInfo.expToNext,
      tier: tierInfo.name,
      tierIcon: tierInfo.icon,
      tierProgressPct: tierInfo.progressPct,
      expToNextTier: tierInfo.expToNextTier,
      totalActivities,
      questCount,
      challengeCount,
      scanCount,
      domainStats,
      recentActivities,
      latestQuestActivity,
      latestChallengeActivity,
      recentScoredActivities,
      expHistory,
    };

    return Response.json(response);
  } catch (err) {
    console.error("[learning-profile] Failed to load profile:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal memuat profil belajar." }, { status: 500 });
  }
}
