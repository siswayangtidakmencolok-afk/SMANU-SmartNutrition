"use client";

import { useEffect, useState } from "react";

type LeaderboardWindow = "weekly" | "monthly" | "lifetime";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalExp: number;
  tier: string;
  tierIcon: string;
  level: number;
  levelTitle: string;
}

interface LeaderboardData {
  window: LeaderboardWindow;
  total: number;
  entries: LeaderboardEntry[];
  myRank: number | null;
  myEntry: LeaderboardEntry | null;
}

const TABS: { key: LeaderboardWindow; label: string }[] = [
  { key: "weekly", label: "Minggu Ini" },
  { key: "monthly", label: "Bulan Ini" },
  { key: "lifetime", label: "Sepanjang Waktu" },
];

export function LeaderboardTable() {
  const [window, setWindow] = useState<LeaderboardWindow>("weekly");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/league/leaderboard?window=${window}&limit=20`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(payload?.error ?? `Gagal memuat leaderboard (${response.status}).`);
        }
        setData(await response.json() as LeaderboardData);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Gagal memuat leaderboard.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [window, retryCount]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 rounded-xl bg-slate-800/60 p-1" role="tablist" aria-label="Periode leaderboard">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={window === tab.key}
            onClick={() => setWindow(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              window === tab.key ? "border border-emerald-500/40 bg-emerald-500/30 text-emerald-200" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center text-sm text-slate-400" aria-live="polite">Memuat leaderboard…</div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <p>{error}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-2 font-semibold underline">
            Coba lagi
          </button>
        </div>
      ) : !data || data.entries.length === 0 ? (
        <p className="rounded-xl bg-slate-800/40 p-6 text-center text-sm text-slate-400">
          Belum ada aktivitas terverifikasi pada periode ini.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="mb-1 text-[11px] text-slate-500">{data.total} pelajar · menampilkan {data.entries.length}</p>
          {data.entries.map((entry) => {
            const isMe = data.myEntry?.rank === entry.rank;
            const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;
            return (
              <LeaderboardRow key={entry.rank} entry={entry} isMe={isMe} medal={medal} />
            );
          })}
          {data.myEntry && !data.entries.some((entry) => entry.rank === data.myEntry?.rank) && (
            <>
              <div className="my-2 border-t border-dashed border-slate-700" />
              <LeaderboardRow entry={data.myEntry} isMe medal={null} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({
  entry,
  isMe,
  medal,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  medal: string | null;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${isMe ? "border border-emerald-500/30 bg-emerald-500/15" : "bg-slate-800/50"}`}>
      <div className="w-8 shrink-0 text-center">
        {medal ?? <span className="text-xs font-bold text-slate-500">#{entry.rank}</span>}
      </div>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isMe ? "bg-emerald-500/30 text-emerald-300" : "bg-slate-700 text-slate-300"}`}>
        {entry.displayName.trim().charAt(0).toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-xs font-semibold ${isMe ? "text-emerald-300" : "text-white"}`}>{entry.displayName}</span>
          {isMe && <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[9px] font-bold text-emerald-300">Kamu</span>}
        </div>
        <p className="truncate text-[10px] text-slate-400">{entry.tierIcon} {entry.tier} · {entry.levelTitle}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-bold text-emerald-400">{entry.totalExp.toLocaleString("id-ID")}</p>
        <p className="text-[10px] text-slate-500">EXP</p>
      </div>
    </div>
  );
}
