import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  achievements,
  foodScanLogs,
  userAchievements,
  userExpLedger,
} from "@/lib/db/schema";
import { achievementIdempotencyKey } from "@/lib/exp-system";

interface AchievementActivityStats {
  activityType: string;
  count: number;
  perfect: number;
  passing: number;
}

export interface NewlyUnlockedAchievement {
  key: string;
  title: string;
  icon: string;
  expReward: number;
}

export interface AchievementCheckResult {
  newAchievements: NewlyUnlockedAchievement[];
  totalExpAwarded: number;
}

function eligibleAchievementKeys(stats: {
  totalExp: number;
  scanCount: number;
  questCount: number;
  questPerfect: number;
  challengeCount: number;
  challengePass: number;
  domainCount: number;
}): string[] {
  const keys: string[] = [];

  if (stats.scanCount >= 1) keys.push("first_scan");
  if (stats.scanCount >= 5) keys.push("scan_5");
  if (stats.scanCount >= 20) keys.push("scan_20");

  if (stats.questCount >= 1) keys.push("first_quest");
  if (stats.questPerfect >= 1) keys.push("quest_perfect");
  if (stats.questCount >= 5) keys.push("quest_5");
  if (stats.questCount >= 20) keys.push("quest_20");

  if (stats.challengeCount >= 1) keys.push("first_challenge");
  if (stats.challengePass >= 1) keys.push("challenge_pass");
  if (stats.challengeCount >= 10) keys.push("challenge_10");

  if (stats.totalExp >= 250) keys.push("tier_silver");
  if (stats.totalExp >= 500) keys.push("tier_gold");
  if (stats.totalExp >= 900) keys.push("tier_platinum");
  if (stats.totalExp >= 1500) keys.push("tier_diamond");
  if (stats.totalExp >= 2500) keys.push("tier_master");
  if (stats.totalExp >= 4000) keys.push("tier_scholar_elite");
  if (stats.domainCount >= 3) keys.push("multi_domain");

  return keys;
}

export async function checkAchievementsForUser(userId: string): Promise<AchievementCheckResult> {
  const [expResult, activityResult, scanResult, domainResult] = await Promise.all([
    db
      .select({ total: sql<number>`COALESCE(SUM(${userExpLedger.delta}), 0)::int` })
      .from(userExpLedger)
      .where(and(eq(userExpLedger.userId, userId), eq(userExpLedger.verified, true))),
    db.execute(sql`
      SELECT
        activity_type AS "activityType",
        COUNT(*)::int AS count,
        COUNT(CASE WHEN score = 100 THEN 1 END)::int AS perfect,
        COUNT(CASE WHEN score >= 70 THEN 1 END)::int AS passing
      FROM user_activities
      WHERE user_id = ${userId} AND verified = TRUE
      GROUP BY activity_type
    `),
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(foodScanLogs)
      .where(eq(foodScanLogs.userId, userId)),
    db.execute(sql`
      SELECT COUNT(DISTINCT domain)::int AS count
      FROM user_activities
      WHERE user_id = ${userId} AND verified = TRUE AND domain IS NOT NULL
    `),
  ]);

  const activityStats = activityResult.rows as unknown as AchievementActivityStats[];
  const domainCount = Number((domainResult.rows[0] as { count?: number } | undefined)?.count ?? 0);
  const stats = {
    totalExp: expResult[0]?.total ?? 0,
    scanCount: scanResult[0]?.count ?? 0,
    questCount: 0,
    questPerfect: 0,
    challengeCount: 0,
    challengePass: 0,
    domainCount,
  };

  for (const row of activityStats) {
    if (row.activityType === "quest") {
      stats.questCount = Number(row.count);
      stats.questPerfect = Number(row.perfect);
    } else if (row.activityType === "challenge") {
      stats.challengeCount = Number(row.count);
      stats.challengePass = Number(row.passing);
    }
  }

  const result: AchievementCheckResult = { newAchievements: [], totalExpAwarded: 0 };
  const processed = new Set<string>();

  while (true) {
    const eligible = eligibleAchievementKeys(stats).filter((key) => !processed.has(key));
    if (eligible.length === 0) break;
    eligible.forEach((key) => processed.add(key));

    const definitions = await db
      .select()
      .from(achievements)
      .where(inArray(achievements.key, eligible));

    for (const definition of definitions) {
      const idempotencyKey = achievementIdempotencyKey(userId, definition.key);
      const [insertedAchievement] = await db
        .insert(userAchievements)
        .values({ userId, achievementKey: definition.key, idempotencyKey })
        .onConflictDoNothing()
        .returning({ id: userAchievements.id });

      if (insertedAchievement) {
        result.newAchievements.push({
          key: definition.key,
          title: definition.title,
          icon: definition.icon,
          expReward: definition.expReward,
        });
      }

      if (definition.expReward <= 0) continue;

      const [insertedExp] = await db
        .insert(userExpLedger)
        .values({
          userId,
          delta: definition.expReward,
          reason: "achievement_unlock",
          activityRef: null,
          idempotencyKey: `${idempotencyKey}:exp`,
          verified: true,
        })
        .onConflictDoNothing()
        .returning({ delta: userExpLedger.delta });

      if (insertedExp) {
        result.totalExpAwarded += insertedExp.delta;
        stats.totalExp += insertedExp.delta;
      }
    }
  }

  return result;
}
