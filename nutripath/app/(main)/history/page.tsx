"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { useHistory } from "@/context/HistoryContext";
import {
  formatRelativeTime,
  truncate,
  HistorySession,
} from "@/lib/history-store";

// ── Situation badge colors ────────────────────────────────────────────────────
const situationColor: Record<string, string> = {
  "School Day":  "bg-blue-100   text-blue-800   border-blue-200",
  "Dormitory":   "bg-purple-100 text-purple-800 border-purple-200",
  "Exam Week":   "bg-amber-100  text-amber-800  border-amber-200",
  "Training":    "bg-rose-100   text-rose-800   border-rose-200",
};

function situationBadgeClass(s: string) {
  return situationColor[s] ?? "bg-slate-100 text-slate-700 border-slate-200";
}

// ── Single history card ───────────────────────────────────────────────────────
function HistoryCard({
  session,
  onDelete,
}: {
  session: HistorySession;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Top row */}
      <div className="flex items-start gap-4 p-4 md:p-5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-base">🌱</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Question */}
          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {session.question}
          </p>

          {/* Answer preview */}
          <p className="text-xs text-slate-500 leading-relaxed">
            {expanded
              ? session.answer
              : truncate(session.answer, 160)}
          </p>

          {session.answer.length > 160 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              {expanded ? "Tampilkan lebih sedikit ↑" : "Baca selengkapnya ↓"}
            </button>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Situation */}
            <span
              className={clsx(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                situationBadgeClass(session.situation)
              )}
            >
              {session.situation}
            </span>

            {/* Budget */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              🪙 {session.budget}
            </span>

            {/* Food */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              🍴 {session.food}
            </span>

            {/* Timestamp */}
            <span className="ml-auto text-[11px] text-slate-400 font-medium">
              {formatRelativeTime(session.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 md:px-5 py-2.5 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Ask again */}
          <Link
            href={`/ask-smanu?q=${encodeURIComponent(session.question)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Tanya lagi
          </Link>

          {/* Copy question */}
          <CopyBtn text={session.question} label="Salin pertanyaan" />
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 font-medium">Hapus?</span>
            <button
              onClick={() => onDelete(session.id)}
              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              Ya
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition-colors"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Hapus riwayat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
    >
      {copied ? "✓ Disalin" : label}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
        <span className="text-4xl">🕐</span>
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">
        Belum ada riwayat
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        Pertanyaan yang kamu ajukan ke SMANU akan muncul di sini secara otomatis setelah kamu menerima jawaban.
      </p>
      <Link
        href="/ask-smanu"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <span>Mulai bertanya</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { sessions, removeSession, clearAll, count } = useHistory();
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter by search query
  const filtered = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.question.toLowerCase().includes(q) ||
      s.answer.toLowerCase().includes(q) ||
      s.situation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Riwayat</h1>
            {count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Pertanyaan dan jawaban SMANU dari sesi ini.
          </p>
        </div>

        {/* Toolbar: search + clear */}
        {count > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.15z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pertanyaan…"
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 w-48 transition-all"
              />
            </div>

            {confirmClear ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-600 font-medium whitespace-nowrap">Hapus semua?</span>
                <button
                  onClick={() => { clearAll(); setConfirmClear(false); }}
                  className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  Ya
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                Hapus semua
              </button>
            )}
          </div>
        )}
      </div>

      {/* Phase notice */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
        <span className="text-blue-500 shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fillRule="evenodd" />
          </svg>
        </span>
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="font-semibold">Phase 1 — Session only.</span>{" "}
          Riwayat disimpan di browser dan akan hilang jika tab ditutup.
          Penyimpanan permanen (Astra DB) akan aktif setelah autentikasi ditambahkan di Phase 2.
        </p>
      </div>

      {/* Content */}
      {count === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyHistory />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-medium text-slate-700">Tidak ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">
            Tidak ada riwayat yang cocok dengan &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => (
            <HistoryCard
              key={session.id}
              session={session}
              onDelete={removeSession}
            />
          ))}
        </div>
      )}

      {/* Stats footer */}
      {count > 0 && (
        <p className="text-center text-xs text-slate-400 pb-2">
          {count} pertanyaan tersimpan · Maksimum 50 entri per sesi
        </p>
      )}
    </div>
  );
}
