/**
 * history-store.ts
 *
 * Lightweight localStorage abstraction for SMANU session history.
 * Phase 1: session-only, no auth, no backend.
 * Phase 2: swap saveSession() to write to Astra DB after auth is added.
 *
 * Max 50 entries — oldest auto-pruned.
 */

const STORAGE_KEY = "smanu_history_v1";
const MAX_ENTRIES = 50;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HistoryMessage {
  role: "user" | "assistant";
  text: string;
}

export interface HistorySession {
  id: string;
  /** First user question — used as the card title */
  question: string;
  /** First AI answer — used as the card preview */
  answer: string;
  /** Context at time of query */
  situation: string;
  budget: string;
  food: string;
  /** Full message thread */
  messages: HistoryMessage[];
  /** Date.now() when session was saved */
  timestamp: number;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export function loadHistory(): HistorySession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistorySession[];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

export function saveSession(session: HistorySession): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadHistory();
    const filtered = existing.filter((s) => s.id !== session.id);
    const updated = [session, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full or disabled — silently ignore
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function deleteSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const updated = loadHistory().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearAllHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr  = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1)  return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr  < 24) return `${diffHr} jam lalu`;
  if (diffDay <  7) return `${diffDay} hari lalu`;
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function truncate(text: string, maxLen = 130): string {
  if (!text) return "";
  return text.length <= maxLen ? text : text.slice(0, maxLen).trimEnd() + "…";
}
