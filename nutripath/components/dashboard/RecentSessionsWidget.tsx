"use client";

import Link from "next/link";
import { useHistory } from "@/context/HistoryContext";
import { formatRelativeTime, truncate } from "@/lib/history-store";

export function RecentSessionsWidget() {
  const { sessions, count } = useHistory();
  const recent = sessions.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4 border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#131b2e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-white">smart_toy</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">AI Chat Terakhir</h3>
            <p className="text-xs text-slate-500">
              {count > 0 ? `${count} sesi disimpan` : "Belum ada sesi"}
            </p>
          </div>
        </div>
        <Link href="/history" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-0.5">
          Lihat semua
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-slate-400">chat_bubble_outline</span>
          </div>
          <p className="text-xs text-slate-500">Belum ada percakapan.</p>
          <Link href="/ask-smanu" className="text-xs font-semibold text-emerald-600 hover:underline">
            Mulai tanya SMANU →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {recent.map((session) => (
            <Link
              key={session.id}
              href={`/ask-smanu?q=${encodeURIComponent(session.question)}`}
              className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all"
            >
              {/* Context badge */}
              <div className="flex-shrink-0 mt-0.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                  Q
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-1 group-hover:text-emerald-800">
                  {session.question}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {truncate(session.answer, 90)}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {session.situation && (
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-full">
                      {session.situation}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{formatRelativeTime(session.timestamp)}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5">
                north_west
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/ask-smanu"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#131b2e] hover:bg-slate-800 text-white text-xs font-bold transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">smart_toy</span>
        Tanya SMANU AI Sekarang
      </Link>
    </div>
  );
}
