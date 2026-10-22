import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getLevelFromExp, getTierFromExp } from "@/lib/exp-system";

export const runtime = "nodejs";

const WINDOW_DAYS: Record<string, number | null> = {
  weekly: 7,
  monthly: 30,
  lifetime: null,
};

interface RawLeaderboardRow {
  rank: number | string;
  user_id: string;
  total_exp: number | string;
  display_name: string;
}

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalExp: number;
  tier: string;
  tierIcon: string;
  level: number;
  levelTitle: string;
}

function isRawLeaderboardRow(value: unknown): value is RawLeaderboardRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (typeof row.rank === "number" || typeof row.rank === "string") &&
    typeof row.user_id === "string" &&
    (typeof row.total_exp === "number" || typeof row.total_exp === "string") &&
    typeof row.display_name === "string";
}

function toEntry(row: RawLeaderboardRow): LeaderboardEntry {
  const totalExp = Number(row.total_exp);
  const tier = getTierFromExp(totalExp);
  const level = getLevelFromExp(totalExp);
  return {
    rank: Number(row.rank),
    displayName: row.display_name.trim() || "Pelajar",
    totalExp,
    tier: tier.name,
    tierIcon: tier.icon,
    level: level.level,
    levelTitle: level.title,
  };
}

function parsePositiveInteger(value: string | null, fallback: number, max: number): number | null {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) return null;
  return parsed;
}

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const windowParam = (params.get("window") ?? "weekly").toLowerCase();
  const days = WINDOW_DAYS[windowParam];
  if (days === undefined) {
    return Response.json({ error: "Parameter window tidak valid." }, { status: 400 });
  }

  const limit = parsePositiveInteger(params.get("limit"), 50, 100);
  const offsetValue = params.get("offset");
  const offset = offsetValue === null
    ? 0
    : /^\d+$/.test(offsetValue) && Number.isSafeInteger(Number(offsetValue))
      ? Number(offsetValue)
      : null;
  if (limit === null || offset === null) {
    return Response.json({ error: "Parameter limit atau offset tidak valid." }, { status: 400 });
  }

  const timeFilter = days === null
    ? sql``
    : sql`AND l.created_at >= NOW() - (${days} * INTERVAL '1 day')`;

  try {
    const session = await auth();
    const myUserId = session?.user?.id ?? null;

    const rankedResult = await db.execute(sql`
      WITH ranked AS (
        SELECT
          l.user_id,
          SUM(l.delta)::int AS total_exp,
          ROW_NUMBER() OVER (
            ORDER BY SUM(l.delta) DESC, l.user_id ASC
          ) AS rank
        FROM user_exp_ledger l
        INNER JOIN users u ON u.id = l.user_id AND u.role = 'student'
        WHERE l.verified = TRUE ${timeFilter}
        GROUP BY l.user_id
      )
      SELECT
        r.rank,
        r.user_id,
        r.total_exp,
        COALESCE(NULLIF(BTRIM(u.display_name), ''), NULLIF(BTRIM(u.username), ''), 'Pelajar') AS display_name
      FROM ranked r
      INNER JOIN users u ON u.id = r.user_id
      ORDER BY r.rank ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(DISTINCT l.user_id)::int AS total
      FROM user_exp_ledger l
      INNER JOIN users u ON u.id = l.user_id AND u.role = 'student'
      WHERE l.verified = TRUE ${timeFilter}
    `);
    const total = Number((countResult.rows[0] as { total?: number } | undefined)?.total ?? 0);
    const rawEntries: RawLeaderboardRow[] = [];
    for (const row of rankedResult.rows) {
      if (!isRawLeaderboardRow(row)) {
        throw new Error("Leaderboard query returned an invalid row.");
      }
      rawEntries.push(row);
    }
    const entries = rawEntries.map(toEntry);

    const myEntry = rawEntries.find((entry) => entry.user_id === myUserId);
    let serializedMyEntry = myEntry ? toEntry(myEntry) : null;
    if (myUserId && !serializedMyEntry) {
      const myRankResult = await db.execute(sql`
        WITH ranked AS (
          SELECT
            l.user_id,
            SUM(l.delta)::int AS total_exp,
            ROW_NUMBER() OVER (
              ORDER BY SUM(l.delta) DESC, l.user_id ASC
            ) AS rank
          FROM user_exp_ledger l
          INNER JOIN users u ON u.id = l.user_id AND u.role = 'student'
          WHERE l.verified = TRUE ${timeFilter}
          GROUP BY l.user_id
        )
        SELECT
          r.rank,
          r.user_id,
          r.total_exp,
          COALESCE(NULLIF(BTRIM(u.display_name), ''), NULLIF(BTRIM(u.username), ''), 'Pelajar') AS display_name
        FROM ranked r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.user_id = ${myUserId}
        LIMIT 1
      `);
      const rawMyEntry: unknown = myRankResult.rows[0];
      if (rawMyEntry !== undefined) {
        if (!isRawLeaderboardRow(rawMyEntry)) {
          throw new Error("Leaderboard query returned an invalid user row.");
        }
        serializedMyEntry = toEntry(rawMyEntry);
      }
    }

    return Response.json({
      window: windowParam,
      total,
      entries,
      myRank: serializedMyEntry?.rank ?? null,
      myEntry: serializedMyEntry,
    });
  } catch (err) {
    console.error("[leaderboard] Failed to load verified leaderboard:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal memuat leaderboard." }, { status: 500 });
  }
}
