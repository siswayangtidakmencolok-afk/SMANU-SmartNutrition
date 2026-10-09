"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { HistoryProvider } from "@/context/HistoryContext";
import { AiChatWidget } from "@/components/AiChatWidget";

// Pages that need full-height viewport (no padding) — chat interface
const FULLSCREEN_PAGES = ["/ask-smanu"];

// Pages that get full-width (no max-width container) — dark full-bleed pages
const FULLBLEED_PAGES = ["/my-context"];

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
              <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="w-full">{children}</div>
              </main>
            ) : (
              // Normal pages: standard padding + max-width
              <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                <div className="max-w-7xl mx-auto">{children}</div>
              </main>
            )}
          </div>
        </div>
      </div>

      {/* SMANU AI Assistant — floating widget (Gemini), independent of Langflow) */}
      <AiChatWidget />
    </HistoryProvider>
  );
}
