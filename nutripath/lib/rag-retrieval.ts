// NutriPath RAG Retrieval Engine
// Lightweight keyword + TF-IDF inspired retrieval for in-browser prototype
// In production this would be replaced by a vector database (Pinecone, Supabase pgvector, etc.)

import { knowledgeBase, KBEntry, KBCategory } from "./knowledge-base";

export interface RetrievedChunk {
  entry: KBEntry;
  score: number;
  matchedTerms: string[];
}

export interface UserContext {
  situation: string;
  availableFoods?: string;
  budget?: string;
  question: string;
  preferredLanguage?: "id" | "en";
}

// ─────────────────────────────────────────────────────────────────
// Tokenizer: split text into lowercase keywords
// ─────────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

// ─────────────────────────────────────────────────────────────────
// Stopwords (Indonesian + English) to reduce noise
// ─────────────────────────────────────────────────────────────────
const stopwords = new Set([
  "dan", "atau", "yang", "dengan", "untuk", "dari", "ini", "itu", "pada", "ke", "di",
  "ada", "mana", "apa", "bagaimana", "apakah", "saya", "kamu", "anda", "bisa", "boleh",
  "the", "and", "for", "with", "from", "this", "that", "are", "is", "in", "at", "to",
  "can", "what", "how", "which", "i", "my", "me", "a", "an", "of", "or", "but", "not",
  "have", "has", "was", "be", "been", "will", "would", "could", "should",
]);

function filterStopwords(tokens: string[]): string[] {
  return tokens.filter((t) => !stopwords.has(t));
}

// ─────────────────────────────────────────────────────────────────
// Situation → Category bias mapping
// Guides retrieval toward relevant knowledge areas
// ─────────────────────────────────────────────────────────────────
const situationCategoryBias: Record<string, KBCategory[]> = {
  "School Day": ["student_context", "food_choices", "hydration"],
  "At Home": ["basic_nutrition", "food_choices", "nutrition_education"],
  "Choosing Food": ["food_choices", "student_context", "basic_nutrition"],
  "Learning Nutrition": ["nutrition_education", "basic_nutrition", "food_label"],
  "Comparing Food": ["food_choices", "food_label", "basic_nutrition"],
  "Hydration": ["hydration"],
  "Other": ["basic_nutrition", "food_choices", "nutrition_education"],
};

// ─────────────────────────────────────────────────────────────────
// Main retrieval function — TF-IDF-like scoring + category bias
// ─────────────────────────────────────────────────────────────────
export function retrieveRelevantChunks(
  context: UserContext,
  topK = 5
): RetrievedChunk[] {
  // Build a combined query from all context fields
  const queryText = [
    context.situation,
    context.availableFoods ?? "",
    context.budget ?? "",
    context.question,
  ]
    .join(" ")
    .toLowerCase();

  const queryTokens = filterStopwords(tokenize(queryText));

  // Identify biased categories based on situation
  const biasedCategories = situationCategoryBias[context.situation] ?? [];

  // Score each KB entry
  const scored: RetrievedChunk[] = knowledgeBase.map((entry) => {
    const entryText = [entry.title, entry.content, entry.tags.join(" ")].join(" ").toLowerCase();
    const entryTokens = tokenize(entryText);
    const entryTokenSet = new Set(entryTokens);

    // Term frequency match
    const matchedTerms: string[] = [];
    let tfScore = 0;

    for (const token of queryTokens) {
      // Exact match
      if (entryTokenSet.has(token)) {
        matchedTerms.push(token);
        tfScore += 2;
      }
      // Tag exact match (higher weight)
      if (entry.tags.some((tag) => tag.toLowerCase().includes(token))) {
        tfScore += 3;
      }
      // Title match (high weight)
      if (entry.title.toLowerCase().includes(token)) {
        tfScore += 4;
      }
      // Partial match fallback
      else if (entryTokens.some((et) => et.includes(token) || token.includes(et))) {
        tfScore += 1;
      }
    }

    // Food-name matching from availableFoods field
    if (context.availableFoods) {
      const foods = context.availableFoods.toLowerCase().split(/[\s,\/]+/);
      for (const food of foods) {
        if (food.length > 2 && entryText.includes(food)) {
          tfScore += 5;
          if (!matchedTerms.includes(food)) matchedTerms.push(food);
        }
      }
    }

    // Category bias boost
    const categoryBoost = biasedCategories.includes(entry.category) ? 3 : 0;

    // Normalize by query length to avoid query length bias
    const normalizedScore = queryTokens.length > 0
      ? (tfScore / queryTokens.length) + categoryBoost
      : categoryBoost;

    return { entry, score: normalizedScore, matchedTerms: [...new Set(matchedTerms)] };
  });

  // Sort by score descending, filter out zero-score entries
  const results = scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // If no results, return top general entries by category bias
  if (results.length === 0) {
    return knowledgeBase
      .filter((e) => biasedCategories.includes(e.category))
      .slice(0, 3)
      .map((entry) => ({ entry, score: 0, matchedTerms: [] }));
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────
// Build context string for the LLM from retrieved chunks
// ─────────────────────────────────────────────────────────────────
export function buildKnowledgeContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (chunk, i) =>
        `[KNOWLEDGE ${i + 1}] Category: ${chunk.entry.category}\nTitle: ${chunk.entry.title}\nContent: ${chunk.entry.content}\nSource: ${chunk.entry.source}`
    )
    .join("\n\n---\n\n");
}

// ─────────────────────────────────────────────────────────────────
// Build system prompt for NutriPath RAG pipeline
// ─────────────────────────────────────────────────────────────────
export function buildSystemPrompt(context: UserContext, knowledgeContext: string): string {
  return `You are NutriPath, a personal nutrition navigator for students. Your role is EDUCATIONAL DECISION-SUPPORT — you help students understand nutrition and make better food decisions based on their situation.

CRITICAL RULES:
1. You are NOT a medical service. Never diagnose, prescribe, or make clinical health claims.
2. Base ALL recommendations strictly on the knowledge provided below — do not invent nutritional facts.
3. Always cite which knowledge source you're drawing from using [Knowledge 1], [Knowledge 2], etc.
4. Personalize your answer to the user's SPECIFIC context (situation, available foods, budget, question).
5. If the user's question is outside nutrition/food scope, politely redirect them.
6. Never assume health conditions the user hasn't mentioned.
7. Always include a responsible AI reminder at the end.
8. Respond in the same language as the user's question (Bahasa Indonesia or English).
9. Structure your response clearly using the format specified.

USER CONTEXT:
- Situation: ${context.situation}
- Available Foods: ${context.availableFoods || "Not specified"}
- Budget: ${context.budget || "Not specified"}
- Question: ${context.question}

RETRIEVED KNOWLEDGE BASE:
${knowledgeContext}

RESPONSE FORMAT (use this exact structure):
1. **Main Answer** — Direct answer to the question, personalized to the context
2. **Why This Matters** — Brief explanation of the nutritional reasoning (cite knowledge sources)
3. **Practical Suggestion** — Specific, actionable recommendation given their situation
4. **What to Watch For** — One or two things to be aware of
5. **Responsible AI Note** — Brief reminder that this is educational info, not medical advice

Keep the response helpful, friendly, and appropriate for a student. Avoid overly clinical language.`;
}
