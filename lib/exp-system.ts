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

export interface TierInfo {
  name: string;
  icon: string;
  minExp: number;
  maxExp: number;
  color: string;
  borderColor: string;
  textColor: string;
}

export const TIERS: TierInfo[] = [
  { name: "Bronze",        icon: "🥉", minExp: 0,    maxExp: 250,  color: "bg-amber-900/20", borderColor: "border-amber-700/40", textColor: "text-amber-500" },
  { name: "Silver",        icon: "🥈", minExp: 250,  maxExp: 500,  color: "bg-slate-400/10", borderColor: "border-slate-400/40", textColor: "text-slate-300" },
  { name: "Gold",          icon: "🥇", minExp: 500,  maxExp: 900,  color: "bg-yellow-500/10", borderColor: "border-yellow-500/40", textColor: "text-yellow-300" },
  { name: "Platinum",      icon: "💎", minExp: 900,  maxExp: 1500, color: "bg-cyan-500/10", borderColor: "border-cyan-500/40", textColor: "text-cyan-300" },
  { name: "Diamond",       icon: "🔷", minExp: 1500, maxExp: 2500, color: "bg-blue-500/10", borderColor: "border-blue-500/40", textColor: "text-blue-300" },
  { name: "Master",        icon: "👑", minExp: 2500, maxExp: 4000, color: "bg-violet-500/10", borderColor: "border-violet-500/40", textColor: "text-violet-300" },
  { name: "Scholar Elite", icon: "🌟", minExp: 4000, maxExp: 0,    color: "bg-emerald-500/10", borderColor: "border-emerald-500/40", textColor: "text-emerald-300" },
];

export function getTierFromExp(totalExp: number): TierInfo & {
  progressPct: number;
  expToNextTier: number | null;
} {
  const safeExp = Math.max(0, totalExp);
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (safeExp >= tier.minExp) current = tier;
    else break;
  }

  const nextTier = TIERS.find((tier) => tier.minExp > current.minExp) ?? null;
  const range = nextTier ? nextTier.minExp - current.minExp : null;

  return {
    ...current,
    progressPct: range ? Math.min(100, Math.round(((safeExp - current.minExp) / range) * 100)) : 100,
    expToNextTier: nextTier ? nextTier.minExp - safeExp : null,
  };
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
  | "achievement_unlock"
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

export function achievementIdempotencyKey(userId: string, achievementKey: string): string {
  return `${userId}:achievement:${achievementKey}`;
}
