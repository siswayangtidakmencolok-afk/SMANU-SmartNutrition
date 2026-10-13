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

// Mobile bottom nav tabs
const BOTTOM_NAV = [
  { href: "/",                   icon: "home",            label: "Beranda" },
  { href: "/ask-smanu",          icon: "smart_toy",       label: "Tanya AI" },
  { href: "/food-challenge",     icon: "restaurant_menu", label: "Challenge" },
  { href: "/nutrition-knowledge",icon: "menu_book",        label: "Materi" },
  { href: "/my-context",         icon: "manage_accounts", label: "Profil" },
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
                    className={`material-symbols-outlined text-[22px] transition-all duration-200 ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-medium leading-none ${isActive ? "font-semibold" : ""}`}>
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
