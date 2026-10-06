"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useHistory } from "@/context/HistoryContext";

const mainNav = [
  {
    href: "/",
    label: "Dashboard",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    href: "/ask-smanu",
    label: "Chat / Ask SMANU",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    href: "/nutrition-knowledge",
    label: "Nutrition Knowledge",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    href: "/my-context",
    label: "My Context",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About SMANU",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    href: "/how-it-works",
    label: "How It Works",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
];

const bottomNav = [
  {
    href: "/settings",
    label: "Settings",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    href: "/help",
    label: "Help & Responsible AI",
    svg: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      </svg>
    ),
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { count } = useHistory();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="h-full w-64 bg-[#0F172A] flex flex-col justify-between text-slate-300 select-none">
      {/* Top scrollable area */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4">
        {/* Logo / Brand */}
        <div className="py-3 px-2 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            S
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">SMANU</p>
            <p className="text-slate-500 text-[10px] font-medium">SmartNutrition</p>
          </div>
        </div>

        {/* Section label */}
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
          Academic Hub
        </p>

        {/* Main nav */}
        <nav className="space-y-1 text-sm font-medium">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            const isHistory = item.href === "/history";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all",
                  active
                    ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.svg}
                <span className="flex-1">{item.label}</span>
                {isHistory && count > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-4 space-y-4">
        {/* Bottom nav */}
        <nav className="space-y-1 text-sm font-medium">
          {bottomNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all",
                  active
                    ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.svg}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Motivation mini card */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">Sehat hari ini,</p>
            <p className="text-[11px] text-slate-400">lebih kuat esok.</p>
          </div>
        </div>

        {/* User card */}
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold select-none shrink-0">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Student User</p>
            <p className="text-[10px] text-slate-500 truncate">Student · Active</p>
          </div>
        </div>

        {/* Version */}
        <p className="text-[10px] text-slate-600 px-1">SMANU v1.0.0 (Prototype)</p>
      </div>
    </aside>
  );
}
