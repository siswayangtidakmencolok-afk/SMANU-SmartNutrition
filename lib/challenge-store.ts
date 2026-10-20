/**
 * challenge-store.ts
 *
 * Simpan dan baca hasil Food Challenge dari localStorage.
 * Menggunakan pola yang sama dengan nutriquest-store.ts.
 */

const STORAGE_KEY = "smanu_challenges_v1";
const MAX_RESULTS = 30;

export interface ChallengeResult {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  score: number;          // 0–100
  withinBudget: boolean;
  totalPrice: number;
  selectedFoodIds: string[];
  timestamp: number;
  /** Domain NutriQuest yang berkaitan */
  relatedDomains: string[];
  /** ID topik Nutrition Knowledge yang berkaitan */
  relatedKnowledgeIds: string[];
}

export function loadChallengeResults(): ChallengeResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as ChallengeResult[]).sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function saveChallengeResult(result: ChallengeResult): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadChallengeResults().filter((r) => r.id !== result.id);
    const updated = [result, ...existing].slice(0, MAX_RESULTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearChallengeResults(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getAverageChallengeScore(): number {
  const all = loadChallengeResults();
  if (!all.length) return 0;
  return Math.round(all.reduce((s, r) => s + r.score, 0) / all.length);
}
