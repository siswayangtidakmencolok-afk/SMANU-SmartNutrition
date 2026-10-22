import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  foodScanLogs,
  userActivities,
  userExpLedger,
} from "@/lib/db/schema";
import {
  ALL_DOMAINS_LABEL,
  QUEST_QUESTION_COUNT,
  QUESTION_BANK,
} from "@/lib/nutriquest-bank";
import {
  FOOD_OPTIONS,
  SCENARIOS,
  scoreChallengeSelection,
} from "@/lib/food-challenge-data";
import { EXP_RULES, type ExpReason } from "@/lib/exp-system";
import { checkAchievementsForUser } from "@/lib/achievement-checker";

export const runtime = "nodejs";

type ActivityType = "quest" | "challenge" | "scan_save";
type ActivityBody = Record<string, unknown> & { activityType?: unknown };

interface VerifiedActivity {
  activityType: ActivityType;
  activityLabel: string;
  sourceRef: string;
  score: number | null;
  domain: string | null;
}

interface ExpEntry {
  delta: number;
  reason: ExpReason;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isAnswerMap(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function computeExpEntries(activity: VerifiedActivity): ExpEntry[] {
  if (activity.activityType === "scan_save") {
    return [{ delta: EXP_RULES.SCAN_SAVE, reason: "scan_save" }];
  }
  if (activity.activityType === "quest") {
    return activity.score === 100
      ? [
          { delta: EXP_RULES.QUEST_COMPLETE, reason: "quest_complete" },
          { delta: EXP_RULES.QUEST_PERFECT, reason: "quest_perfect" },
        ]
      : [{ delta: EXP_RULES.QUEST_COMPLETE, reason: "quest_complete" }];
  }
  return activity.score !== null && activity.score >= 70
    ? [
        { delta: EXP_RULES.CHALLENGE_COMPLETE, reason: "challenge_complete" },
        { delta: EXP_RULES.CHALLENGE_PASS, reason: "challenge_pass" },
      ]
    : [{ delta: EXP_RULES.CHALLENGE_COMPLETE, reason: "challenge_complete" }];
}

function verifyQuestSubmission(body: ActivityBody): VerifiedActivity | string {
  if (!isUuid(body.sourceRef)) return "ID percobaan NutriQuest tidak valid.";
  if (typeof body.domain !== "string") return "Domain NutriQuest tidak valid.";
  if (!isStringArray(body.questionIds) || !isAnswerMap(body.answers)) {
    return "Jawaban NutriQuest tidak valid.";
  }

  const validDomain = body.domain === ALL_DOMAINS_LABEL ||
    QUESTION_BANK.some((question) => question.domain === body.domain);
  if (!validDomain) return "Domain NutriQuest tidak dikenal.";

  const questionPool = body.domain === ALL_DOMAINS_LABEL
    ? QUESTION_BANK
    : QUESTION_BANK.filter((question) => question.domain === body.domain);
  const expectedCount = Math.min(QUEST_QUESTION_COUNT, questionPool.length);
  const selectedIds = new Set(body.questionIds);
  if (
    body.questionIds.length !== expectedCount ||
    selectedIds.size !== body.questionIds.length ||
    Object.keys(body.answers).length !== body.questionIds.length
  ) {
    return "Jumlah soal atau jawaban NutriQuest tidak sesuai.";
  }

  const questionsById = new Map(questionPool.map((question) => [question.id, question]));
  let correctAnswers = 0;
  for (const questionId of body.questionIds) {
    const question = questionsById.get(questionId);
    const answer = body.answers[questionId];
    if (!question || !question.options.includes(answer)) {
      return "Soal atau pilihan jawaban NutriQuest tidak valid.";
    }
    if (answer === question.correctAnswer) correctAnswers += 1;
  }

  const score = Math.round((correctAnswers / expectedCount) * 100);
  return {
    activityType: "quest",
    activityLabel: `NutriQuest · ${body.domain}`,
    sourceRef: body.sourceRef,
    score,
    domain: body.domain,
  };
}

function verifyChallengeSubmission(body: ActivityBody): VerifiedActivity | string {
  if (!isUuid(body.sourceRef)) return "ID percobaan Food Challenge tidak valid.";
  if (typeof body.scenarioId !== "string" || !isStringArray(body.selectedFoodIds)) {
    return "Pilihan Food Challenge tidak valid.";
  }

  const scenario = SCENARIOS.find((entry) => entry.id === body.scenarioId);
  if (!scenario) return "Skenario Food Challenge tidak dikenal.";

  const selectedIds = new Set(body.selectedFoodIds);
  if (
    body.selectedFoodIds.length < 2 ||
    selectedIds.size !== body.selectedFoodIds.length ||
    body.selectedFoodIds.some((id) => !FOOD_OPTIONS.some((food) => food.id === id))
  ) {
    return "Pilihan makanan Food Challenge tidak valid.";
  }

  const calculated = scoreChallengeSelection(body.selectedFoodIds, scenario);
  return {
    activityType: "challenge",
    activityLabel: `Food Challenge · ${scenario.title}`,
    sourceRef: body.sourceRef,
    score: calculated.score,
    domain: scenario.relatedDomains[0] ?? null,
  };
}

async function verifyScanSubmission(userId: string, sourceRef: unknown): Promise<VerifiedActivity | string> {
  if (typeof sourceRef !== "string" || !sourceRef.trim()) {
    return "ID hasil scan diperlukan.";
  }
  const [scan] = await db
    .select({
      id: foodScanLogs.id,
      recognizedFoodName: foodScanLogs.recognizedFoodName,
    })
    .from(foodScanLogs)
    .where(and(eq(foodScanLogs.id, sourceRef), eq(foodScanLogs.userId, userId)))
    .limit(1);

  if (!scan) return "Hasil scan tidak ditemukan untuk akun ini.";
  return {
    activityType: "scan_save",
    activityLabel: `Scan: ${scan.recognizedFoodName}`,
    sourceRef: scan.id,
    score: null,
    domain: null,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }
  const userId = session.user.id;

  let body: ActivityBody;
  try {
    const parsed: unknown = await req.json();
    if (!isRecord(parsed)) {
      return Response.json({ error: "Format request tidak valid." }, { status: 400 });
    }
    body = parsed;
  } catch {
    return Response.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  try {
    let verifiedActivity: VerifiedActivity | string;
    if (body.activityType === "scan_save") {
      verifiedActivity = await verifyScanSubmission(userId, body.sourceRef);
    } else if (body.activityType === "quest") {
      verifiedActivity = verifyQuestSubmission(body);
    } else if (body.activityType === "challenge") {
      verifiedActivity = verifyChallengeSubmission(body);
    } else {
      return Response.json({ error: "activityType tidak valid." }, { status: 400 });
    }

    if (typeof verifiedActivity === "string") {
      return Response.json({ error: verifiedActivity }, { status: 400 });
    }

    const { activityType, activityLabel, sourceRef, score, domain } = verifiedActivity;
    const activityKey = `${userId}:${activityType}:${sourceRef}`;
    const values = {
      userId,
      activityType,
      activityLabel,
      sourceRef,
      score,
      domain,
      idempotencyKey: activityKey,
      verified: true,
    };

    const [insertedActivity] = await db
      .insert(userActivities)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: userActivities.id });

    let activityId = insertedActivity?.id;
    const alreadyRecorded = !insertedActivity;

    if (!activityId) {
      const [existing] = await db
        .select({
          id: userActivities.id,
          activityType: userActivities.activityType,
          sourceRef: userActivities.sourceRef,
          verified: userActivities.verified,
          score: userActivities.score,
          activityLabel: userActivities.activityLabel,
          domain: userActivities.domain,
        })
        .from(userActivities)
        .where(and(
          eq(userActivities.userId, userId),
          eq(userActivities.idempotencyKey, activityKey),
        ))
        .limit(1);

      if (!existing || existing.activityType !== activityType || existing.sourceRef !== sourceRef) {
        return Response.json({ error: "Aktivitas dengan kunci yang sama tidak cocok." }, { status: 409 });
      }

      if (existing.verified) {
        if (
          existing.score !== score ||
          existing.activityLabel !== activityLabel ||
          existing.domain !== domain
        ) {
          return Response.json({ error: "Percobaan ini sudah tercatat dengan hasil berbeda." }, { status: 409 });
        }
        activityId = existing.id;
      } else {
        const [verifiedExisting] = await db
          .update(userActivities)
          .set({ activityLabel, score, domain, verified: true })
          .where(and(
            eq(userActivities.id, existing.id),
            eq(userActivities.userId, userId),
            eq(userActivities.verified, false),
          ))
          .returning({ id: userActivities.id });

        if (verifiedExisting) {
          activityId = verifiedExisting.id;
        } else {
          const [racedRecord] = await db
            .select({
              id: userActivities.id,
              verified: userActivities.verified,
              score: userActivities.score,
              activityLabel: userActivities.activityLabel,
              domain: userActivities.domain,
            })
            .from(userActivities)
            .where(and(
              eq(userActivities.userId, userId),
              eq(userActivities.idempotencyKey, activityKey),
            ))
            .limit(1);

          if (
            !racedRecord?.verified ||
            racedRecord.score !== score ||
            racedRecord.activityLabel !== activityLabel ||
            racedRecord.domain !== domain
          ) {
            return Response.json({ error: "Aktivitas sedang diproses. Coba lagi." }, { status: 409 });
          }
          activityId = racedRecord.id;
        }
      }
    }

    if (!activityId) throw new Error("Activity insert did not return an ID.");

    let expAwarded = 0;
    for (const entry of computeExpEntries(verifiedActivity)) {
      const [ledgerEntry] = await db
        .insert(userExpLedger)
        .values({
          userId,
          delta: entry.delta,
          reason: entry.reason,
          activityRef: activityId,
          idempotencyKey: `${activityKey}:verified:${entry.reason}`,
          verified: true,
        })
        .onConflictDoNothing()
        .returning({ delta: userExpLedger.delta });

      if (ledgerEntry) expAwarded += ledgerEntry.delta;
    }

    const achievementResult = await checkAchievementsForUser(userId);
    const expResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${userExpLedger.delta}), 0)::int` })
      .from(userExpLedger)
      .where(and(eq(userExpLedger.userId, userId), eq(userExpLedger.verified, true)));
    const newTotalExp = expResult[0]?.total ?? 0;

    return Response.json({
      activityId,
      expAwarded,
      achievementExpAwarded: achievementResult.totalExpAwarded,
      newTotalExp,
      alreadyRecorded,
      newAchievements: achievementResult.newAchievements,
    });
  } catch (err) {
    console.error("[activity] Failed to record verified activity:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal memverifikasi atau mencatat aktivitas." }, { status: 500 });
  }
}
