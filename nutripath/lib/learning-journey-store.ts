/**
 * learning-journey-store.ts
 *
 * Baca hasil NutriQuest + Food Challenge dari localStorage, hitung topik lemah,
 * dan buat rekomendasi materi berbasis data aktual.
 *
 * Tidak membuat sistem penyimpanan baru — menggunakan nutriquest-store dan
 * challenge-store yang sudah ada.
 */

import { loadQuestResults, QuestResult } from "@/lib/nutriquest-store";
import { loadChallengeResults, ChallengeResult } from "@/lib/challenge-store";

// ── Knowledge topic map ───────────────────────────────────────────────────────
// Pemetaan dari domain NutriQuest → ID topik di Nutrition Knowledge page

export const DOMAIN_TO_KNOWLEDGE: Record<string, string[]> = {
  "Gizi Dasar": ["nutrition-basics", "food-choices"],
  "Pola Makan Sehat": ["food-choices", "student-meals", "food-labels"],
  "Hidrasi & Performa": ["hydration"],
  "Gizi Olahraga": ["hydration", "nutrition-basics"],
  "Makronutrien": ["nutrition-basics", "glycemic-index"],
  "Mikronutrien": ["nutrition-basics"],
  "Label Makanan": ["food-labels"],
  "Budget Gizi": ["student-meals", "food-choices"],
};

