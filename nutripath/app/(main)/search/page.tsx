"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SEARCH_SUGGESTIONS } from "@/lib/search";
import type { SearchResult } from "@/lib/search";

// ─── Category colour map ───────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  basic_nutrition: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hydration: "bg-blue-100 text-blue-700 border-blue-200",
  food_choices: "bg-orange-100 text-orange-700 border-orange-200",
  student_context: "bg-purple-100 text-purple-700 border-purple-200",
  food_label: "bg-yellow-100 text-yellow-700 border-yellow-200",
  nutrition_education: "bg-teal-100 text-teal-700 border-teal-200",
};

const CATEGORY_ICON: Record<string, string> = {
  basic_nutrition: "🥗",
  hydration: "💧",
  food_choices: "🍽️",
  student_context: "🎒",
  food_label: "🏷️",
  nutrition_education: "📚",
};

// ─── Search inner component (reads searchParams) ──────────────────────────

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setCount(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
      setCount(data.count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search when URL query changes
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    setInputValue(q);
    runSearch(q);
  }, [searchParams, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSuggestion = (s: string) => {
    router.push(`/search?q=${encodeURIComponent(s)}`);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="Search"
        title="Search Knowledge Base"
        subtitle="Find nutrition knowledge, food comparisons, and student guidance."
      />

      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-slate-400"
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
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Cari makanan, nutrisi, atau pertanyaan..."
          autoFocus
          className="block w-full pl-11 pr-24 py-3 border border-slate-200 rounded-xl text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-4 m-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-6 text-sm text-slate-500">
          <span className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Searching knowledge base…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result count */}
      {!loading && count !== null && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {count === 0 ? (
              <>No results for <span className="font-semibold text-slate-700">&ldquo;{query}&rdquo;</span></>
            ) : (
              <>
                <span className="font-semibold text-slate-700">{count}</span>
                {" "}result{count !== 1 ? "s" : ""} for{" "}
                <span className="font-semibold text-slate-700">&ldquo;{query}&rdquo;</span>
              </>
            )}
          </p>
          {count > 0 && (
            <span className="text-[11px] text-slate-400 font-medium">
              Sorted by relevance
            </span>
          )}
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <ul className="flex flex-col gap-3">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                className="block rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all p-4 group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-base">{CATEGORY_ICON[r.category] ?? "📄"}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        CATEGORY_COLOR[r.category] ?? "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {r.categoryLabel}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug mb-1">
                  {r.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                  {r.summary}
                </p>

                {/* Tags */}
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Source */}
                <p className="text-[10px] text-slate-400 mt-2 truncate">
                  📖 {r.source}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state (no results) */}
      {!loading && hasQuery && count === 0 && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
            🔍
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              No results found
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Try different keywords, or browse the suggestions below.
            </p>
          </div>
          <SuggestionChips onSelect={handleSuggestion} />
        </div>
      )}

      {/* Empty state (no query yet) */}
      {!loading && !hasQuery && (
        <div className="flex flex-col gap-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Try searching for
          </p>
          <SuggestionChips onSelect={handleSuggestion} />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mt-2">
            <p className="text-xs font-semibold text-slate-600 mb-3">
              📚 Browse by category
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_COLOR).map(([cat, colorClass]) => (
                <button
                  key={cat}
                  onClick={() =>
                    handleSuggestion(cat.replace(/_/g, " "))
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium text-left transition-opacity hover:opacity-80 ${colorClass}`}
                >
                  <span>{CATEGORY_ICON[cat]}</span>
                  <span>{cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Suggestion chips ──────────────────────────────────────────────────────

function SuggestionChips({ onSelect }: { onSelect: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SEARCH_SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─── Page (wraps in Suspense for useSearchParams) ─────────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-10 flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Loading search…
        </div>
      }
    >
      <SearchInner />
    </Suspense>
  );
}
