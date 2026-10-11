"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { computeLearningJourney, LearningJourneySummary } from "@/lib/learning-journey-store";
import { formatRelativeTime } from "@/lib/history-store";
import { useAuth } from "@/context/AuthContext";

// ── Helpers ────────────────────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 80) return "text-emerald-700";
  if (pct >= 60) return "text-amber-600";
  return "text-rose-600";
}

function pctBg(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-400";
  return "bg-rose-400";
}

function pctLevelLabel(pct: number) {
  if (pct >= 80) return { label: "Kuasai", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (pct >= 60) return { label: "Menengah", color: "text-amber-700 bg-amber-50 border-amber-200" };
  return { label: "Perlu Latihan", color: "text-rose-700 bg-rose-50 border-rose-200" };
}

const DOMAIN_ICON: Record<string, string> = {
  "Gizi Dasar": "nutrition",
  "Pola Makan Sehat": "spa",
  "Hidrasi & Performa": "water_drop",
  "Gizi Olahraga": "fitness_center",
  "Makronutrien": "grain",
  "Mikronutrien": "vital_signs",
  "Label Makanan": "label",
  "Budget Gizi": "account_balance_wallet",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

function TrendChip({ trend }: { trend: "improving" | "stable" | "declining" | "insufficient" }) {
  if (trend === "improving") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
      <span className="material-symbols-outlined text-[11px]">trending_up</span>Naik
    </span>
  );
  if (trend === "declining") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
      <span className="material-symbols-outlined text-[11px]">trending_down</span>Turun
    </span>
  );
  if (trend === "stable") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">
      <span className="material-symbols-outlined text-[11px]">trending_flat</span>Stabil
    </span>
  );
  return null;
}

// ── Guest wall ─────────────────────────────────────────────────────────────────

function GuestWall() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-5">
      <div className="w-20 h-20 rounded-3xl bg-[#131b2e] flex items-center justify-center shadow-lg">
        <span className="material-symbols-outlined text-[38px] text-[#6cf8bb]">lock</span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Masuk untuk Menyimpan Progresmu</h3>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          Sebagai tamu, aktivitasmu tidak tersimpan. Login untuk melacak perjalanan belajar, melihat grafik progres, dan mendapat rekomendasi materi personal.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push("/login")}
          className="flex-1 py-3 rounded-xl bg-[#006c49] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#005236] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          Masuk Sekarang
        </button>
        <button
          onClick={() => router.push("/login?tab=register")}
          className="flex-1 py-3 rounded-xl border-2 border-[#131b2e] text-[#131b2e] font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          Daftar Gratis
        </button>
      </div>
      <p className="text-[11px] text-slate-400">Atau lanjutkan sebagai tamu — data tidak tersimpan</p>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ isGuest }: { isGuest: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4 gap-5">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
        <span className="material-symbols-outlined text-[38px] text-emerald-600">rocket_launch</span>
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {isGuest ? "Mulai Petualangan Gizimu!" : "Belum Ada Aktivitas Belajar"}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          {isGuest
            ? "Selesaikan NutriQuest atau Food Challenge pertamamu untuk melihat grafik perkembangan dan rekomendasi belajar pribadimu!"
            : "Belum ada riwayat kuis atau tantangan. Mulai sekarang untuk membangun Learning Journey kamu!"}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/my-context"
          className="flex-1 py-3 rounded-xl bg-[#131b2e] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">quiz</span>
          Mulai NutriQuest
        </Link>
        <Link
          href="/food-challenge"
          className="flex-1 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
          Food Challenge
        </Link>
      </div>
    </div>
  );
}

// ── Mini SVG trend chart (7 data points) ──────────────────────────────────────

