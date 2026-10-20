"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { HistoryProvider } from "@/context/HistoryContext";
import { AiChatWidget } from "@/components/AiChatWidget";

// Pages that need full-height viewport (no padding) — chat interface
const FULLSCREEN_PAGES = ["/ask-smanu"];

// Pages that get full-width (no max-width container) — dark full-bleed pages
const FULLBLEED_PAGES = ["/my-context"];

// Mobile bottom nav — inline SVG icons so they render immediately without
// waiting for the Google Fonts CDN (no gibberish flash on Android).
const BOTTOM_NAV: { href: string; label: string; svg: React.ReactNode }[] = [
  {
    href: "/",
    label: "Beranda",
    svg: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/ask-smanu",
    label: "Tanya AI",
    svg: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: "/food-challenge",
    label: "Challenge",
    svg: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    href: "/nutrition-knowledge",
    label: "Materi",
    svg: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/my-context",
    label: "Profil",
    svg: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_PAGES.some((p) => pathname.startsWith(p));
  const isFullbleed = FULLBLEED_PAGES.some((p) => pathname.startsWith(p));

  return (
    <HistoryProvider>
      <div className="h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — fixed on desktop, slide-in on mobile */}
          <div
            className={`fixed left-0 top-0 h-full z-50 shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Main area */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(true)} />

            {isFullscreen ? (
              <div className="flex-1 overflow-hidden">{children}</div>
            ) : isFullbleed ? (
              // Full-bleed: no padding, no max-width — page manages its own spacing
              <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 lg:pb-0">
                <div className="w-full">{children}</div>
              </main>
            ) : (
              // Normal pages: standard padding + max-width
              // pb-16 on mobile reserves space for the bottom nav bar
              <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6 pb-20 lg:pb-6">
                <div className="max-w-7xl mx-auto">{children}</div>
              </main>
            )}
          </div>
        </div>

        {/* ── Mobile bottom navigation bar ──────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 safe-bottom">
          <div className="grid grid-cols-5 h-16">
            {BOTTOM_NAV.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center gap-0.5 overflow-hidden transition-colors ${
                    isActive
                      ? "text-[#006c49]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span
                    className={`transition-transform duration-200 ${isActive ? "scale-110" : "scale-100"}`}
                  >
                    {item.svg}
                  </span>
                  <span className={`text-[10px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 w-8 h-0.5 bg-[#006c49] rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* SMANU AI Assistant — floating widget (Gemini), independent of Langflow) */}
      <AiChatWidget />
    </HistoryProvider>
  );
}
