/**
 * nutriquest-store.ts
 *
 * Simpan dan baca hasil NutriQuest dari localStorage.
 * Max 20 hasil tersimpan.
 */

const STORAGE_KEY = "smanu_nutriquest_v1";
const MAX_RESULTS = 20;

export interface QuestResult {
  id: string;
  score: number;
  total: number;
  pct: number;
  achievement: string;       // "Nutrition Master" | "Nutrition Scholar" | ...
  domain: string;            // domain yang dipilih saat quest
  timestamp: number;         // Date.now()
  completedDate: string;     // formatted string untuk sertifikat
}

export function loadQuestResults(): QuestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as QuestResult[]).sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function saveQuestResult(result: QuestResult): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadQuestResults().filter((r) => r.id !== result.id);
    const updated = [result, ...existing].slice(0, MAX_RESULTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getBestResult(): QuestResult | null {
  const all = loadQuestResults();
  if (!all.length) return null;
  return all.reduce((best, r) => (r.pct > best.pct ? r : best), all[0]);
}

export function getAverageScore(): number {
  const all = loadQuestResults();
  if (!all.length) return 0;
  return Math.round(all.reduce((sum, r) => sum + r.pct, 0) / all.length);
}
