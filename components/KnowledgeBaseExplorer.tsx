"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { knowledgeBase, categoryMeta, KBCategory } from "@/lib/knowledge-base";

const categoryColorMap: Record<KBCategory, string> = {
  basic_nutrition: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  hydration: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  food_choices: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  student_context: "bg-violet-50 border-violet-200 hover:bg-violet-100",
  food_label: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  nutrition_education: "bg-teal-50 border-teal-200 hover:bg-teal-100",
};

const badgeColorMap: Record<KBCategory, string> = {
  basic_nutrition: "bg-emerald-100 text-emerald-700",
  hydration: "bg-blue-100 text-blue-700",
  food_choices: "bg-orange-100 text-orange-700",
  student_context: "bg-violet-100 text-violet-700",
  food_label: "bg-yellow-100 text-yellow-700",
  nutrition_education: "bg-teal-100 text-teal-700",
};

export function KnowledgeBaseExplorer() {
  const [activeCategory, setActiveCategory] = useState<KBCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Object.entries(categoryMeta) as [KBCategory, (typeof categoryMeta)[KBCategory]][];

  const filtered = knowledgeBase.filter((entry) => {
    const matchesCategory = activeCategory === "all" || entry.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      entry.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const countByCategory = (cat: KBCategory) =>
    knowledgeBase.filter((e) => e.category === cat).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-zinc-800">RAG Knowledge Base</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          {knowledgeBase.length} structured entries · 6 categories · Retrieved during each query
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search knowledge base…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder-zinc-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            activeCategory === "all"
              ? "bg-zinc-800 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          )}
        >
          All ({knowledgeBase.length})
        </button>
        {categories.map(([cat, meta]) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium transition-all",
              activeCategory === cat
                ? "bg-zinc-800 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            {meta.icon} {meta.label} ({countByCategory(cat)})
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-zinc-200 py-8 text-center text-sm text-zinc-400">
            No entries found
          </div>
        )}
        {filtered.map((entry) => {
          const meta = categoryMeta[entry.category];
          const isExpanded = expandedId === entry.id;
          return (
            <div
              key={entry.id}
              className={clsx(
                "rounded-xl border transition-all cursor-pointer",
                categoryColorMap[entry.category]
              )}
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
            >
              <div className="flex items-start gap-3 p-3.5">
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    badgeColorMap[entry.category]
                  )}
                >
                  {entry.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 leading-snug">{entry.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {meta.icon} {meta.label}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">{isExpanded ? "▲" : "▼"}</span>
              </div>

              {isExpanded && (
                <div className="border-t border-current/10 px-4 pb-4 pt-3 space-y-3">
                  <p className="text-sm text-zinc-700 leading-relaxed">{entry.content}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-white/70 border border-current/10 px-1.5 py-0.5 text-[10px] text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-current/10">
                    <span className="text-[11px] text-zinc-400">📖 Source:</span>
                    <span className="text-[11px] text-zinc-600 font-medium">{entry.source}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
