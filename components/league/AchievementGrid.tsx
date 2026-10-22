"use client";

import { useEffect, useState } from "react";

interface AchievementItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  expReward: number;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementData {
  achievements: AchievementItem[];
  unlockedCount: number;
  totalCount: number;
  authenticated: boolean;
}

type FilterCategory = "all" | "scan" | "quest" | "challenge" | "explore";

const FILTERS: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "scan", label: "Scanner" },
  { key: "quest", label: "Quest" },
  { key: "challenge", label: "Challenge" },
  { key: "explore", label: "Eksplorasi" },
];

export function AchievementGrid() {
  const [data, setData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/league/achievements", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(payload?.error ?? `Gagal memuat achievements (${response.status}).`);
        }
        return response.json() as Promise<AchievementData>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setData(payload);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Gagal memuat achievements.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  if (loading) {
    return <div className="flex h-24 items-center justify-center text-sm text-slate-400" aria-live="polite">Memuat achievement…</div>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            setRetry((value) => value + 1);
          }}
          className="mt-2 font-semibold underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (!data) {
    return <p role="status" className="py-6 text-center text-sm text-slate-400">Data achievement belum tersedia.</p>;
  }

  const visibleItems = filter === "all"
    ? data.achievements
    : data.achievements.filter((item) => item.category === filter);

  return (
    <div className="flex flex-col gap-4">
      {!data.authenticated && (
        <p className="rounded-xl bg-slate-800/50 p-3 text-xs text-slate-300">
          Masuk untuk menyimpan pencapaian akunmu.
        </p>
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-400">
          <strong className="text-emerald-400">{data.unlockedCount}</strong> / {data.totalCount} achievement terbuka
        </p>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                filter === item.key ? "border-emerald-500/40 bg-emerald-500/25 text-emerald-200" : "border-transparent bg-slate-800/60 text-slate-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">Tidak ada achievement pada kategori ini.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <article
              key={item.key}
              className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                item.unlocked ? "border-emerald-500/25 bg-slate-800/60" : "border-slate-700/40 bg-slate-900/40 opacity-70"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${item.unlocked ? "bg-emerald-500/15" : "bg-slate-800"}`}>
                {item.unlocked ? item.icon : "🔒"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-xs font-bold leading-tight ${item.unlocked ? "text-white" : "text-slate-400"}`}>{item.title}</h3>
                  {item.expReward > 0 && <span className="shrink-0 text-[10px] font-bold text-emerald-400">+{item.expReward} EXP</span>}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.description}</p>
                {item.unlocked && item.unlockedAt && (
                  <p className="mt-1 text-[10px] text-emerald-500/80">
                    Terbuka {new Date(item.unlockedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
