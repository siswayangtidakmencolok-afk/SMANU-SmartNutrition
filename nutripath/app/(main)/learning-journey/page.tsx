"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { computeLearningJourney, LearningJourneySummary } from "@/lib/learning-journey-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatRelativeTime } from "@/lib/history-store";

function TrendIcon({ trend }: { trend: "improving" | "stable" | "declining" | "insufficient" }) {
  if (trend === "improving") return <span className="text-emerald-500 text-[14px]">↑</span>;
  if (trend === "declining") return <span className="text-rose-500 text-[14px]">↓</span>;
  if (trend === "stable") return <span className="text-slate-400 text-[14px]">→</span>;
  return <span className="text-slate-300 text-[12px]">—</span>;
}

function ScoreBar({ pct, color = "emerald" }: { pct: number; color?: "emerald" | "amber" | "rose" }) {
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
  };
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colors[color]}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-rose-100 text-rose-700 border-rose-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const labels = { high: "Prioritas", medium: "Disarankan", low: "Eksplorasi" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyJourney() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center">
        <span className="text-4xl">🗺️</span>
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Perjalanan Belajarmu Dimulai di Sini</h3>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          Selesaikan beberapa latihan untuk mendapatkan ringkasan progres dan rekomendasi materi yang relevan.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/my-context"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131b2e] text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          <span className="text-base">🧠</span>
          Mulai NutriQuest
        </Link>
        <Link
          href="/food-challenge"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <span className="text-base">🏫</span>
          Coba Food Challenge
        </Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function LearningJourneyPage() {
  // null = not yet mounted (SSR-safe), set in one effect call to avoid double render
  const [summary, setSummary] = useState<LearningJourneySummary | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSummary(computeLearningJourney());
  }, []);

  // SSR-safe: render skeleton before mount
  if (!summary) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <PageHeader badge="Progres Belajar" title="Personal Learning Journey" subtitle="Memuatnya..." />
        <div className="animate-pulse flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="Progres Belajar"
        title="Personal Learning Journey"
        subtitle="Ringkasan aktivitas belajarmu dan rekomendasi materi berbasis hasil aktual."
      />

      {/* Activity summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-2xl mb-1">🧠</span>
          <span className="text-xl font-black text-slate-900">{summary.questAttempts}</span>
          <span className="text-[10px] text-slate-500 font-semibold text-center">NutriQuest</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-2xl mb-1">🏫</span>
          <span className="text-xl font-black text-slate-900">{summary.challengeAttempts}</span>
          <span className="text-[10px] text-slate-500 font-semibold text-center">Food Challenge</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-2xl mb-1">📊</span>
          <span className="text-xl font-black text-slate-900">{summary.totalActivities}</span>
          <span className="text-[10px] text-slate-500 font-semibold text-center">Total Aktivitas</span>
        </div>
      </div>

      {summary.totalActivities === 0 ? (
        <EmptyJourney />
      ) : (
        <>
          {/* Not enough data notice */}
          {!summary.hasEnoughData && (
            <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
              </svg>
              <p className="text-xs text-blue-800 leading-relaxed">
                Selesaikan beberapa latihan lagi untuk mendapatkan rekomendasi yang lebih relevan.
              </p>
            </div>
          )}

          {/* Recent results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.latestQuestResult && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">NutriQuest Terakhir</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-black text-slate-900">{summary.latestQuestResult.pct}%</span>
                  <span className="text-xs text-slate-500 mb-0.5">{summary.latestQuestResult.score}/{summary.latestQuestResult.total} benar</span>
                </div>
                <ScoreBar pct={summary.latestQuestResult.pct} color={summary.latestQuestResult.pct >= 70 ? "emerald" : "amber"} />
                <p className="text-[10px] text-slate-400 mt-2">{formatRelativeTime(summary.latestQuestResult.timestamp)}</p>
              </div>
            )}
            {summary.latestChallengeResult && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Food Challenge Terakhir</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-black text-slate-900">{summary.latestChallengeResult.score}</span>
                  <span className="text-xs text-slate-500 mb-0.5">/ 100</span>
                </div>
                <ScoreBar pct={summary.latestChallengeResult.score} color={summary.latestChallengeResult.score >= 70 ? "emerald" : "amber"} />
                <p className="text-[10px] text-slate-400 mt-2 truncate">{summary.latestChallengeResult.scenarioTitle}</p>
              </div>
            )}
          </div>

          {/* Domain stats */}
          {summary.domainStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Progres per Domain</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {summary.domainStats.map((d) => (
                  <div key={d.domain} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800">{d.domain}</span>
                        <TrendIcon trend={d.trend} />
                        {d.needsReview && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">Perlu Ulang</span>
                        )}
                      </div>
                      <span className={`text-xs font-black ${d.averagePct >= 70 ? "text-emerald-700" : "text-amber-600"}`}>
                        {d.averagePct}%
                      </span>
                    </div>
                    <ScoreBar pct={d.averagePct} color={d.averagePct >= 70 ? "emerald" : "amber"} />
                    <p className="text-[10px] text-slate-400 mt-1">{d.attempts}x dicoba · terbaik {d.bestPct}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.topRecommendations.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-900">📚 Rekomendasi Materi</h3>
              {summary.topRecommendations.map((rec) => (
                <div key={rec.knowledgeId} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <PriorityBadge priority={rec.priority} />
                        <span className="text-[10px] text-slate-400">{rec.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>
                  <Link
                    href={`/nutrition-knowledge/${rec.knowledgeId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline self-start"
                  >
                    Buka materi
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Strong domains */}
          {summary.strongDomains.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-800 mb-2">✅ Domain yang sudah kamu kuasai:</p>
              <div className="flex flex-wrap gap-2">
                {summary.strongDomains.map((d) => (
                  <span key={d.domain} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    {d.domain} · {d.bestPct}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/my-context"
              className="flex-1 py-3 rounded-xl border-2 border-[#131b2e] text-[#131b2e] font-bold text-sm text-center hover:bg-slate-50 transition-colors"
            >
              🧠 Ulangi NutriQuest
            </Link>
            <Link
              href="/food-challenge"
              className="flex-1 py-3 rounded-xl bg-[#131b2e] text-white font-bold text-sm text-center hover:bg-slate-700 transition-colors"
            >
              🏫 Coba Food Challenge
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
