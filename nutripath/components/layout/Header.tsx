"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/ask-smanu": "Ask SMANU",
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

  return (
    <header className="h-16 bg-[--color-surface]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px] hidden sm:block">
          school
        </span>

        <div className="flex items-center gap-1 text-sm">
          <span className="text-[--color-on-surface-variant] font-medium">SMANU Portal</span>
          <span className="text-[--color-on-surface-variant]/50">/</span>
          <span className="text-[--color-on-surface] font-semibold">{pageTitle}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Version badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[--color-surface-container] text-[--color-on-surface-variant] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[--color-secondary-container] animate-pulse" />
          <span>Prototype v0.1</span>
        </div>

        <div className="h-4 w-px bg-[--color-surface-container-highest]" />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface] transition-colors"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface] transition-colors"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[--color-error]" />
          </button>
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[--color-secondary-container] flex items-center justify-center text-[--color-on-secondary-container] text-sm font-bold ring-1 ring-[--color-surface-container-highest] cursor-pointer select-none"
          aria-label="User profile"
        >
          S
        </div>
      </div>
    </header>
  );
}
