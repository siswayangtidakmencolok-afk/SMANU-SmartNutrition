"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SmanuLogo } from "@/components/SmanuLogo";

interface DashboardFeature {
  id: string;
  area: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  href: string;
}

const features = [
  {
    id: "history",
    area: "history",
    title: "Riwayat Aktivitas",
    category: "Jejak Belajar",
    description: "Buka kembali sesi konsultasi dan aktivitas yang tersimpan.",
    icon: "history",
    href: "/history",
  },
  {
    id: "ask-smanu",
    area: "ask",
    title: "Ask SMANU",
    category: "Asisten Nutrisi",
    description: "Tanyakan hal seputar nutrisi dengan konteks kebutuhanmu.",
    icon: "psychology",
    href: "/ask-smanu",
  },
  {
    id: "nutrition-knowledge",
    area: "knowledge",
    title: "Nutrition Knowledge",
    category: "Materi Gizi",
    description: "Jelajahi materi literasi gizi yang tersedia.",
    icon: "menu_book",
    href: "/nutrition-knowledge",
  },
  {
    id: "my-context",
    area: "context",
    title: "Konteks Saya",
    category: "Personalisasi",
    description: "Atur makanan, budget, preferensi, dan tujuanmu.",
    icon: "tune",
    href: "/my-context",
  },
  {
    id: "league",
    area: "league",
    title: "Student Nutrition League",
    category: "Progres Siswa",
    description: "Lihat progres EXP, pencapaian, dan leaderboard.",
    icon: "emoji_events",
    href: "/league",
  },
  {
    id: "food-challenge",
    area: "challenge",
    title: "Food Challenge",
    category: "Simulasi Makanan",
    description: "Coba skenario pilihan makanan dan pengelolaan budget.",
    icon: "restaurant_menu",
    href: "/food-challenge",
  },
  {
    id: "food-scanner",
    area: "scanner",
    title: "AI Food Scanner",
    category: "Analisis Makanan",
    description: "Buka Nutrition Knowledge untuk mengakses pemindai makanan AI.",
    icon: "qr_code_scanner",
    href: "/nutrition-knowledge",
  },
  {
    id: "learning-journey",
    area: "journey",
    title: "Learning Journey",
    category: "Perjalanan Belajar",
    description: "Tinjau progres belajar dan rekomendasi materi.",
    icon: "trending_up",
    href: "/learning-journey",
  },
] satisfies DashboardFeature[];

const suggestedPrompts = [
  { emoji: "⚡", text: "Menu warteg budget 15k tinggi protein" },
  { emoji: "🥱", text: "Cegah ngantuk saat pelajaran ke-5" },
  { emoji: "🥚", text: "Sumber protein murah selain ayam fillet" },
  { emoji: "💧", text: "Target hidrasi 2 liter saat jam ekskul" },
];

