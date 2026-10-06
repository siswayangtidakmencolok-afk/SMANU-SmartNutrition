"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/ask-smanu": "Chat / Ask SMANU",
  "/nutrition-knowledge": "Nutrition Knowledge",
  "/my-context": "My Context",
  "/history": "History",
  "/about": "About SMANU",
  "/how-it-works": "How It Works",
  "/settings": "Settings",
  "/help": "Help & Responsible AI",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? "SMANU";
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0">
      {/* Left: hamburger + label */}
      <div className="flex items-center gap-4 w-52">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
        <span className="hidden lg:inline-block font-semibold text-xs text-slate-400 tracking-wider uppercase">
          Student Portal
        </span>
        <span className="lg:hidden font-semibold text-sm text-slate-700">{pageTitle}</span>
      </div>

      {/* Center: search bar */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.15z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari makanan, nutrisi, atau pertanyaan..."
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Notifikasi"
        >
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
          </svg>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">Siswa SMANU</p>
            <p className="text-[11px] font-medium text-slate-400">Student</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-sm select-none shrink-0">
            S
          </div>
        </div>
      </div>
    </header>
  );
}
