"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { computeLearningJourney, RecommendedTopic } from "@/lib/learning-journey-store";
import {
  KNOWLEDGE_TOPICS,
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_WIDGETS,
  filterTopics,
  KnowledgeTopic,
  KnowledgeWidget,
} from "@/lib/nutrition-knowledge-data";

// Lazy-load scanner modal — not needed on initial page load
const FoodScannerModal = lazy(() => import("@/components/FoodScannerModal"));

// ─────────────────────────────────────────────────────────────────────────────
// TopicCard — no nested <a>. Outer card is a <article>; the title/image is the
// primary link; the comparator button is a sibling <Link> at the same DOM level.
// ─────────────────────────────────────────────────────────────────────────────

function TopicCard({ topic }: { topic: KnowledgeTopic }) {
  return (
    <article className="flex flex-col rounded-2xl overflow-hidden border border-[--color-outline-variant] bg-[--color-surface-container-lowest] hover:shadow-md transition-shadow h-full group">
      {/* Image — wrapped in Link (the primary navigation target) */}
      <Link href={`/nutrition-knowledge/${topic.id}`} className="block" tabIndex={-1} aria-hidden>
        <div className="h-36 overflow-hidden bg-[--color-surface-container] relative flex-shrink-0">
          {topic.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={topic.image}
              alt={topic.imageAlt || topic.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                // Fallback: hide broken image, show accent colour
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 flex items-center justify-center text-3xl ${topic.accentColor} opacity-20 pointer-events-none select-none`}
            aria-hidden
          >
            {topic.iconEmoji}
          </div>
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[--color-surface]/90 backdrop-blur text-xs font-semibold text-[--color-on-surface]">
            {topic.category}
          </span>
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[--color-surface]/90 backdrop-blur text-xs text-[--color-on-surface-variant]">
            {topic.readTime}
          </span>
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Title is the main link */}
        <Link href={`/nutrition-knowledge/${topic.id}`} className="block group/title">
          <h3 className="text-sm font-semibold text-[--color-on-surface] group-hover/title:text-[--color-secondary] transition-colors leading-snug">
            {topic.iconEmoji} {topic.title}
          </h3>
        </Link>
        <p className="text-xs text-[--color-on-surface-variant] line-clamp-3 leading-relaxed flex-1">
          {topic.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          {topic.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-[--color-surface-container] text-[--color-on-surface-variant] text-[10px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA footer — both buttons are siblings (no nesting) */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between pt-3 border-t border-[--color-outline-variant]/50 gap-2">
          <Link
            href={`/nutrition-knowledge/${topic.id}`}
            className="text-xs font-semibold text-[--color-secondary] flex items-center gap-1 hover:underline min-w-0"
          >
            Baca materi
            <span className="material-symbols-outlined text-[14px] shrink-0">arrow_forward</span>
          </Link>

          {topic.comparatorLink && (
            <Link
              href="/food-challenge/comparator"
              className="shrink-0 px-2 py-1 rounded-lg bg-[--color-surface-container] hover:bg-[--color-secondary]/10 text-[--color-on-surface-variant] hover:text-[--color-secondary] text-[10px] font-semibold transition-colors flex items-center gap-0.5"
              title={topic.comparatorLink.label}
            >
              <span className="material-symbols-outlined text-[12px]">compare_arrows</span>
              Bandingkan
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar widget
// ─────────────────────────────────────────────────────────────────────────────

function SidebarWidget({ widget }: { widget: KnowledgeWidget }) {
  function handleAiOpen() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("smanu:open-chat", {
        detail: {
          topicTitle: widget.title,
          suggestedQuestion: widget.aiQuestion ?? "Bantu saya memahami topik gizi ini.",
        },
      })
    );
  }

  return (
    <div className="rounded-xl border border-[--color-outline-variant] bg-[--color-surface-container-lowest] p-4">
      <p className="text-xs font-semibold text-[--color-on-surface] mb-2">{widget.title}</p>
      {widget.content && (
        <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed mb-3">
          {widget.content.replace(/\*\*([^*]+)\*\*/g, "$1")}
        </p>
      )}
      {widget.type === "ai-question" && (
        <button
          onClick={handleAiOpen}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[--color-secondary] to-[--color-primary] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[14px]">psychology</span>
          {widget.actionLabel ?? "Tanya AI"}
        </button>
      )}
      {(widget.type === "comparison" || widget.type === "tip" || widget.type === "fact") && widget.actionHref && (
        <Link
          href={widget.actionHref}
          className="w-full py-2 px-3 rounded-lg bg-[--color-secondary]/10 text-[--color-secondary] text-xs font-semibold hover:bg-[--color-secondary]/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
          {widget.actionLabel ?? "Lihat"}
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function NutritionKnowledgePage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendedTopic[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    try {
      const journey = computeLearningJourney();
      setRecommendations(journey.topRecommendations.filter((r) => r.priority !== "low").slice(0, 3));
    } catch {
      // ignore
    }
  }, []);

  const filtered = filterTopics(activeCategory, search);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Pustaka Gizi"
        title="Materi Nutrisi"
        subtitle="Pelajari dasar-dasar gizi, pilihan makanan sehat, dan tips praktis untuk pelajar."
      />

      {/* Recommended for you — only shown when journey data exists */}
      {recommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-emerald-900">✨ Direkomendasikan untuk Kamu</p>
            <Link href="/learning-journey" className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-0.5">
              Lihat semua
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recommendations.map((rec) => {
              const topic = KNOWLEDGE_TOPICS.find((t) => t.id === rec.knowledgeId);
              if (!topic) return null;
              return (
                <Link
                  key={rec.knowledgeId}
                  href={`/nutrition-knowledge/${rec.knowledgeId}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{topic.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{rec.reason}</p>
                  </div>
                  <span className="material-symbols-outlined text-emerald-400 text-[16px] shrink-0">arrow_forward</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main layout: articles + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: article grid */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Search + filter bar + scanner button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[--color-on-surface-variant] text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Cari topik, tag, kata kunci…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[--color-outline-variant] bg-[--color-surface-container-lowest] pl-9 pr-36 py-2.5 text-sm text-[--color-on-surface] placeholder:text-[--color-outline] outline-none focus:border-[--color-secondary] focus:ring-2 focus:ring-[--color-secondary]/20 transition-all"
              />
              {/* AI Scanner button — inside search bar, right side */}
              <button
                onClick={() => setScannerOpen(true)}
                title="AI Food Scanner — foto makanan untuk estimasi nutrisi"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[--color-secondary]/10 hover:bg-[--color-secondary]/20 text-[--color-secondary] text-[11px] font-semibold transition-colors group"
              >
                <span
                  className="material-symbols-outlined text-[15px] group-hover:scale-110 transition-transform"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  document_scanner
                </span>
                <span className="hidden xs:inline">Scan</span>
              </button>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-[--color-surface-container-lowest] border border-[--color-outline-variant] rounded-lg text-xs text-[--color-on-surface-variant] shrink-0">
              <span className="material-symbols-outlined text-[16px]">library_books</span>
              <span>{KNOWLEDGE_TOPICS.length} topik</span>
            </div>
          </div>

          {/* Category tabs — horizontal scroll, contained */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
            {KNOWLEDGE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeCategory === cat
                    ? "bg-[--color-primary] text-[--color-on-primary] shadow-sm"
                    : "bg-[--color-surface-container-lowest] text-[--color-on-surface-variant] border border-[--color-outline-variant] hover:bg-[--color-surface-container-high]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <Card className="py-16 text-center">
              <span className="material-symbols-outlined text-[40px] text-[--color-on-surface-variant] block mb-3">
                search_off
              </span>
              <p className="text-sm font-medium text-[--color-on-surface]">Topik tidak ditemukan</p>
              <p className="text-xs text-[--color-on-surface-variant] mt-1">
                Coba ubah pencarian atau pilih kategori berbeda.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}

          {/* Bottom info */}
          <Card variant="low" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[--color-secondary] text-[20px]">verified</span>
            <p className="text-xs text-[--color-on-surface-variant]">
              Semua topik bersumber dari literatur gizi dan panduan resmi Kemenkes RI. Informasi bersifat edukatif — bukan pengganti saran dokter atau ahli gizi.
            </p>
          </Card>
        </div>

        {/* Right: sidebar widgets (desktop only) */}
        <div className="hidden lg:flex flex-col gap-4 w-64 xl:w-72 flex-shrink-0">
          {/* Scanner promo widget */}
          <div className="rounded-xl border border-[--color-outline-variant] bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#006c49] text-[18px]">document_scanner</span>
              <p className="text-xs font-semibold text-[--color-on-surface]">AI Food Scanner</p>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wide">Beta</span>
            </div>
            <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed mb-3">
              Foto makananmu dan lihat estimasi nutrisinya. Berbasis data TKPI-2017.
            </p>
            <button
              onClick={() => setScannerOpen(true)}
              className="w-full py-2 px-3 rounded-lg bg-[#006c49] text-white text-xs font-semibold hover:bg-[#005a3c] transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">document_scanner</span>
              Coba Sekarang
            </button>
          </div>

          {KNOWLEDGE_WIDGETS.slice(0, 4).map((w) => (
            <SidebarWidget key={w.id} widget={w} />
          ))}
        </div>
      </div>

      {/* Scanner modal — lazy-loaded, mounted inside page root div */}
      {scannerOpen && (
        <Suspense fallback={null}>
          <FoodScannerModal onClose={() => setScannerOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
