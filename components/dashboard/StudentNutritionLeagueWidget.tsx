"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LeagueProfile {
  totalExp: number;
  tier: string;
  tierIcon: string;
  tierProgressPct: number;
  expToNextTier: number | null;
}

type WidgetState =
  | { kind: "loading" }
  | { kind: "guest" }
  | { kind: "ready"; profile: LeagueProfile }
  | { kind: "error"; message: string };

function isLeagueProfile(value: unknown): value is LeagueProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Record<string, unknown>;
  return typeof profile.totalExp === "number" &&
    typeof profile.tier === "string" &&
    typeof profile.tierIcon === "string" &&
    typeof profile.tierProgressPct === "number" &&
    (typeof profile.expToNextTier === "number" || profile.expToNextTier === null);
}

export function StudentNutritionLeagueWidget() {
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<WidgetState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/user/learning-profile", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          setState({ kind: "guest" });
          return;
        }
        if (!response.ok) {
          throw new Error(`Profil League tidak tersedia (${response.status}).`);
        }
        const payload: unknown = await response.json();
        if (!isLeagueProfile(payload)) throw new Error("Data profil League tidak valid.");
        setState({ kind: "ready", profile: payload });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            kind: "error",
            message: error instanceof Error ? error.message : "Gagal memuat data League.",
          });
        }
      });

    return () => controller.abort();
  }, [retry]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">🏆</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Student Nutrition League</p>
              <h2 className="text-base font-bold text-slate-900">Belajar dan beraktivitas, raih EXP secara terverifikasi</h2>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-500">
            EXP hanya tercatat untuk NutriQuest dan Food Challenge yang divalidasi server, serta hasil Food Scanner yang berhasil disimpan. Membuka halaman tidak memberi EXP.
          </p>
          {state.kind === "guest" && (
            <p className="mt-2 text-xs text-slate-600">
              Masuk untuk menyimpan EXP, tier, dan progres League ke akunmu.
            </p>
          )}
          {state.kind === "error" && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" role="alert">
              <span className="text-rose-700">{state.message}</span>
              <button
                type="button"
                onClick={() => {
                  setState({ kind: "loading" });
                  setRetry((value) => value + 1);
                }}
                className="font-semibold text-emerald-700 underline"
              >
                Coba lagi
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:min-w-56 md:items-end">
          {state.kind === "loading" ? (
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100 md:w-56" aria-label="Memuat League" />
          ) : state.kind === "ready" ? (
            <div className="text-left md:text-right" aria-live="polite">
              <p className="text-lg font-black text-slate-900">
                {state.profile.totalExp.toLocaleString("id-ID")} <span className="text-xs font-semibold text-slate-500">EXP</span>
              </p>
              <p className="text-xs font-semibold text-emerald-700">
                {state.profile.tierIcon} {state.profile.tier}
                {state.profile.expToNextTier === null
                  ? " · tier tertinggi"
                  : ` · ${state.profile.expToNextTier.toLocaleString("id-ID")} EXP ke tier berikutnya`}
              </p>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 md:w-56"
                role="progressbar"
                aria-label="Progres tier League"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={state.profile.tierProgressPct}
              >
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${state.profile.tierProgressPct}%` }} />
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {state.kind === "guest" && (
              <Link href="/login" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Masuk
              </Link>
            )}
            <Link href="/league" className="rounded-lg bg-[#006c49] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#005236]">
              Buka League
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
