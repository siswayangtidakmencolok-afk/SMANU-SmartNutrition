/**
 * NutriPath Search Engine
 * Weighted full-text search over the local knowledge base.
 * Architecture: Search UI → Search Service (this file) → Knowledge Repository → Data Source
 * Replacing the data source (e.g., Astra DB) only requires updating the import below.
 */

import { knowledgeBase, KBEntry, KBCategory } from "./knowledge-base";

// ─── Category → Route Slug Mapping ───────────────────────────────────────────

const categoryToSlug: Record<KBCategory, string> = {
  basic_nutrition: "nutrition-basics",
  hydration: "hydration",
  food_choices: "food-choices",
  food_label: "food-labels",
  student_context: "student-meals",
  nutrition_education: "glycemic-index",
};

// ─── Result Shape ─────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  summary: string;      // first 160 chars of content
  category: KBCategory;
  categoryLabel: string;
  tags: string[];
  source: string;
  href: string;         // navigable link to /nutrition-knowledge/[slug]
  score: number;        // relevance score (higher = more relevant)
  matchedOn: string[];  // e.g. ["title", "tags"] for UI highlighting
}

// ─── Scoring Weights ──────────────────────────────────────────────────────────

const WEIGHT = {
  title: 10,
  tags: 7,
  category: 5,
  source: 3,
  content: 1,
} as const;

// ─── Core Search Function ─────────────────────────────────────────────────────

/**
 * Search the knowledge base by query string.
 * Returns results sorted by relevance score (descending).
 * Case-insensitive, trims whitespace, normalises multiple spaces.
 */
export function searchKnowledgeBase(rawQuery: string): SearchResult[] {
  const query = rawQuery.trim().replace(/\s+/g, " ").toLowerCase();

  if (!query) return [];

  // Split into tokens so "protein egg" matches entries containing both words
  const tokens = query.split(" ").filter((t) => t.length >= 2);

  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const entry of knowledgeBase) {
    let score = 0;
    const matchedOn: Set<string> = new Set();

    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const categoryLower = entry.category.replace(/_/g, " ").toLowerCase();
    const tagsLower = entry.tags.map((t) => t.toLowerCase());
    const sourceLower = entry.source.toLowerCase();

    for (const token of tokens) {
      // Title match
      if (titleLower.includes(token)) {
        score += WEIGHT.title;
        matchedOn.add("title");
      }

      // Tags match
      if (tagsLower.some((tag) => tag.includes(token))) {
        score += WEIGHT.tags;
        matchedOn.add("tags");
      }

      // Category match
      if (categoryLower.includes(token)) {
        score += WEIGHT.category;
        matchedOn.add("category");
      }

      // Source match
      if (sourceLower.includes(token)) {
        score += WEIGHT.source;
        matchedOn.add("source");
      }

      // Content match
      if (contentLower.includes(token)) {
        score += WEIGHT.content;
        matchedOn.add("content");
      }
    }

    if (score > 0) {
      const slug = categoryToSlug[entry.category];
      results.push({
        id: entry.id,
        title: entry.title,
        summary: entry.content.slice(0, 160).replace(/\s+/g, " ").trimEnd() + "…",
        category: entry.category,
        categoryLabel: entry.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        tags: entry.tags.slice(0, 5),
        source: entry.source,
        href: `/nutrition-knowledge/${slug}`,
        score,
        matchedOn: Array.from(matchedOn),
      });
    }
  }

  // Sort by score descending, then alphabetically by title for ties
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return results;
}

// ─── Suggestions (shown on empty state) ──────────────────────────────────────

export const SEARCH_SUGGESTIONS = [
  "protein",
  "nasi telur",
  "hydration",
  "food label",
  "kantin sekolah",
  "fiber",
  "mie instan",
  "glycemic index",
  "breakfast",
  "affordable meal",
];
