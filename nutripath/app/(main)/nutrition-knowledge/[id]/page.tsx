"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  KNOWLEDGE_TOPICS,
  findTopicById,
  getAdjacentTopics,
  KnowledgeTopic,
  ContentSection,
} from "@/lib/nutrition-knowledge-data";

// ─────────────────────────────────────────────────────────────────
// Tab definitions — 6 sections per topic
// ─────────────────────────────────────────────────────────────────

interface Tab {
  id: string;
  label: string;
  icon: string;        // material symbol name
  description: string;
}

const TABS: Tab[] = [
  { id: "overview",  label: "Gambaran",        icon: "overview",           description: "Tentang topik ini" },
  { id: "nutrients", label: "Nutrisi Utama",   icon: "nutrition",          description: "Ilmu di balik topik ini" },
  { id: "benefits",  label: "Manfaat",         icon: "favorite",           description: "Mengapa ini penting" },
  { id: "sources",   label: "Sumber Pangan",   icon: "restaurant",         description: "Di mana mendapatkannya" },
  { id: "tips",      label: "Tips Praktis",    icon: "tips_and_updates",   description: "Yang bisa kamu lakukan" },
  { id: "summary",   label: "Ringkasan",       icon: "summarize",          description: "Kesimpulan utama" },
];

// ─────────────────────────────────────────────────────────────────
// Build static fallback text from ContentSection[] for a given tab
// Maps the 6 tab IDs to sections by index (overview→0, etc.)
// Falls back gracefully when fewer sections exist.
// ─────────────────────────────────────────────────────────────────

const TAB_SECTION_MAP: Record<string, number> = {
  overview: 0,
  nutrients: 1,
  benefits: 2,
  sources: 3,
  tips: 4,
  summary: 5,
};

function buildFallbackText(topic: KnowledgeTopic, tabId: string): string {
  const idx = TAB_SECTION_MAP[tabId] ?? 0;
  const section: ContentSection | undefined = topic.content[idx];
  if (!section) {
    // Concatenate all remaining sections as a fallback for the last tabs
    const all = topic.content
      .slice(Math.max(0, idx - 1))
      .map((s) => (s.heading ? `**${s.heading}**\n\n${s.body}` : s.body))
      .join("\n\n");
    return all || topic.summary;
  }
  const heading = section.heading ? `**${section.heading}**\n\n` : "";
  return heading + section.body;
}

