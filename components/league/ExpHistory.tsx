"use client";

import { useEffect, useState } from "react";

interface ExpHistoryEntry {
  id: string;
  delta: number;
  reason: string;
  activityType: string | null;
  activityLabel: string;
  score: number | null;
  domain: string | null;
  occurredAt: string;
}

interface LearningProfile {
  expHistory: ExpHistoryEntry[];
}

const TYPE_ICON: Record<string, string> = {
  quest: "📚",
  challenge: "⚡",
  scan_save: "📷",
  achievement_unlock: "🏅",
};

const REASON_LABEL: Record<string, string> = {
  quest_complete: "Quest selesai",
  quest_perfect: "Bonus nilai sempurna",
  challenge_complete: "Challenge selesai",
  challenge_pass: "Bonus lulus challenge",
  scan_save: "Scan tersimpan",
  achievement_unlock: "Achievement terbuka",
  admin_adjustment: "Penyesuaian EXP",
};

export function ExpHistory() {
  const [entries, setEntries] = useState<ExpHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadHistory() {
      setLoading(true);
      setNeedsLogin(false);
      setError(null);
      try {
        const response = await fetch("/api/user/learning-profile", { signal: controller.signal });
        if (response.status === 401) {
          setNeedsLogin(true);
          return;
        }
        if (!response.ok) throw new Error(`Gagal memuat riwayat EXP (${response.status}).`);
        const profile = await response.json() as LearningProfile;
        if (!Array.isArray(profile.expHistory)) throw new Error("Respons riwayat EXP tidak valid.");
        setEntries(profile.expHistory);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Gagal memuat riwayat EXP.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadHistory();
    return () => controller.abort();
  }, [retry]);

  if (loading) {
    return <div className="flex h-20 items-center justify-center text-sm text-slate-400" aria-live="polite">Memuat riwayat EXP…</div>;
  }
  if (needsLogin) {
    return <p className="py-6 text-center text-sm text-slate-400">Masuk untuk melihat riwayat EXP akunmu.</p>;
  }
  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        <p>{error}</p>
        <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-2 font-semibold underline">Coba lagi</button>
      </div>
    );
  }
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">Belum ada EXP terverifikasi. Selesaikan quest, challenge, atau simpan hasil scan.</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map((entry) => {
        const date = new Date(entry.occurredAt);
        const icon = TYPE_ICON[entry.activityType ?? ""] ?? TYPE_ICON[entry.reason] ?? "✦";
        return (
          <article key={entry.id} className="flex items-center gap-3 rounded-xl bg-slate-800/40 px-3 py-2.5">
            <span className="w-6 shrink-0 text-center text-base">{icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{entry.activityLabel}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-slate-400">{REASON_LABEL[entry.reason] ?? entry.reason}</span>
                {entry.score !== null && <span className="text-[10px] text-slate-400">Skor: {entry.score}</span>}
                {entry.domain && <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-400">{entry.domain}</span>}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-xs font-bold ${entry.delta >= 0 ? "text-emerald-400" : "text-red-300"}`}>
                {entry.delta > 0 ? "+" : ""}{entry.delta} EXP
              </p>
              <time dateTime={entry.occurredAt} className="text-[10px] text-slate-500">
                {Number.isNaN(date.getTime()) ? "Tanggal tidak valid" : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </time>
            </div>
          </article>
        );
      })}
    </div>
  );
}
