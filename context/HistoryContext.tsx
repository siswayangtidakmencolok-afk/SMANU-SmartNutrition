"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  clearAllHistory,
  deleteSession,
  HistorySession,
  loadHistory,
  saveSession,
} from "@/lib/history-store";

// ── Context shape ─────────────────────────────────────────────────────────────

interface HistoryContextValue {
  sessions: HistorySession[];
  addSession: (session: HistorySession) => void;
  removeSession: (id: string) => void;
  clearAll: () => void;
  /** Total count — quick badge display */
  count: number;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<HistorySession[]>([]);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setSessions(loadHistory());
  }, []);

  const addSession = useCallback((session: HistorySession) => {
    saveSession(session);
    setSessions(loadHistory());   // re-read to stay in sync
  }, []);

  const removeSession = useCallback((id: string) => {
    deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    clearAllHistory();
    setSessions([]);
  }, []);

  return (
    <HistoryContext.Provider
      value={{ sessions, addSession, removeSession, clearAll, count: sessions.length }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used inside <HistoryProvider>");
  return ctx;
}
