"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadQuestResults,
  getBestResult,
  getAverageScore,
  QuestResult,
} from "@/lib/nutriquest-store";
import { QUEST_QUESTION_COUNT } from "@/lib/nutriquest-bank";
import { formatRelativeTime } from "@/lib/history-store";

const ACHIEVEMENT_COLOR: Record<string, string> = {
  "Nutrition Master": "text-amber-500",
  "Nutrition Scholar": "text-emerald-600",
  "Nutrition Explorer": "text-teal-600",
  "Nutrition Starter": "text-blue-500",
};

const ACHIEVEMENT_BG: Record<string, string> = {
  "Nutrition Master": "bg-amber-50 border-amber-200",
  "Nutrition Scholar": "bg-emerald-50 border-emerald-200",
  "Nutrition Explorer": "bg-teal-50 border-teal-200",
  "Nutrition Starter": "bg-blue-50 border-blue-200",
};

const ACHIEVEMENT_EMOJI: Record<string, string> = {
  "Nutrition Master": "🏆",
  "Nutrition Scholar": "🎓",
  "Nutrition Explorer": "🌿",
  "Nutrition Starter": "🌱",
};

export function NutriQuestProgressWidget() {
  const [results, setResults] = useState<QuestResult[]>([]);

  useEffect(() => {
    setResults(loadQuestResults());
    const handler = () => setResults(loadQuestResults());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const best = results.length ? results.reduce((b, r) => (r.pct > b.pct ? r : b), results[0]) : null;
  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.pct, 0) / results.length)
    : 0;
  const latest = results[0] ?? null;
  const totalAttempts = results.length;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4 border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#acedff] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-[#004e5c]">emoji_events</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">NutriQuest Progress</h3>
            <p className="text-xs text-slate-500">
              {totalAttempts > 0 ? `${totalAttempts} kali dikerjakan` : "Belum pernah dikerjakan"}
            </p>
          </div>
        </div>
        <Link href="/my-context" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-0.5">
          Kerjakan
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </Link>
      </div>

      {totalAttempts === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <span className="text-3xl">🧠</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Belum ada hasil</p>
            <p className="text-xs text-slate-500 mt-0.5">Kerjakan NutriQuest untuk melihat progressmu</p>
          </div>
          <Link
            href="/my-context"
            className="text-xs font-bold text-white bg-[#131b2e] px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Mulai Quest →
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">Terbaik</span>
              <span className="text-xl font-black text-emerald-700 leading-tight">{best?.pct ?? 0}%</span>
              <span className="text-[10px] text-emerald-600">{best?.score}/{best?.total}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Rata-rata</span>
              <span className="text-xl font-black text-slate-700 leading-tight">{avg}%</span>
              <span className="text-[10px] text-slate-400">{totalAttempts}x dicoba</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">Soal</span>
              <span className="text-xl font-black text-blue-700 leading-tight">{QUEST_QUESTION_COUNT}</span>
              <span className="text-[10px] text-blue-400">per sesi</span>
            </div>
          </div>

          {/* Best achievement badge */}
          {best && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${ACHIEVEMENT_BG[best.achievement] ?? "bg-slate-50 border-slate-200"}`}>
              <span className="text-2xl">{ACHIEVEMENT_EMOJI[best.achievement] ?? "⭐"}</span>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pencapaian Terbaik</p>
                <p className={`text-sm font-black ${ACHIEVEMENT_COLOR[best.achievement] ?? "text-slate-700"}`}>
                  {best.achievement}
                </p>
              </div>
            </div>
          )}

          {/* Certificate preview — only if perfect score exists */}
          {best && best.pct === 100 && (
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-400 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
              {/* Certificate mini preview */}
              <div className="p-3 flex flex-col items-center text-center gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-emerald-400 rounded-full" />
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">SMANU SmartNutrition</span>
                  <div className="w-1 h-4 bg-emerald-400 rounded-full" />
                </div>
                <p className="text-[11px] font-black text-white uppercase tracking-wide">NUTRIQUEST</p>
                <p className="text-[9px] text-emerald-300 font-semibold uppercase tracking-wider">Achievement Award</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Awarded to</p>
                <p className="text-sm font-black text-white">SMANU Student</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-slate-400 uppercase">Skor</span>
                    <span className="text-xs font-black text-emerald-400">{best.score}/{best.total}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-slate-900">
                    100%
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-slate-400 uppercase">Tanggal</span>
                    <span className="text-[9px] font-semibold text-white">{best.completedDate}</span>
                  </div>
                </div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              {/* Badge overlay */}
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-900 text-[9px] font-black">
                SERTIFIKAT
              </div>
            </div>
          )}

          {/* Latest attempt */}
          {latest && (
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
              <span>Percobaan terakhir</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{latest.score}/{latest.total} ({latest.pct}%)</span>
                <span className="text-slate-400">·</span>
                <span>{formatRelativeTime(latest.timestamp)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <Link
        href="/my-context"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-[#acedff] bg-[#acedff]/20 hover:bg-[#acedff]/30 text-[#004e5c] text-xs font-bold transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">quiz</span>
        {totalAttempts > 0 ? "Kerjakan Lagi" : "Mulai NutriQuest"}
      </Link>
    </div>
  );
}
