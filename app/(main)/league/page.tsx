"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AchievementGrid } from "@/components/league/AchievementGrid";
import { ExpHistory } from "@/components/league/ExpHistory";
import { LeaderboardTable } from "@/components/league/LeaderboardTable";
import { TIERS, getTierFromExp } from "@/lib/exp-system";

interface ProfileData {
  totalExp: number;
  level: number;
  levelTitle: string;
  progressPct: number;
  expToNext: number | null;
  tier: string;
  tierIcon: string;
  tierProgressPct: number;
  expToNextTier: number | null;
}

function isProfileData(value: unknown): value is ProfileData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return typeof data.totalExp === "number" &&
    typeof data.level === "number" &&
    typeof data.levelTitle === "string" &&
    typeof data.progressPct === "number" &&
    (typeof data.expToNext === "number" || data.expToNext === null) &&
    typeof data.tier === "string" &&
    typeof data.tierIcon === "string" &&
    typeof data.tierProgressPct === "number" &&
    (typeof data.expToNextTier === "number" || data.expToNextTier === null);
}

async function fetchLeagueProfile(signal: AbortSignal): Promise<ProfileData | null> {
  const response = await fetch("/api/user/learning-profile", { signal });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Server error (${response.status}).`);
  const data: unknown = await response.json();
  if (!isProfileData(data)) throw new Error("Respons profil tidak valid.");
  return data;
}

function TierHeroCard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void fetchLeagueProfile(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setNeedsLogin(data === null);
        if (data) setProfile(data);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Tidak dapat memuat profil League.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-700/50 bg-[#131b2e] p-6">
        <div className="h-5 w-40 rounded bg-slate-700/60" />
        <div className="mt-4 h-8 w-56 rounded bg-slate-700/40" />
        <div className="mt-4 h-2 w-full rounded-full bg-slate-700/40" />
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-[#131b2e] p-6 text-center">
        <p className="text-3xl">🏆</p>
        <h2 className="mt-2 font-bold text-white">Masuk untuk melihat League-mu</h2>
        <p className="mt-1 text-sm text-slate-400">EXP, tier, dan peringkat tersedia setelah masuk akun.</p>
        <Link href="/login" className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Masuk sekarang
        </Link>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div role="alert" className="rounded-2xl border border-red-500/20 bg-[#131b2e] p-6">
        <p className="font-semibold text-red-400">Gagal memuat profil League</p>
        <p className="mt-1 text-sm text-slate-400">{error ?? "Data profil tidak tersedia."}</p>
        <button
          onClick={() => {
            setLoading(true);
            setNeedsLogin(false);
            setError(null);
            setRetry((value) => value + 1);
          }}
          className="mt-3 rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const tier = getTierFromExp(profile.totalExp);
  const nextTier = TIERS.find((entry) => entry.minExp > tier.minExp);
  const progressColor = {
    Bronze: "bg-amber-600",
    Silver: "bg-slate-300",
    Gold: "bg-yellow-400",
    Platinum: "bg-cyan-400",
    Diamond: "bg-blue-400",
    Master: "bg-violet-500",
    "Scholar Elite": "bg-emerald-500",
  }[tier.name] ?? "bg-emerald-500";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#131b2e] p-5 shadow-xl md:p-7">
      <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-4xl ${tier.color} ${tier.borderColor}`}>
          {tier.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-lg font-black ${tier.textColor}`}>{tier.name}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
              Level {profile.level} · {profile.levelTitle}
            </span>
          </div>
          <p className="mt-1 text-2xl font-black text-white">
            {profile.totalExp.toLocaleString("id-ID")} <span className="text-sm font-normal text-slate-400">EXP</span>
          </p>
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between gap-3 text-[11px] text-slate-400">
              <span>{tier.name} · {tier.minExp} EXP</span>
              <span>{nextTier ? `${profile.expToNextTier ?? 0} EXP menuju ${nextTier.name}` : "Tier tertinggi"}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-700/60"
              role="progressbar"
              aria-label="Progress menuju tier berikutnya"
              aria-valuenow={profile.tierProgressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${profile.tierProgressPct}%` }} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <Link href="/food-challenge" className="rounded-xl border border-emerald-500/30 bg-emerald-600/20 px-3.5 py-2 text-xs font-bold text-emerald-300">
            ⚡ Mulai Challenge
          </Link>
          <Link href="/nutrition-knowledge" className="rounded-xl border border-slate-600/40 bg-slate-700/60 px-3.5 py-2 text-xs font-medium text-slate-300">
            📚 NutriQuest
          </Link>
        </div>
      </div>
      <div className="relative mt-5 overflow-x-auto border-t border-slate-700/50 pt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Jalur Tier</p>
        <div className="flex min-w-max items-center gap-1">
          {TIERS.map((entry, index) => {
            const reached = profile.totalExp >= entry.minExp;
            const current = tier.name === entry.name;
            return (
              <div key={entry.name} className="flex items-center gap-1">
                <div className={`flex flex-col items-center rounded-lg px-2 py-1.5 ${current ? `${entry.color} border ${entry.borderColor}` : reached ? "bg-slate-700/40" : "bg-slate-800/40 opacity-40"}`}>
                  <span className="text-sm">{entry.icon}</span>
                  <span className={`text-[9px] font-bold ${current ? entry.textColor : "text-slate-400"}`}>{entry.name}</span>
                  <span className="text-[8px] text-slate-500">{entry.minExp.toLocaleString("id-ID")}</span>
                </div>
                {index < TIERS.length - 1 && <div className="h-px w-4 bg-slate-700/60" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0f172a]">
      <header className="border-b border-slate-700/40 px-5 py-4">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default function LeaguePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">SMANU SmartNutrition</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Student Nutrition League</h1>
        <p className="mt-1 text-sm text-slate-500">Belajar, kumpulkan EXP dari aktivitas terverifikasi, dan raih pencapaian.</p>
      </header>
      <TierHeroCard />
      <Section title="Papan Peringkat" subtitle="EXP berasal dari aktivitas tersimpan dan terverifikasi.">
        <LeaderboardTable />
      </Section>
      <Section title="Pencapaian" subtitle="Lencana terbuka berdasarkan rekam aktivitas akunmu.">
        <AchievementGrid />
      </Section>
      <Section title="Riwayat EXP" subtitle="Perubahan EXP yang tercatat di ledger akunmu.">
        <ExpHistory />
      </Section>
    </div>
  );
}