// ─────────────────────────────────────────────────────────────────
// Simple markdown-to-JSX renderer (bold + bullets + newlines + tables)
// ─────────────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  if (!text) return null;
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[--color-on-surface]">
      {text.split("\n\n").map((para, pi) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Table detection (starts with | )
        if (trimmed.startsWith("|")) {
          const rows = trimmed.split("\n").filter((r) => r.trim() && !r.match(/^\|[-\s|]+\|$/));
          return (
            <div key={pi} className="overflow-x-auto rounded-lg border border-[--color-outline-variant]">
              <table className="w-full text-xs">
                <tbody>
                  {rows.map((row, ri) => {
                    const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
                    return (
                      <tr key={ri} className={ri === 0 ? "bg-[--color-surface-container-high] font-semibold" : "border-t border-[--color-outline-variant]/40"}>
                        {cells.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Bullet list
        if (trimmed.includes("\n•") || trimmed.startsWith("•")) {
          const items = trimmed.split("\n").filter((l) => l.trim());
          return (
            <ul key={pi} className="space-y-1.5">
              {items.map((item, ii) => {
                const clean = item.replace(/^[•\-*]\s*/, "");
                return (
                  <li key={ii} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-secondary] flex-shrink-0" />
                    <span>{renderInline(clean)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return <p key={pi}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-[--color-on-surface]">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Inline article content renderer (from ContentSection[])
// Used when RAG/API is not available and we render directly from data
// ─────────────────────────────────────────────────────────────────

function ArticleContent({ topic }: { topic: KnowledgeTopic }) {
  return (
    <div className="space-y-6">
      {topic.content.map((section, idx) => (
        <div key={idx}>
          {section.heading && (
            <h3 className="text-sm font-semibold text-[--color-on-surface] mb-2 flex items-center gap-2">
              <span className={clsx("w-1.5 h-4 rounded-full flex-shrink-0", topic.accentColor)} />
              {section.heading}
            </h3>
          )}
          {renderMarkdown(section.body)}
        </div>
      ))}

      {/* Sources */}
      {topic.sources.length > 0 && (
        <div className="pt-4 border-t border-[--color-outline-variant]">
          <p className="text-[11px] font-semibold text-[--color-on-surface-variant] mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">book</span>
            Referensi
          </p>
          <ul className="space-y-1">
            {topic.sources.map((src, i) => (
              <li key={i} className="text-[11px] text-[--color-on-surface-variant] flex gap-2">
                <span className="flex-shrink-0">{i + 1}.</span>
                <span>{src}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main detail page component
// ─────────────────────────────────────────────────────────────────

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const topic = findTopicById(id);
  const { prev: prevTopic, next: nextTopic } = topic
    ? getAdjacentTopics(id)
    : { prev: null, next: null };

  const [activeTab, setActiveTab] = useState("overview");
  const [loadingTab, setLoadingTab] = useState<string | null>(null);
  const [contentCache, setContentCache] = useState<Record<string, { text: string; source: string }>>({});
  const [ragError, setRagError] = useState<string | null>(null);
  const [useInlineMode, setUseInlineMode] = useState(false);

  // ── Fetch section content from API ────────────────────────────
  const fetchSection = useCallback(
    async (section: string) => {
      if (!topic) return;
      if (contentCache[section]) return; // already loaded

      setLoadingTab(section);
      setRagError(null);

      try {
        const res = await fetch("/api/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId: topic.id, section }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { content: string; source: string };

        setContentCache((prev) => ({
          ...prev,
          [section]: { text: data.content, source: data.source },
        }));
      } catch {
        // On error, fall back to static content from nutrition-knowledge-data.ts
        const fallback = buildFallbackText(topic, section);
        setContentCache((prev) => ({
          ...prev,
          [section]: { text: fallback, source: "static" },
        }));
        setRagError("Koneksi ke AI tidak tersedia — menampilkan konten kurikulum terverifikasi.");
      } finally {
        setLoadingTab(null);
      }
    },
    [topic, contentCache]
  );

  // Load the first tab on mount
  useEffect(() => {
    fetchSection("overview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Tab switch ────────────────────────────────────────────────
  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    fetchSection(tabId);
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="material-symbols-outlined text-[48px] text-[--color-on-surface-variant]">
          search_off
        </span>
        <p className="text-base font-semibold text-[--color-on-surface]">Topik tidak ditemukan</p>
        <Link
          href="/nutrition-knowledge"
          className="text-sm text-[--color-secondary] underline underline-offset-2"
        >
          ← Kembali ke Materi Nutrisi
        </Link>
      </div>
    );
  }

  const currentContent = contentCache[activeTab];
  const isLoading = loadingTab === activeTab;
  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs text-[--color-on-surface-variant]">
        <Link
          href="/nutrition-knowledge"
          className="hover:text-[--color-secondary] transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">library_books</span>
          Materi Nutrisi
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[--color-on-surface] font-medium truncate max-w-[200px] sm:max-w-none">
          {topic.title}
        </span>
      </nav>

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-52">
        {topic.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={topic.image}
            alt={topic.imageAlt || topic.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        {/* Fallback gradient when image missing */}
        <div className={clsx("absolute inset-0", topic.accentColor, "opacity-30")} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end gap-3">
            <div
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0",
                topic.accentColor
              )}
            >
              {topic.iconEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-semibold uppercase tracking-wide">
                  {topic.category}
                </span>
                <span className="text-[10px] text-white/70">{topic.readTime}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{topic.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Description + tags row ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
        <p className="text-sm text-[--color-on-surface-variant] leading-relaxed max-w-2xl">
          {topic.summary}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:flex-shrink-0">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-[--color-secondary]/10 text-[--color-secondary] text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── View mode toggle ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUseInlineMode(false)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            !useInlineMode
              ? "bg-[--color-secondary] text-white"
              : "bg-[--color-surface-container] text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high]"
          )}
        >
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            Mode AI
          </span>
        </button>
        <button
          onClick={() => setUseInlineMode(true)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            useInlineMode
              ? "bg-[--color-secondary] text-white"
              : "bg-[--color-surface-container] text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high]"
          )}
        >
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">article</span>
            Baca Lengkap
          </span>
        </button>
      </div>

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Left: content panel ─────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ── INLINE MODE: render all ContentSection[] directly ── */}
          {useInlineMode ? (
            <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[--color-outline-variant] bg-[--color-surface-container-low]">
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center text-lg", topic.accentColor)}>
                  {topic.iconEmoji}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[--color-on-surface]">{topic.title}</h2>
                  <p className="text-[11px] text-[--color-on-surface-variant]">Artikel lengkap</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium flex-shrink-0 border-[--color-outline-variant] text-[--color-on-surface-variant]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Konten Terverifikasi
                </div>
              </div>
              <div className="p-5">
                <ArticleContent topic={topic} />
              </div>
            </div>
          ) : (
            /* ── TAB / AI MODE ─────────────────────────────────── */
            <>
              {/* Tab bar */}
              <div className="flex overflow-x-auto gap-1 bg-[--color-surface-container-lowest] rounded-xl p-1 border border-[--color-outline-variant] mb-4 scrollbar-hide">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                      activeTab === tab.id
                        ? "bg-[--color-secondary] text-white shadow-sm"
                        : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]"
                    )}
                  >
                    <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                    {tab.label}
                    {contentCache[tab.id] && activeTab !== tab.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* RAG error banner */}
              {ragError && (
                <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  <span className="material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5">info</span>
                  <span>{ragError}</span>
                </div>
              )}

              {/* Content card */}
              <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[--color-outline-variant] bg-[--color-surface-container-low]">
                  <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", topic.accentColor)}>
                    <span className="material-symbols-outlined text-white text-[16px]">
                      {activeTabMeta.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[--color-on-surface]">
                      {activeTabMeta.label}
                    </h2>
                    <p className="text-[11px] text-[--color-on-surface-variant]">
                      {activeTabMeta.description}
                    </p>
                  </div>

                  {/* Source badge */}
                  {currentContent && (
                    <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium flex-shrink-0
                      border-[--color-outline-variant] text-[--color-on-surface-variant]">
                      {currentContent.source === "langflow" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          RAG — Live
                        </>
                      ) : currentContent.source === "local" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          RAG — Local KB
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Konten Terverifikasi
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Content body */}
                <div className="p-5">
                  {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-[--color-surface-container-high] rounded w-3/4" />
                      <div className="h-4 bg-[--color-surface-container-high] rounded w-full" />
                      <div className="h-4 bg-[--color-surface-container-high] rounded w-5/6" />
                      <div className="h-4 bg-[--color-surface-container-high] rounded w-2/3" />
                      <div className="h-4 bg-[--color-surface-container-high] rounded w-full" />
                      <div className="h-4 bg-[--color-surface-container-high] rounded w-4/5" />
                    </div>
                  ) : currentContent ? (
                    renderMarkdown(currentContent.text)
                  ) : (
                    <div className="flex flex-col items-center py-10 gap-2 text-[--color-on-surface-variant]">
                      <span className="material-symbols-outlined text-[32px]">pending</span>
                      <p className="text-sm">Memuat konten…</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-[--color-outline-variant] bg-[--color-surface-container-low] flex items-center justify-between gap-3 text-[11px] text-[--color-on-surface-variant]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    Informasi edukatif. Bukan pengganti saran medis.
                  </div>
                  <button
                    onClick={() => {
                      setContentCache((prev) => {
                        const next = { ...prev };
                        delete next[activeTab];
                        return next;
                      });
                      fetchSection(activeTab);
                    }}
                    className="flex items-center gap-1 hover:text-[--color-secondary] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">refresh</span>
                    Muat Ulang
                  </button>
                </div>
              </div>

              {/* ── Section pagination ──────────────────────────────── */}
              <div className="flex justify-between mt-3 gap-3">
                {(() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  const prevTab = idx > 0 ? TABS[idx - 1] : null;
                  const nextTab = idx < TABS.length - 1 ? TABS[idx + 1] : null;
                  return (
                    <>
                      {prevTab ? (
                        <button
                          onClick={() => handleTabChange(prevTab.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--color-surface-container-lowest] border border-[--color-outline-variant] text-xs text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                          {prevTab.label}
                        </button>
                      ) : (
                        <div />
                      )}
                      {nextTab ? (
                        <button
                          onClick={() => handleTabChange(nextTab.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--color-secondary] text-white text-xs font-medium hover:bg-[--color-secondary]/90 transition-colors"
                        >
                          {nextTab.label}
                          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                        </button>
                      ) : (
                        <div />
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>

        {/* ── Right: Sidebar ───────────────────────────────────── */}
        <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-4 flex-shrink-0">
          {/* Outline / progress — only in tab mode */}
          {!useInlineMode && (
            <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] p-4">
              <p className="text-xs font-semibold text-[--color-on-surface] mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[--color-secondary]">
                  format_list_bulleted
                </span>
                Bagian Materi
              </p>
              <div className="space-y-1">
                {TABS.map((tab, ti) => {
                  const done = !!contentCache[tab.id];
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={clsx(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-all",
                        active
                          ? "bg-[--color-secondary]/10 text-[--color-secondary] font-medium"
                          : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]"
                      )}
                    >
                      <span
                        className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                          active
                            ? "bg-[--color-secondary] text-white"
                            : done
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-[--color-surface-container-high] text-[--color-on-surface-variant]"
                        )}
                      >
                        {done && !active ? "✓" : ti + 1}
                      </span>
                      <span className="truncate">{tab.label}</span>
                      {loadingTab === tab.id && (
                        <span className="ml-auto w-3 h-3 border border-[--color-secondary] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tanya AI SMANU — opens floating chat bubble */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("smanu:open-chat", {
                detail: {
                  topicId: topic.id,
                  topicTitle: topic.title,
                  suggestedQuestion: `Jelaskan topik "${topic.title}" dengan bahasa yang lebih sederhana`,
                }
              }));
            }}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[--color-secondary] to-[--color-primary] text-white hover:opacity-90 transition-opacity w-full text-left"
          >
            <span className="material-symbols-outlined text-[22px] flex-shrink-0">
              psychology
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold">Tanya AI SMANU</p>
              <p className="text-[10px] text-white/75 leading-tight">
                Punya pertanyaan tentang topik ini? Tanya lewat chat AI.
              </p>
            </div>
            <span className="material-symbols-outlined text-[16px] flex-shrink-0">
              chat
            </span>
          </button>

          {/* Food Challenge quick action */}
          {topic.relatedFoodIds.length > 0 && (
            <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] p-4">
              <p className="text-xs font-semibold text-[--color-on-surface] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[--color-secondary]">
                  restaurant_menu
                </span>
                Coba di Food Challenge
              </p>
              <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed mb-3">
                Praktikkan materi ini dengan menyusun pilihan makanan di Food Challenge.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/food-challenge"
                  className="w-full py-2 px-3 rounded-lg bg-[--color-secondary]/10 text-[--color-secondary] text-xs font-semibold hover:bg-[--color-secondary]/20 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">restaurant_menu</span>
                  Susun Piring Makan
                </Link>
                {topic.comparatorLink && (
                  <Link
                    href="/food-challenge/comparator"
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
                    {topic.comparatorLink.label}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Responsible AI notice */}
          <div className="rounded-xl border border-[--color-outline-variant] bg-[--color-surface-container-lowest] p-4">
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-500 flex-shrink-0 mt-0.5">
                policy
              </span>
              <div>
                <p className="text-xs font-semibold text-[--color-on-surface] mb-1">
                  Informasi Edukatif
                </p>
                <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed">
                  Materi ini bersifat edukatif. Untuk keputusan kesehatan personal, konsultasikan dengan dokter atau ahli gizi.
                </p>
              </div>
            </div>
          </div>

          {/* Related topics quick links */}
          <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] p-4">
            <p className="text-xs font-semibold text-[--color-on-surface] mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[--color-secondary]">
                link
              </span>
              Topik Lainnya
            </p>
            <div className="flex flex-col gap-1">
              {KNOWLEDGE_TOPICS.filter((t) => t.id !== topic.id)
                .slice(0, 4)
                .map((t) => (
                  <Link
                    key={t.id}
                    href={`/nutrition-knowledge/${t.id}`}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-secondary] transition-colors"
                  >
                    <span className="text-sm flex-shrink-0">{t.iconEmoji}</span>
                    <span className="truncate">{t.title}</span>
                  </Link>
                ))}
              <Link
                href="/nutrition-knowledge"
                className="flex items-center gap-1 py-1.5 px-2 text-xs text-[--color-secondary] hover:underline mt-1"
              >
                <span className="material-symbols-outlined text-[13px]">grid_view</span>
                Lihat semua topik
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Topic navigation (prev / next topic) ────────────────── */}
      <div className="flex gap-3 pt-2 border-t border-[--color-outline-variant]">
        {prevTopic ? (
          <Link
            href={`/nutrition-knowledge/${prevTopic.id}`}
            className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-[--color-surface-container-lowest] border border-[--color-outline-variant] hover:border-[--color-secondary] hover:bg-[--color-surface-container-low] transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] text-[--color-on-surface-variant] group-hover:text-[--color-secondary] transition-colors">
              arrow_back
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-[--color-on-surface-variant] mb-0.5">Sebelumnya</p>
              <p className="text-xs font-semibold text-[--color-on-surface] truncate group-hover:text-[--color-secondary] transition-colors">
                {prevTopic.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextTopic ? (
          <Link
            href={`/nutrition-knowledge/${nextTopic.id}`}
            className="flex-1 flex items-center justify-end gap-3 p-4 rounded-xl bg-[--color-surface-container-lowest] border border-[--color-outline-variant] hover:border-[--color-secondary] hover:bg-[--color-surface-container-low] transition-all group text-right"
          >
            <div className="min-w-0">
              <p className="text-[10px] text-[--color-on-surface-variant] mb-0.5">Berikutnya</p>
              <p className="text-xs font-semibold text-[--color-on-surface] truncate group-hover:text-[--color-secondary] transition-colors">
                {nextTopic.title}
              </p>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[--color-on-surface-variant] group-hover:text-[--color-secondary] transition-colors flex-shrink-0">
              arrow_forward
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
