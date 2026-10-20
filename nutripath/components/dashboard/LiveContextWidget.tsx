"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ContextData {
  foodChips: string[];
  budget: string;
  budgetUnit: string;
  preferences: string[];
  situations: string[];
  goals: string[];
}

const EMPTY: ContextData = {
  foodChips: [], budget: "", budgetUnit: "meal",
  preferences: [], situations: [], goals: [],
};

function loadContext(): ContextData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem("smanu_context_v1");
    return raw ? (JSON.parse(raw) as ContextData) : EMPTY;
  } catch { return EMPTY; }
}

function completeness(ctx: ContextData): number {
  let n = 0;
  if (ctx.foodChips.length > 0) n++;
  if (ctx.budget.trim()) n++;
  if (ctx.preferences.length > 0) n++;
  if (ctx.situations.length > 0) n++;
  if (ctx.goals.length > 0) n++;
  return n;
}

export function LiveContextWidget() {
  const [ctx, setCtx] = useState<ContextData>(EMPTY);

  useEffect(() => {
    setCtx(loadContext());
    // Sync when user saves context in another tab/page
    const handler = () => setCtx(loadContext());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const done = completeness(ctx);
  const pct = Math.round((done / 5) * 100);

  const items = [
    {
      label: "Situasi Belajar",
      icon: "auto_stories",
      val: ctx.situations.length > 0 ? ctx.situations.slice(0, 2).join(", ") : "Belum diset",
      color: ctx.situations.length > 0 ? "text-emerald-600" : "text-slate-400",
    },
    {
      label: "Budget Harian",
      icon: "account_balance_wallet",
      val: ctx.budget ? `Rp ${ctx.budget} / ${ctx.budgetUnit}` : "Belum diset",
      color: ctx.budget ? "text-emerald-600" : "text-slate-400",
    },
    {
      label: "Bahan Tersedia",
      icon: "kitchen",
      val: ctx.foodChips.length > 0 ? ctx.foodChips.slice(0, 3).join(", ") + (ctx.foodChips.length > 3 ? "…" : "") : "Belum diset",
      color: ctx.foodChips.length > 0 ? "text-emerald-600" : "text-slate-400",
    },
    {
      label: "Preferensi",
      icon: "check_circle",
      val: ctx.preferences.length > 0 ? ctx.preferences.join(", ") : "Belum diset",
      color: ctx.preferences.length > 0 ? "text-emerald-600" : "text-slate-400",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full border border-slate-100">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-slate-700">badge</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">Konteks Saya</h3>
              <p className="text-xs text-slate-500">Parameter aktif SMANU AI</p>
            </div>
          </div>
          <Link
            href="/my-context"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 shrink-0"
          >
            Ubah
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {items.map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-slate-50 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{item.label}</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">{item.icon}</span>
              </div>
              <span className={`text-xs font-semibold truncate ${item.color}`}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Completeness footer */}
      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
        {/* Ring */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
            <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${pct}, 100`} strokeLinecap="round" strokeWidth="3.5" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{pct}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-slate-700 block">{done}/5 seksi lengkap</span>
          {done < 5 && (
            <span className="text-[11px] text-slate-500">Lengkapi agar rekomendasi makin akurat</span>
          )}
          {done === 5 && (
            <span className="text-[11px] text-emerald-600 font-medium">Profil lengkap 🎉</span>
          )}
        </div>
        {done < 5 && (
          <Link
            href="/my-context"
            className="text-[11px] font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
          >
            Lengkapi
          </Link>
        )}
      </div>
    </div>
  );
}