// ── Knowledge topic metadata (dipakai untuk render link rekomendasi) ──────────
export const KNOWLEDGE_META: Record<string, { title: string; category: string }> = {
  "nutrition-basics": { title: "Nutrition Basics", category: "Fundamentals" },
  "hydration": { title: "Hydration", category: "Wellness" },
  "food-choices": { title: "Food Choices", category: "Lifestyle" },
  "food-labels": { title: "Reading Food Labels", category: "Practical Skills" },
  "student-meals": { title: "Student Meals", category: "Quick Recipes" },
  "glycemic-index": { title: "Glycemic Index", category: "Fundamentals" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DomainStat {
  domain: string;
  attempts: number;
  averagePct: number;
  bestPct: number;
  /** Topik Nutrition Knowledge yang direkomendasikan */
  recommendedKnowledgeIds: string[];
  /** Apakah perlu dipelajari ulang (avg < 70%) */
  needsReview: boolean;
  /** Tren: "improving" | "stable" | "declining" | "insufficient" */
  trend: "improving" | "stable" | "declining" | "insufficient";
}

export interface LearningJourneySummary {
  /** Total aktivitas yang tercatat */
  totalActivities: number;
  /** Total NutriQuest yang diselesaikan */
  questAttempts: number;
  /** Total Food Challenge yang diselesaikan */
  challengeAttempts: number;
  /** Statistik per domain */
  domainStats: DomainStat[];
  /** Domain yang perlu dipelajari ulang */
  weakDomains: DomainStat[];
  /** Domain yang sudah dikuasai (avg >= 80%) */
  strongDomains: DomainStat[];
  /** Rekomendasi materi prioritas */
  topRecommendations: RecommendedTopic[];
  /** Apakah data cukup untuk rekomendasi (min 2 aktivitas) */
  hasEnoughData: boolean;
  /** Hasil quest terbaru */
  latestQuestResult: QuestResult | null;
  /** Hasil challenge terbaru */
  latestChallengeResult: ChallengeResult | null;
}

export interface RecommendedTopic {
  knowledgeId: string;
  title: string;
  category: string;
  reason: string;
  priority: "high" | "medium" | "low";
  relatedDomain: string;
}

// ── Core computation ──────────────────────────────────────────────────────────

export function computeLearningJourney(): LearningJourneySummary {
  const questResults = loadQuestResults();
  const challengeResults = loadChallengeResults();

  const totalActivities = questResults.length + challengeResults.length;
  const hasEnoughData = totalActivities >= 2;

  // Build per-domain stats from quest results
  const domainMap: Record<string, number[]> = {};
  for (const r of questResults) {
    if (!domainMap[r.domain]) domainMap[r.domain] = [];
    domainMap[r.domain].push(r.pct);
  }

  // Also incorporate challenge scenario domains
  for (const c of challengeResults) {
    for (const domain of c.relatedDomains) {
      if (!domainMap[domain]) domainMap[domain] = [];
      // Convert challenge score (0–100) to percentage equivalent
      domainMap[domain].push(c.score);
    }
  }

  const domainStats: DomainStat[] = Object.entries(domainMap).map(([domain, scores]) => {
    const averagePct = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestPct = Math.max(...scores);
    const needsReview = averagePct < 70 && scores.length >= 1;
    const recommendedKnowledgeIds = DOMAIN_TO_KNOWLEDGE[domain] ?? [];

    // Trend: needs at least 2 data points
    let trend: DomainStat["trend"] = "insufficient";
    if (scores.length >= 2) {
      const recent = scores[scores.length - 1];
      const prev = scores[scores.length - 2];
      if (recent > prev + 5) trend = "improving";
      else if (recent < prev - 5) trend = "declining";
      else trend = "stable";
    }

    return { domain, attempts: scores.length, averagePct, bestPct, recommendedKnowledgeIds, needsReview, trend };
  });

  const weakDomains = domainStats.filter((d) => d.needsReview);
  const strongDomains = domainStats.filter((d) => d.averagePct >= 80);

  // Build recommendations — deduplicated, prioritized
  const recMap = new Map<string, RecommendedTopic>();

  // High priority: weak domain topics
  for (const domain of weakDomains) {
    for (const kid of domain.recommendedKnowledgeIds) {
      const meta = KNOWLEDGE_META[kid];
      if (!meta || recMap.has(kid)) continue;
      recMap.set(kid, {
        knowledgeId: kid,
        title: meta.title,
        category: meta.category,
        reason: `Nilai rata-rata domain "${domain.domain}" masih ${domain.averagePct}%. Pelajari kembali materi ini untuk meningkatkan pemahamanmu.`,
        priority: "high",
        relatedDomain: domain.domain,
      });
    }
  }

  // Medium priority: domains with declining trend
  for (const domain of domainStats.filter((d) => d.trend === "declining")) {
    for (const kid of domain.recommendedKnowledgeIds) {
      const meta = KNOWLEDGE_META[kid];
      if (!meta || recMap.has(kid)) continue;
      recMap.set(kid, {
        knowledgeId: kid,
        title: meta.title,
        category: meta.category,
        reason: `Performa domain "${domain.domain}" menunjukkan tren menurun. Reviw materi ini untuk memperkuat pemahaman.`,
        priority: "medium",
        relatedDomain: domain.domain,
      });
    }
  }

  // Low priority: topics not yet covered
  if (questResults.length > 0 || challengeResults.length > 0) {
    for (const [kid, meta] of Object.entries(KNOWLEDGE_META)) {
      if (recMap.has(kid)) continue;
      // Only recommend uncovered topics if user has some activity
      const coveredDomains = new Set(domainStats.map((d) => d.domain));
      const domainsThatLinkHere = Object.entries(DOMAIN_TO_KNOWLEDGE)
        .filter(([, kids]) => kids.includes(kid))
        .map(([d]) => d);
      const isUncovered = !domainsThatLinkHere.some((d) => coveredDomains.has(d));
      if (isUncovered) {
        recMap.set(kid, {
          knowledgeId: kid,
          title: meta.title,
          category: meta.category,
          reason: "Topik ini belum pernah dicakup dalam latihanmu. Coba pelajari untuk memperluas wawasan gizi.",
          priority: "low",
          relatedDomain: domainsThatLinkHere[0] ?? "Umum",
        });
      }
    }
  }

  const topRecommendations = Array.from(recMap.values())
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 5);

  return {
    totalActivities,
    questAttempts: questResults.length,
    challengeAttempts: challengeResults.length,
    domainStats,
    weakDomains,
    strongDomains,
    topRecommendations,
    hasEnoughData,
    latestQuestResult: questResults[0] ?? null,
    latestChallengeResult: challengeResults[0] ?? null,
  };
}
