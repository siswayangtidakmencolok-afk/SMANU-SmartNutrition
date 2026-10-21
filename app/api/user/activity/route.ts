/**
 * /api/user/activity
 *
 * POST — Record a learning activity and award EXP.
 *
 * Idempotent: duplicate idempotency keys are silently ignored (DB unique index).
 * The caller should generate a stable idempotency key from:
 *   - quest:     `${userId}:quest:${questResultId}`
 *   - challenge: `${userId}:challenge:${challengeResultId}`
 *   - scan_save: `${userId}:scan_save:${scanLogId}`
 *
 * REQUEST body:
 * {
 *   activityType:    'quest' | 'challenge' | 'scan_save',
 *   activityLabel:   string,           // human-readable label
 *   idempotencyKey:  string,           // stable key to prevent duplicates
 *   sourceRef?:      string,           // source record id
 *   score?:          number,           // 0–100
 *   domain?:         string,
 * }
 *
 * RESPONSE 200: { activityId: string, expAwarded: number, newTotalExp: number, alreadyRecorded: boolean }
 * RESPONSE 401: not authenticated
 * RESPONSE 400: validation error
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userActivities, userExpLedger } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  EXP_RULES,
  type ExpReason,
} from "@/lib/exp-system";

export const runtime = "nodejs";

interface ActivityBody {
  activityType:   "quest" | "challenge" | "scan_save";
  activityLabel:  string;
  idempotencyKey: string;
  sourceRef?:     string;
  score?:         number;
  domain?:        string;
}

function computeExpAward(type: ActivityBody["activityType"], score?: number): {
  entries: { delta: number; reason: ExpReason }[];
  total: number;
} {
  const entries: { delta: number; reason: ExpReason }[] = [];

  if (type === "quest") {
    entries.push({ delta: EXP_RULES.QUEST_COMPLETE, reason: "quest_complete" });
    if (score === 100) {
      entries.push({ delta: EXP_RULES.QUEST_PERFECT, reason: "quest_perfect" });
    }
  } else if (type === "challenge") {
    entries.push({ delta: EXP_RULES.CHALLENGE_COMPLETE, reason: "challenge_complete" });
    if (typeof score === "number" && score >= 70) {
      entries.push({ delta: EXP_RULES.CHALLENGE_PASS, reason: "challenge_pass" });
    }
  } else if (type === "scan_save") {
    entries.push({ delta: EXP_RULES.SCAN_SAVE, reason: "scan_save" });
  }

  return { entries, total: entries.reduce((s, e) => s + e.delta, 0) };
}

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Parse body
  let body: ActivityBody;
  try {
    body = await req.json() as ActivityBody;
  } catch {
    return Response.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  const { activityType, activityLabel, idempotencyKey, sourceRef, score, domain } = body;

  if (!["quest", "challenge", "scan_save"].includes(activityType)) {
    return Response.json({ error: "activityType tidak valid." }, { status: 400 });
  }
  if (!activityLabel?.trim()) {
    return Response.json({ error: "activityLabel diperlukan." }, { status: 400 });
  }
  if (!idempotencyKey?.trim()) {
    return Response.json({ error: "idempotencyKey diperlukan." }, { status: 400 });
  }

  // 3. Attempt to insert activity (idempotency enforced by DB unique index)
  let activityId: string;
  let alreadyRecorded = false;

  try {
    const [inserted] = await db
      .insert(userActivities)
      .values({
        userId,
        activityType,
        activityLabel: activityLabel.trim().slice(0, 200),
        sourceRef:     sourceRef?.slice(0, 200),
        score:         typeof score === "number" ? Math.max(0, Math.min(100, score)) : null,
        domain:        domain?.slice(0, 100),
        idempotencyKey: idempotencyKey.trim().slice(0, 300),
      })
      .onConflictDoNothing()
      .returning({ id: userActivities.id });

    if (!inserted) {
      // Already recorded — return current totals without re-awarding EXP
      alreadyRecorded = true;
      // Fetch the existing activity id
      const existing = await db
        .select({ id: userActivities.id })
        .from(userActivities)
        .where(eq(userActivities.idempotencyKey, idempotencyKey))
        .limit(1);
      activityId = existing[0]?.id ?? "unknown";
    } else {
      activityId = inserted.id;
    }
  } catch (err) {
    console.error("[activity] DB insert error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal mencatat aktivitas." }, { status: 500 });
  }

  // 4. Award EXP (skip if already recorded)
  let expAwarded = 0;

  if (!alreadyRecorded) {
    const { entries } = computeExpAward(activityType, score);

    for (const entry of entries) {
      const expKey = `${idempotencyKey}:${entry.reason}`;
      try {
        await db
          .insert(userExpLedger)
          .values({
            userId,
            delta:          entry.delta,
            reason:         entry.reason,
            activityRef:    activityId,
            idempotencyKey: expKey,
          })
          .onConflictDoNothing();

        expAwarded += entry.delta;
      } catch (err) {
        // Non-fatal: log but don't fail the request
        console.warn("[activity] EXP insert skipped:", err instanceof Error ? err.message : err);
      }
    }
  }

  // 5. Get new total EXP
  const expResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${userExpLedger.delta}), 0)::int` })
    .from(userExpLedger)
    .where(eq(userExpLedger.userId, userId));

  const newTotalExp = expResult[0]?.total ?? 0;

  return Response.json({ activityId, expAwarded, newTotalExp, alreadyRecorded });
}