function MiniTrendChart({ questScores, challengeScores }: { questScores: number[]; challengeScores: number[] }) {
  // Normalise to last 7 data points each
  const q = questScores.slice(-7);
  const c = challengeScores.slice(-7);

  function buildPoints(arr: number[], total: number) {
    if (!arr.length) return "";
    const w = 280, h = 100;
    const step = total > 1 ? w / (total - 1) : 0;
    return arr.map((v, i) => {
      const x = i * step;
      const y = h - (v / 100) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  const totalPts = Math.max(q.length, c.length, 2);
  const qPoints = buildPoints(q, totalPts);
  const cPoints = buildPoints(c, totalPts);

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].slice(0, totalPts);

  return (
    <div className="w-full">
      <div className="relative w-full h-40 bg-slate-50 rounded-xl p-2 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
          {/* Grid lines */}
          {[20, 60, 100].map((y) => (
            <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
          ))}
          {/* Quest line (green) */}
          {qPoints && (
            <>
              <defs>
                <linearGradient id="qGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                fill="url(#qGrad)"
                points={`0,120 ${qPoints} 280,120`}
              />
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={qPoints}
              />
            </>
          )}
          {/* Challenge line (teal) */}
          {cPoints && (
            <polyline
              fill="none"
              stroke="#0d9488"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={cPoints}
            />
          )}
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1">
        {days.map((d) => <span key={d}>{d}</span>)}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function LearningJourneyPage() {
  const { isGuest, isLoading, user } = useAuth();
  const [summary, setSummary] = useState<LearningJourneySummary | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<"all" | "quest" | "challenge">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSummary(computeLearningJourney());
  }, []);

  // Build timeline rows from both result sets
  const timelineItems = useMemo(() => {
    if (!summary) return [];
    const questItems = (summary.latestQuestResult ? [summary.latestQuestResult] : []).map((r) => ({
      type: "quest" as const,
      title: `NutriQuest · ${r.domain}`,
      subtitle: `Kuis · ${r.total} soal`,
      score: r.pct,
      time: r.timestamp,
      icon: "quiz",
      iconBg: "bg-teal-100 text-teal-700",
    }));
    const challengeItems = (summary.latestChallengeResult ? [summary.latestChallengeResult] : []).map((r) => ({
      type: "challenge" as const,
      title: `Food Challenge · ${r.scenarioTitle}`,
      subtitle: "Tantangan",
      score: r.score,
      time: r.timestamp,
      icon: "lunch_dining",
      iconBg: "bg-emerald-100 text-emerald-700",
    }));
    return [...questItems, ...challengeItems].sort((a, b) => b.time - a.time);
  }, [summary]);

  const filteredTimeline = timelineItems.filter((i) =>
    timelineFilter === "all" ? true : i.type === timelineFilter
  );

  // Loading skeleton
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const hasData = summary && summary.totalActivities > 0;

  // Quest scores for chart (latest first → reverse for chronological)
  const questChartScores = summary?.domainStats
    .flatMap((d) => Array(d.attempts).fill(d.averagePct))
    .slice(-7).reverse() ?? [];
  const challengeChartScores = summary?.latestChallengeResult
    ? [summary.latestChallengeResult.score]
    : [];

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#131b2e] shadow-lg">
        {/* Decorative glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#006c49]/30 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#acedff]/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch">
          {/* Left content */}
          <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6cf8bb]/20 text-[#6cf8bb] text-[11px] font-bold tracking-wide uppercase mb-3">
                <span className="material-symbols-outlined text-[14px]">school</span>
                Learning Journey
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2">
                Perjalanan Belajarmu
              </h1>
              <p className="text-sm text-[#bec6e0] leading-relaxed max-w-lg">
                Kenali perkembanganmu, temukan materi yang perlu dipelajari, dan tingkatkan pemahaman gizi demi energi belajar yang optimal.
              </p>
            </div>
            {/* Motivational pill */}
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#006c49]/40 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#6cf8bb] text-[18px]">eco</span>
              </div>
              <p className="text-xs text-white/80 italic leading-relaxed">
                &ldquo;Gizi baik hari ini, energi untuk mimpi esok.&rdquo;
              </p>
            </div>
          </div>

          {/* Right status card */}
          <div className="lg:w-72 p-5 sm:p-7 lg:border-l border-white/10 flex items-center">
            <div className="w-full bg-white/8 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6cf8bb]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#6cf8bb] text-[20px]">insights</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#bec6e0] uppercase tracking-wider font-semibold">Status Siswa</p>
                  <p className="text-sm font-bold text-white truncate">{isGuest ? "Tamu / Guest" : user.displayName}</p>
                </div>
              </div>

              {hasData && summary ? (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#bec6e0]">Target Aktivitas</span>
                      <span className="text-[#6cf8bb] font-bold">
                        {Math.min(100, Math.round((summary.totalActivities / 10) * 100))}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#6cf8bb] rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((summary.totalActivities / 10) * 100))}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#bec6e0] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#6cf8bb]">check_circle</span>
                      {summary.totalActivities} aktivitas selesai
                    </span>
                    <span className="bg-[#6cf8bb]/20 text-[#6cf8bb] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {isGuest ? "Tamu" : "Aktif"}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#bec6e0] leading-relaxed">
                  {isGuest ? "Login untuk menyimpan progres" : "Belum ada aktivitas. Mulai sekarang!"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── GUEST NOTICE BANNER ─────────────────────────────────────────── */}
      {isGuest && (
        <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0">info</span>
          <p className="text-xs text-amber-800 leading-relaxed flex-1">
            <strong>Mode Tamu:</strong> Aktivitas tidak tersimpan setelah sesi berakhir.{" "}
            <Link href="/login" className="underline font-bold hover:text-amber-900">Masuk / Daftar</Link>{" "}
            untuk menyimpan progresmu secara permanen.
          </p>
        </div>
      )}

      {/* ── 4-METRIC CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Aktivitas",
            value: summary?.totalActivities ?? 0,
            sub: "quest & tantangan selesai",
            icon: "assignment_turned_in",
            iconBg: "bg-emerald-100 text-emerald-700",
          },
          {
            label: "Kuis Terakhir",
            value: summary?.latestQuestResult ? `${summary.latestQuestResult.pct}%` : "—",
            sub: summary?.latestQuestResult
              ? `${summary.latestQuestResult.score}/${summary.latestQuestResult.total} benar`
              : "Belum ada kuis",
            icon: "quiz",
            iconBg: "bg-cyan-100 text-cyan-700",
          },
          {
            label: "Topik Dipelajari",
            value: summary?.domainStats.length ?? 0,
            sub: "dari 8 domain kurikulum",
            icon: "auto_stories",
            iconBg: "bg-indigo-100 text-indigo-700",
          },
          {
            label: "Materi Rekomendasi",
            value: summary?.topRecommendations[0]?.title ?? "—",
            sub: summary?.topRecommendations[0] ? "Disarankan untukmu" : "Selesaikan aktivitas dulu",
            icon: "water_drop",
            iconBg: "bg-slate-100 text-[#006c49]",
            isText: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-slate-500 mb-1">{card.label}</span>
                <span className={`font-bold text-slate-900 leading-tight ${card.isText ? "text-sm sm:text-base truncate" : "text-2xl"}`}>
                  {card.value}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN BODY ────────────────────────────────────────────────────── */}
      {!hasData ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isGuest && !summary?.totalActivities ? <GuestWall /> : <EmptyState isGuest={isGuest} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT: 8 cols ──────────────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-5">

            {/* MASTERY GRID */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-base font-bold text-slate-900">Tingkat Penguasaan Topik</h2>
                    <span className="material-symbols-outlined text-[#006c49] text-[18px]">verified</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Berdasarkan hasil kuis dan tantangan. Bukan penilaian medis klinis.
                  </p>
                </div>
                <Link
                  href="/nutrition-knowledge"
                  className="shrink-0 text-[11px] font-semibold text-[#006c49] hover:underline flex items-center gap-0.5 whitespace-nowrap"
                >
                  Lihat Semua
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary!.domainStats.map((d) => {
                  const level = pctLevelLabel(d.averagePct);
                  const icon = DOMAIN_ICON[d.domain] ?? "nutrition";
                  return (
                    <div key={d.domain} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-[18px] text-[#006c49]">{icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-800 truncate">{d.domain}</span>
                          <span className={`text-[10px] font-medium ${level.color.split(" ")[0]}`}>{level.label}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-24 shrink-0">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-bold ${pctColor(d.averagePct)}`}>{d.averagePct}%</span>
                          <TrendChip trend={d.trend} />
                        </div>
                        <ScoreBar pct={d.averagePct} color={pctBg(d.averagePct)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WEAK TOPICS — needs review */}
            {summary!.weakDomains.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">replay</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Topik yang Perlu Kamu Pelajari Lagi</h2>
                    <p className="text-[11px] text-slate-500">Berdasarkan analisis hasil kuis untuk memperkuat pemahamanmu.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {summary!.weakDomains.map((d) => {
                    const kid = d.recommendedKnowledgeIds[0];
                    return (
                      <div
                        key={d.domain}
                        className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <span className="material-symbols-outlined text-[20px] text-amber-600">
                              {DOMAIN_ICON[d.domain] ?? "nutrition"}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-800">{d.domain}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-semibold">
                                {d.averagePct}% · Perlu Latihan
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Nilai rata-rata masih {d.averagePct}%. Ulangi latihan untuk meningkatkan pemahaman.
                            </p>
                          </div>
                        </div>
                        {kid ? (
                          <Link
                            href={`/nutrition-knowledge/${kid}`}
                            className="shrink-0 px-3.5 py-2 rounded-lg bg-[#131b2e] text-white text-[11px] font-bold hover:bg-slate-700 transition-colors text-center"
                          >
                            Pelajari Topik Ini
                          </Link>
                        ) : (
                          <Link
                            href="/my-context"
                            className="shrink-0 px-3.5 py-2 rounded-lg bg-[#131b2e] text-white text-[11px] font-bold hover:bg-slate-700 transition-colors text-center"
                          >
                            Ulangi Kuis
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTIVITY TIMELINE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-slate-600">history</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Riwayat Aktivitas Belajar</h2>
                </div>
                {/* Filter tabs */}
                <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1 self-start sm:self-auto">
                  {(["all", "quest", "challenge"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimelineFilter(f)}
                      className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        timelineFilter === f
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {f === "all" ? "Semua" : f === "quest" ? "NutriQuest" : "Food Challenge"}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTimeline.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-[40px] block mb-2 text-slate-200">inbox</span>
                  Belum ada aktivitas untuk filter ini.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredTimeline.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                          <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-none">{item.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              item.type === "quest"
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {item.subtitle}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {formatRelativeTime(item.time)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-black text-slate-900">Skor {item.score}%</span>
                          <span className="text-[10px] font-semibold text-[#006c49]">Selesai</span>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-slate-300">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: 4 cols ─────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* PROGRESS CHART */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Grafik Perkembangan</h3>
                  <p className="text-[11px] text-slate-500">Akurasi & konsistensi belajar</p>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-lg font-medium">
                  7 Hari Terakhir
                </span>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  NutriQuest
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full border-b-2 border-dashed border-teal-500 inline-block" />
                  Challenge
                </div>
              </div>
              <MiniTrendChart questScores={questChartScores} challengeScores={challengeChartScores} />
              <p className="text-[10px] text-slate-400 italic text-center mt-2 leading-relaxed">
                Grafik merepresentasikan konsistensi latihan, bukan tolak ukur tunggal kecerdasan.
              </p>
            </div>

            {/* TOP RECOMMENDATION CARD */}
            {summary!.topRecommendations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006c49] text-[20px]">auto_awesome</span>
                    <h3 className="text-sm font-bold text-slate-900">Rekomendasi Berikutnya</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    AI SMANU
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Dari analisis progres belajarmu:</p>

                {/* Top rec card */}
                {(() => {
                  const rec = summary!.topRecommendations[0];
                  return (
                    <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                      {/* Colored top bar */}
                      <div className="h-1.5 bg-gradient-to-r from-[#006c49] to-[#6cf8bb]" />
                      <div className="p-3.5 flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#006c49]/10 border border-[#006c49]/20 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-[#006c49]">menu_book</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                                rec.priority === "high"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : rec.priority === "medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}>
                                {rec.priority === "high" ? "Prioritas" : rec.priority === "medium" ? "Disarankan" : "Eksplorasi"}
                              </span>
                              <span className="text-[10px] text-slate-400">{rec.category}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">{rec.title}</h4>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{rec.reason}</p>
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/nutrition-knowledge/${rec.knowledgeId}`}
                            className="w-full py-2.5 rounded-lg bg-[#006c49] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#005236] transition-colors shadow-sm"
                          >
                            Pelajari Materi
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </Link>
                          <Link
                            href="/my-context"
                            className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">quiz</span>
                            Latihan Kuis Terkait
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* STRONG DOMAINS */}
            {summary!.strongDomains.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">emoji_events</span>
                  <p className="text-xs font-bold text-emerald-800">Domain yang Sudah Kamu Kuasai</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary!.strongDomains.map((d) => (
                    <span key={d.domain} className="text-[10px] px-2.5 py-1 rounded-lg bg-white text-emerald-800 font-semibold border border-emerald-200 shadow-sm">
                      {d.domain} · {d.bestPct}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MOTIVATIONAL CARD */}
            <div className="relative rounded-2xl overflow-hidden bg-[#131b2e] p-5 min-h-[160px] flex flex-col justify-between">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#006c49]/30 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6cf8bb] block mb-1.5">
                  SMANU Growth Mindset
                </span>
                <h4 className="text-sm font-bold text-white leading-snug mb-2">
                  Kamu sudah di jalur yang tepat!
                </h4>
                <p className="text-[11px] text-[#bec6e0] leading-relaxed">
                  Terus eksplorasi materi, ikuti tantangan kantin sehat, dan bangun kebiasaan makan bernutrisi.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6cf8bb] animate-pulse" />
                  <span className="text-[10px] text-[#bec6e0]">Belajar Aktif</span>
                </div>
                <span className="material-symbols-outlined text-[#6cf8bb] text-[22px]">verified</span>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex flex-col gap-2">
              <Link
                href="/my-context"
                className="w-full py-3 rounded-xl bg-[#131b2e] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">quiz</span>
                Ulangi NutriQuest
              </Link>
              <Link
                href="/food-challenge"
                className="w-full py-3 rounded-xl border-2 border-[#131b2e] text-[#131b2e] font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                Food Challenge Baru
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <span className="material-symbols-outlined text-[#006c49] text-[20px] shrink-0 mt-0.5">medical_services</span>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Disclaimer Edukasi SMANU:</strong> Informasi ini disusun untuk membantu siswa memahami gizi secara mandiri. Bukan pengganti saran medis dari tenaga kesehatan atau ahli gizi klinis.{" "}
          <span className="font-semibold text-emerald-700">#SehatBersamaSMANU</span>
        </p>
      </div>
    </div>
  );
}
