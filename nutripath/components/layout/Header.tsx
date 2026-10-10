"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useHistory } from "@/context/HistoryContext";
import { formatRelativeTime } from "@/lib/history-store";

// ── Page title map ─────────────────────────────────────────────────────────

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
  "/search": "Search Knowledge Base",
};

// ── Notification types ─────────────────────────────────────────────────────

interface AppNotification {
  id: string;
  type: "info" | "success" | "warning" | "quest";
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  href?: string;
}

// ── Header ─────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, isGuest, isLoading } = useAuth();
  const { sessions } = useHistory();

  const pageTitle = pageTitles[pathname] ?? "SMANU";

  // ── Search state ──────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  // "idle" | "focused" | "submitting" | "done"
  const [searchState, setSearchState] = useState<"idle" | "focused" | "submitting" | "done">("idle");
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchFocused = searchState === "focused" || searchState === "submitting";

  // ── Notification state ────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  // Persisted read IDs in localStorage so they survive re-renders
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("smanu_notif_read");
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  // Build notifications live from history context
  const notifications = useCallback((): AppNotification[] => {
    const notes: AppNotification[] = [];
    const now = Date.now();

    // 1. Welcome — always present
    notes.push({
      id: "welcome",
      type: "info",
      title: "Selamat datang di SMANU! 👋",
      body: "Platform edukasi gizi berbasis AI siap membantu kamu belajar nutrisi.",
      timestamp: now - 1000 * 60 * 2,
      read: false,
      href: "/about",
    });

    // 2. NutriQuest challenge
    notes.push({
      id: "nutriquest-challenge",
      type: "quest",
      title: "NutriQuest Tersedia 🧠",
      body: "Uji wawasan gizimu! Kerjakan soal dan raih pencapaian.",
      timestamp: now - 1000 * 60 * 5,
      read: false,
      href: "/my-context",
    });

    // 3. Live: each new session generates a notification
    sessions.slice(0, 5).forEach((s, i) => {
      notes.push({
        id: `session-${s.id}`,
        type: "success",
        title: i === 0 ? "Pertanyaan Terbaru Tersimpan ✅" : `Sesi #${sessions.length - i}`,
        body: `"${s.question.slice(0, 70)}${s.question.length > 70 ? "…" : ""}"`,
        timestamp: s.timestamp ?? now - 1000 * 60 * (i + 1),
        read: false,
        href: "/history",
      });
    });

    // 4. Tips of the day
    notes.push({
      id: "daily-tip",
      type: "info",
      title: "💡 Tips Gizi Hari Ini",
      body: "Sarapan dengan protein tinggi (telur + tempe) membantu fokus belajar hingga siang.",
      timestamp: now - 1000 * 60 * 60,
      read: false,
      href: "/nutrition-knowledge",
    });

    return notes;
  }, [sessions]);

  const allNotifications = notifications();
  const unreadCount = allNotifications.filter((n) => !readIds.has(n.id)).length;

  // Persist readIds to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("smanu_notif_read", JSON.stringify([...readIds]));
    } catch {
      // ignore
    }
  }, [readIds]);

  // Close notification panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  // Auto-refresh notifications every 30s (live feel)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  function markAllRead() {
    setReadIds(new Set(allNotifications.map((n) => n.id)));
  }

  function toggleNotif() {
    setNotifOpen((v) => !v);
  }

  // ── Profile state ─────────────────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = user.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ── Search handlers ───────────────────────────────────────────────────

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;

    // Phase 1: zoom-in + highlight
    setSearchState("submitting");
    setLastQuery(q);

    // Clear previous timeout
    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);

    // Phase 2: after 420ms zoom-out and navigate
    submitTimeoutRef.current = setTimeout(() => {
      setSearchState("done");
      setSearch("");
      inputRef.current?.blur();
      router.push(`/search?q=${encodeURIComponent(q)}`);
      // Back to idle after zoom-out animation
      setTimeout(() => setSearchState("idle"), 350);
    }, 420);
  };

  const handleSearchFocus = () => {
    if (searchState === "idle") setSearchState("focused");
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const handleSearchBlur = () => {
    if (!search && searchState === "focused") setSearchState("idle");
  };

  // Keyboard shortcut ⌘K / Ctrl+K to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchState("focused");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, []);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setProfileOpen(false);
    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }

  const notifTypeIcon: Record<AppNotification["type"], string> = {
    info: "info",
    success: "check_circle",
    warning: "warning",
    quest: "emoji_events",
  };

  const notifTypeColor: Record<AppNotification["type"], string> = {
    info: "text-blue-500 bg-blue-50",
    success: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-500 bg-amber-50",
    quest: "text-[#004e5c] bg-[#acedff]/60",
  };

  // ── Render ────────────────────────────────────────────────────────────

  // Search container scale classes
  const searchContainerClass = [
    "flex-1 flex justify-center",
    "transition-all duration-300 ease-in-out",
    searchState === "submitting"
      ? "max-w-none sm:max-w-2xl scale-[1.04] z-30"
      : searchState === "focused"
      ? "max-w-none sm:max-w-2xl scale-[1.02] z-20"
      : searchState === "done"
      ? "max-w-xs sm:max-w-md lg:max-w-2xl scale-[0.98]"
      : "max-w-xs sm:max-w-md lg:max-w-2xl scale-100",
  ].join(" ");

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-2 px-3 sm:px-6 z-20 shrink-0 relative">

      {/* ── Left: hamburger + label ────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
        <span className="hidden lg:inline-block font-semibold text-xs text-slate-400 tracking-wider uppercase whitespace-nowrap">
          Student Portal
        </span>
        <span className="lg:hidden font-semibold text-sm text-slate-700 truncate max-w-[120px]">
          {pageTitle}
        </span>
      </div>

      {/* ── Center: search bar ─────────────────────────────────────── */}
      {/*
        Search animation:
        - Click/focus → scale-up (1.02) + ring highlight
        - Type + submit → scale-up more (1.04) + glow = "zoom in"
        - After submit → scale-down (0.98) = "zoom out" before navigate
      */}
      <div className={searchContainerClass}>
        <form
          onSubmit={handleSearchSubmit}
          className={`relative w-full transition-all duration-300 ${
            searchState === "submitting"
              ? "drop-shadow-lg"
              : searchFocused
              ? "drop-shadow-md"
              : ""
          }`}
        >
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className={`h-4 w-4 transition-all duration-300 ${
                searchState === "submitting"
                  ? "text-emerald-600 scale-110"
                  : searchFocused
                  ? "text-emerald-500"
                  : "text-slate-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.15z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder={
              searchState === "done" && lastQuery
                ? `Hasil: "${lastQuery}"`
                : searchFocused
                ? "Ketik dan tekan Enter..."
                : "Cari nutrisi, makanan..."
            }
            className={`block w-full pl-9 pr-10 py-2 border rounded-full text-sm bg-slate-50 placeholder-slate-400 outline-none transition-all duration-300 ${
              searchState === "submitting"
                ? "border-emerald-600 ring-[3px] ring-emerald-500/30 bg-white font-medium placeholder-emerald-400"
                : searchFocused
                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-white placeholder-slate-300"
                : searchState === "done"
                ? "border-emerald-400 bg-emerald-50/60 placeholder-emerald-500"
                : "border-slate-200 hover:border-slate-300"
            }`}
          />

          {/* Submit arrow — visible when there's text */}
          {search && (
            <button
              type="submit"
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 ${
                searchState === "submitting" ? "scale-125" : "scale-100"
              }`}
              aria-label="Cari"
            >
              {searchState === "submitting" ? (
                /* Spinning loader during zoom-in phase */
                <svg className="h-4 w-4 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              )}
            </button>
          )}

          {/* Keyboard shortcut hint — desktop only, idle state */}
          {searchState === "idle" && !search && (
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-[10px] font-semibold bg-white text-slate-400 rounded border border-slate-200 shadow-sm">
              ⌘K
            </kbd>
          )}
        </form>
      </div>

      {/* ── Right: notifications + profile ───────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">

        {/* ── Notifications ────────────────────────────────────── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            className={`relative p-2 rounded-full transition-all duration-200 ${
              notifOpen
                ? "bg-emerald-100 text-emerald-700 scale-110"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Notifikasi"
            aria-expanded={notifOpen}
          >
            {/* Bell icon — shake animation when there are unread */}
            <svg
              className={`w-5 h-5 transition-transform ${
                unreadCount > 0 && !notifOpen ? "animate-[wiggle_1s_ease-in-out_infinite]" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
              />
            </svg>
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black px-1 ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                      {unreadCount} baru
                    </span>
                  )}
                  {/* Live indicator */}
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Live
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-emerald-600 font-semibold hover:underline"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {allNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    Belum ada notifikasi.
                  </div>
                ) : (
                  allNotifications.map((n) => {
                    const isUnread = !readIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                          isUnread ? "bg-emerald-50/40" : ""
                        }`}
                        onClick={() => {
                          setReadIds((prev) => new Set([...prev, n.id]));
                          if (n.href) router.push(n.href);
                          setNotifOpen(false);
                        }}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${notifTypeColor[n.type]}`}>
                          <span className="material-symbols-outlined text-[16px]">{notifTypeIcon[n.type]}</span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs font-semibold leading-tight truncate ${isUnread ? "text-slate-900" : "text-slate-600"}`}>
                              {n.title}
                            </p>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatRelativeTime(n.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <Link
                  href="/history"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                >
                  Lihat semua riwayat
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
                <span className="text-[10px] text-slate-400">
                  {sessions.length} sesi tersimpan
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile ───────────────────────────────────────────── */}
        <div className="relative flex items-center gap-2 pl-1 sm:pl-3 sm:border-l sm:border-slate-200">
          {/* Name — desktop only */}
          {!isLoading && (
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {isGuest ? "Mode Tamu" : user.displayName}
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                {isGuest ? "Belum masuk" : `@${user.username}`}
              </p>
            </div>
          )}

          {/* Avatar */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-sm select-none shrink-0 hover:bg-emerald-200 transition-colors"
            aria-label="Profile menu"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              initials || "S"
            )}
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  {isGuest ? (
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Mode Tamu</p>
                      <p className="text-xs text-slate-500">Belum masuk ke akun</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  )}
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                    </svg>
                    Settings &amp; Profile
                  </Link>

                  {isGuest ? (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                        Masuk
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                        Buat Akun
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isSigningOut ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                      )}
                      {isSigningOut ? "Keluar..." : "Keluar"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