export function DashboardNavigationHub() {
  const router = useRouter();
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const selectedFeature = features.find((feature) => feature.id === selectedFeatureId);

  function activateFeature(feature: DashboardFeature) {
    if (selectedFeatureId === feature.id) {
      router.push(feature.href);
      return;
    }

    setSelectedFeatureId(feature.id);
  }

  function openFeature(feature: DashboardFeature) {
    router.push(feature.href);
  }

  return (
    <section
      aria-labelledby="dashboard-hub-title"
      className="dashboard-hub relative overflow-hidden rounded-3xl border border-slate-700/70 bg-[#0B1220] p-4 text-slate-50 shadow-2xl sm:p-6 lg:p-7"
    >
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <header className="dashboard-hub-entrance relative z-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            SMANU INTERACTIVE NAVIGATION HUB
          </div>
          <h1 id="dashboard-hub-title" className="font-headline-lg text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            Halo, Student!
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
            Jelajahi ekosistem nutrisi cerdas SMANU.
          </p>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-slate-400 sm:text-right">
          Pilih fitur untuk melihat ringkasan. Pilih sekali lagi atau gunakan tombol buka untuk melanjutkan.
        </p>
      </header>

      <div className="dashboard-hub-stage relative z-10">
        <svg
          aria-hidden="true"
          className="dashboard-hub-connectors pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="hub-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5">
              <path d="M0,0 L6,3.5 L0,7 Z" fill="#FACC15" />
            </marker>
          </defs>
          <g className="dashboard-hub-connectors-mobile">
            {[
              "M500 500 L250 100",
              "M500 500 L750 100",
              "M500 500 L250 300",
              "M500 500 L750 300",
              "M500 500 L250 700",
              "M500 500 L750 700",
              "M500 500 L250 900",
              "M500 500 L750 900",
            ].map((path) => (
              <path
                key={path}
                d={path}
                className="dashboard-hub-connector"
                markerEnd="url(#hub-arrow)"
              />
            ))}
          </g>
          <g className="dashboard-hub-connectors-desktop">
            {[
              "M500 500 L167 167",
              "M500 500 L500 167",
              "M500 500 L833 167",
              "M500 500 L167 500",
              "M500 500 L833 500",
              "M500 500 L167 833",
              "M500 500 L500 833",
              "M500 500 L833 833",
            ].map((path) => (
              <path
                key={path}
                d={path}
                className="dashboard-hub-connector"
                markerEnd="url(#hub-arrow)"
              />
            ))}
          </g>
        </svg>

        <div className="dashboard-hub-core dashboard-hub-entrance relative z-10 flex min-w-0 flex-col items-center justify-center border border-emerald-300/40 bg-[#102433]/95 p-4 text-center shadow-[0_0_42px_rgba(16,185,129,0.28)] sm:p-6">
          <svg
            aria-hidden="true"
            className="dashboard-hub-vortex pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 260 260"
          >
            <defs>
              <filter id="hub-vortex-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#hub-vortex-glow)">
              <ellipse className="dashboard-hub-vortex-orbit dashboard-hub-vortex-orbit--one" cx="130" cy="130" rx="112" ry="43" transform="rotate(-32 130 130)" />
              <ellipse className="dashboard-hub-vortex-orbit dashboard-hub-vortex-orbit--two" cx="130" cy="130" rx="100" ry="52" transform="rotate(28 130 130)" />
            </g>
            <g className="dashboard-hub-vortex-leaves">
              <path d="M37 106c-14-10-14-21-9-27 13 5 19 14 17 26 8-11 17-13 23-10-5 12-15 17-31 11Z" />
              <path d="M202 60c-3-15 4-22 11-22 6 11 5 19-2 26 13-9 22-8 26-3-7 12-18 15-35 7Z" />
              <path d="M191 197c-14-6-17-16-13-23 13 2 21 9 22 20 5-12 13-16 20-14-2 13-11 21-29 17Z" />
            </g>
            {selectedFeatureId && (
              <g className="dashboard-hub-vortex-sparks">
                <circle cx="46" cy="157" r="2" />
                <circle cx="220" cy="126" r="2" />
                <circle cx="102" cy="217" r="1.5" />
              </g>
            )}
          </svg>
          <span className="mb-3 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
            Central Intelligence Hub
          </span>
          <SmanuLogo variant="icon" className="mb-3 h-14 w-14 drop-shadow-[0_0_16px_rgba(52,211,153,0.45)]" />
          <p className="font-headline-lg text-2xl font-extrabold tracking-wide text-white">
            SMANU
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Smart Nutrition for Students
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            8 fitur dalam satu ekosistem
          </div>
        </div>

        <div className="dashboard-hub-feature-grid relative z-10">
          {features.map((feature, index) => {
            const isSelected = selectedFeatureId === feature.id;

            return (
              <button
                key={feature.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${feature.title}. ${isSelected ? "Tekan lagi untuk membuka halaman." : "Pilih untuk melihat penjelasan."}`}
                onClick={() => activateFeature(feature)}
                className={`dashboard-hub-feature dashboard-hub-feature--${feature.area} group min-w-0 rounded-2xl border p-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] sm:p-4 ${
                  isSelected
                    ? "dashboard-hub-feature-selected scale-[1.015] border-emerald-300 bg-[#15352f] shadow-[0_0_24px_rgba(16,185,129,0.22)]"
                    : "border-slate-700 bg-[#111C2E]/95 hover:scale-[1.015] hover:border-emerald-300/50 hover:bg-[#15283a]"
                }`}
                style={{ animationDelay: `${180 + index * 75}ms` }}
              >
                <span className="flex min-w-0 items-start justify-between gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-200">
                    <span className="material-symbols-outlined text-[21px]" aria-hidden="true">
                      {feature.icon}
                    </span>
                  </span>
                  <span
                    className={`material-symbols-outlined mt-1 text-[17px] text-amber-300 transition-transform duration-300 ${
                      isSelected ? "translate-x-1" : "opacity-70 group-hover:translate-x-1"
                    }`}
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </span>
                <span className="mt-3 block text-[10px] font-semibold uppercase tracking-wider text-emerald-200/90">
                  {feature.category}
                </span>
                <span className="mt-1 block break-words text-sm font-bold leading-snug text-white">
                  {feature.title}
                </span>
                <span className="mt-1.5 block break-words text-xs leading-relaxed text-slate-300">
                  {feature.description}
                </span>
                <span className="sr-only">
                  Klik pertama untuk memilih, klik kedua untuk membuka.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedFeature ? (
        <section
          key={selectedFeature.id}
          aria-live="polite"
          aria-labelledby="selected-feature-title"
          className="dashboard-hub-preview relative z-10 mt-5 overflow-hidden rounded-2xl border border-emerald-300/20 bg-[#111C2E]/95 p-4 sm:p-5"
        >
          <div className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200">
                <span className="material-symbols-outlined text-[25px]" aria-hidden="true">
                  {selectedFeature.icon}
                </span>
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Fitur terpilih
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-200">
                    {selectedFeature.category}
                  </span>
                </div>
                <h2 id="selected-feature-title" className="mt-1 text-lg font-bold leading-snug text-white">
                  {selectedFeature.title}
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-300">
                  {selectedFeature.description}
                </p>
              </div>
            </div>
            <div className="relative flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => openFeature(selectedFeature)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111C2E]"
              >
                Buka Halaman
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFeatureId(null)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </section>
      ) : (
        <p className="relative z-10 mt-4 text-center text-xs leading-relaxed text-slate-400">
          Pilih salah satu fitur untuk melihat penjelasannya.
        </p>
      )}

      <div className="relative z-10 mt-5 border-t border-slate-700/70 pt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Ide pertanyaan untuk SMANU
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <Link
              key={prompt.text}
              href={`/ask-smanu?q=${encodeURIComponent(prompt.text)}`}
              className="inline-flex min-h-10 max-w-full items-center rounded-xl border border-slate-700 bg-white/5 px-3 py-2 text-left text-xs leading-relaxed text-slate-200 transition-colors hover:border-emerald-300/50 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <span className="mr-1.5 shrink-0" aria-hidden="true">{prompt.emoji}</span>
              <span className="break-words">{prompt.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
