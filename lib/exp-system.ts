/**
 * exp-system.ts
 *
 * EXP award rules and level computation for SMANU Learning Profile.
 *
 * Levels are computed at query time from cumulative EXP — no level column stored.
 * EXP values are intentionally modest to avoid inflated expectations.
 *
 * Rules:
 *   - Quest complete (any score)   → 20 EXP
 *   - Quest perfect (100%)         → +30 EXP bonus (total 50)
 *   - Challenge complete            → 15 EXP
 *   - Challenge pass (score ≥ 70)  → +10 EXP bonus (total 25)
 *   - Scan save (confirmed result) → 5 EXP
 *
 * Idempotency: each activity generates one unique key;
 * the DB unique index on (user_id, idempotency_key) enforces no double-award.
 */

// ── Level thresholds ─────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  title: string;
  minExp: number;
  maxExp: number;  // exclusive upper bound (0 for max level = no cap)
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Pemula Gizi",       minExp: 0,    maxExp: 100  },
  { level: 2, title: "Pelajar Sehat",     minExp: 100,  maxExp: 250  },
  { level: 3, title: "Nutrisi Aktif",     minExp: 250,  maxExp: 500  },
  { level: 4, title: "Ahli Gizi Muda",    minExp: 500,  maxExp: 900  },
  { level: 5, title: "Master Nutrisi",    minExp: 900,  maxExp: 0    },
];

export function getLevelFromExp(totalExp: number): LevelInfo & { progressPct: number; expToNext: number | null } {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalExp >= lvl.minExp) current = lvl;
    else break;
  }

  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  const expInLevel = totalExp - current.minExp;
  const rangeSize = next ? next.minExp - current.minExp : null;
  const progressPct = rangeSize ? Math.min(100, Math.round((expInLevel / rangeSize) * 100)) : 100;
  const expToNext = next ? next.minExp - totalExp : null;

  return { ...current, progressPct, expToNext };
}

// ── EXP award amounts ────────────────────────────────────────────────────────

export const EXP_RULES = {
  QUEST_COMPLETE:    20,
  QUEST_PERFECT:     30,   // bonus on top of QUEST_COMPLETE (score === 100)
  CHALLENGE_COMPLETE: 15,
  CHALLENGE_PASS:    10,   // bonus on top of CHALLENGE_COMPLETE (score >= 70)
  SCAN_SAVE:          5,
} as const;

export type ExpReason =
  | "quest_complete"
  | "quest_perfect"
  | "challenge_complete"
  | "challenge_pass"
  | "scan_save"
  | "admin_adjustment";

// ── Idempotency key builders ─────────────────────────────────────────────────

export function questIdempotencyKey(userId: string, questResultId: string): string {
  return `${userId}:quest:${questResultId}`;
}

export function challengeIdempotencyKey(userId: string, challengeResultId: string): string {
  return `${userId}:challenge:${challengeResultId}`;
}

export function scanSaveIdempotencyKey(userId: string, scanLogId: string): string {
  return `${userId}:scan_save:${scanLogId}`;
}
