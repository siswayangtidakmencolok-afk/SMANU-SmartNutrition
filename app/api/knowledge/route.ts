import { NextRequest } from "next/server";
import { knowledgeBase } from "@/lib/knowledge-base";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────
// POST /api/knowledge
//
// Queries Langflow for topic-specific educational content.
// Falls back to local knowledge base if Langflow is unavailable.
//
// Body: { topicId: string, section: string }
// ─────────────────────────────────────────────────────────────

const LANGFLOW_FLOW_ID =
  process.env.LANGFLOW_FLOW_ID || "1a3246ec-c6c7-44d5-9509-66a623466633";

// Map topic IDs to Langflow-friendly query strings
const TOPIC_QUERIES: Record<string, Record<string, string>> = {
  "nutrition-basics": {
    overview:
      "Explain the key macronutrients: carbohydrates, protein, and fats in simple terms for students. What is their role in the body?",
    nutrients:
      "List and explain carbohydrates, protein, fats, fiber, vitamins, and minerals with their daily requirements for adolescents.",
    benefits:
      "What are the benefits of eating a balanced diet with adequate macronutrients and micronutrients for students?",
    sources:
      "What are the best food sources of carbohydrates, protein, fat, fiber, vitamins and minerals available to Indonesian students?",
    tips:
      "Give practical nutrition tips for students on how to get balanced macronutrients and micronutrients in affordable meals.",
    summary:
      "Summarize the most important nutrition basics every student should know about macronutrients and micronutrients.",
  },
  hydration: {
    overview:
      "Explain why hydration is important for students, especially during school. What happens when a student is dehydrated?",
    nutrients:
      "What electrolytes and minerals are involved in proper hydration? What do they do in the body?",
    benefits:
      "What are the cognitive and physical benefits of staying properly hydrated for students?",
    sources:
      "What are the best beverages for students to stay hydrated? What drinks should be avoided and why?",
    tips:
      "Give practical hydration tips for students during a school day — how many glasses, when to drink, what to avoid.",
    summary:
      "Summarize the key hydration guidelines every student should follow for optimal focus and health.",
  },
  "food-choices": {
    overview:
      "Explain the concept of balanced meals and food groups. How should a student build a nutritious plate?",
    nutrients:
      "What nutrients should a student prioritize when choosing food at school or on a budget?",
    benefits:
      "What are the benefits of making smart food choices for students — energy, focus, and wellbeing?",
    sources:
      "What are the best food group combinations for a balanced student meal? Give Indonesian-context examples.",
    tips:
      "Give practical tips for students on choosing better food options at a school canteen or warung on a tight budget.",
    summary:
      "Summarize how a student can make smarter food choices using simple principles of balance, variety, and affordability.",
  },
  "food-labels": {
    overview:
      "Explain what a nutrition facts label is and why students should learn to read it.",
    nutrients:
      "What are the key numbers on a food label that students should pay attention to? (calories, sugar, sodium, protein, fiber, serving size)",
    benefits:
      "How does reading food labels help students make better food and snack choices?",
    sources:
      "Show examples of what good vs. poor nutritional values look like on a food label for common student snacks.",
    tips:
      "Give step-by-step tips for how a student can quickly read and compare food labels when shopping or at a canteen.",
    summary:
      "Summarize the 5 most important things to check on a food label to make a smarter snack or meal choice.",
  },
  "student-meals": {
    overview:
      "What makes a student meal practical, nutritious, and affordable? What are the key principles of student meal planning?",
    nutrients:
      "What nutrients are most important for students to get in their daily meals? What are common deficiencies to watch for?",
    benefits:
      "What are the benefits of simple meal planning for students — academically, physically, and financially?",
    sources:
      "List the best affordable and nutritious meal options available to Indonesian students at school or home.",
    tips:
      "Give practical meal planning and preparation tips for students who have limited time, budget, or cooking facilities.",
    summary:
      "Summarize a simple daily meal plan that works for most Indonesian students, including breakfast, lunch, and dinner.",
  },
  "glycemic-index": {
    overview:
      "Explain the glycemic index (GI) in simple terms. Why does it matter for students who need sustained energy?",
    nutrients:
      "How does the glycemic index relate to carbohydrate types? What is the difference between high-GI and low-GI foods?",
    benefits:
      "What are the benefits of choosing lower-GI foods for students in terms of energy, concentration, and hunger?",
    sources:
      "Give examples of common Indonesian foods and their GI level — from low to high. Which should students prefer?",
    tips:
      "Give practical tips for how students can make lower-GI food choices in real situations like school canteens.",
    summary:
      "Summarize how understanding glycemic index can help students maintain energy and focus throughout the school day.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, section } = body as { topicId: string; section: string };

    if (!topicId || !section) {
      return new Response(JSON.stringify({ error: "Missing topicId or section" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ─────────────────────────────────────────────────────────
    // Try Langflow first
    // ─────────────────────────────────────────────────────────
    const apiKey = process.env.LANGFLOW_API_KEY;
    const serverUrl = process.env.LANGFLOW_SERVER_URL;
    const queryMap = TOPIC_QUERIES[topicId];
    const query = queryMap?.[section];

    if (apiKey && serverUrl && query) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);

        const inputValue = `[NUTRITION KNOWLEDGE QUERY — TOPIC: ${topicId.toUpperCase()}, SECTION: ${section.toUpperCase()}]\n\n${query}\n\nPlease answer in clear, educational language suitable for a high school or university student. Structure your answer with short paragraphs. Be factual, cite general nutrition science principles, and do not make any medical diagnoses.`;

        let langflowRes: Response;
        try {
          langflowRes = await fetch(
            `${serverUrl}/api/v1/run/${LANGFLOW_FLOW_ID}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
              },
              body: JSON.stringify({
                input_value: inputValue,
                input_type: "chat",
                output_type: "chat",
                session_id: `knowledge-${topicId}-${section}`,
              }),
              signal: controller.signal,
              cache: "no-store",
            }
          );
        } finally {
          clearTimeout(timeout);
        }

        if (langflowRes.ok) {
          const data = await langflowRes.json();
          const text = extractAnswer(data);
          if (text) {
            return new Response(
              JSON.stringify({ content: text, source: "langflow" }),
              { headers: { "Content-Type": "application/json" } }
            );
          }
        }
      } catch {
        // Langflow unavailable — fall through to local KB
        console.warn("[knowledge] Langflow unavailable, using local KB");
      }
    }

    // ─────────────────────────────────────────────────────────
    // Fallback: local knowledge base
    // ─────────────────────────────────────────────────────────
    const localContent = buildLocalContent(topicId, section);
    return new Response(
      JSON.stringify({ content: localContent, source: "local" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[knowledge] route error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Extract text from Langflow response
// ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAnswer(data: any): string {
  const candidates = [
    data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text,
    data?.outputs?.[0]?.outputs?.[0]?.results?.message?.content,
    data?.outputs?.[0]?.outputs?.[0]?.results?.text,
    data?.outputs?.[0]?.outputs?.[0]?.message?.text,
    data?.outputs?.[0]?.outputs?.[0]?.message?.content,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 10) return c.trim();
  }
  return "";
}

// ─────────────────────────────────────────────────────────────
// Build content from local KB entries filtered by topic
// ─────────────────────────────────────────────────────────────
function buildLocalContent(topicId: string, section: string): string {
  const categoryMap: Record<string, string[]> = {
    "nutrition-basics": ["basic_nutrition"],
    hydration: ["hydration"],
    "food-choices": ["food_choices"],
    "food-labels": ["food_label"],
    "student-meals": ["student_context"],
    "glycemic-index": ["nutrition_education", "basic_nutrition"],
  };

  const relevantCategories = categoryMap[topicId] ?? ["basic_nutrition"];
  const entries = knowledgeBase.filter((e) =>
    relevantCategories.includes(e.category)
  );

  if (entries.length === 0) {
    return "Content for this section is currently being prepared. Check back soon.";
  }

  // Pick a subset of entries per section
  const sectionIndex: Record<string, number> = {
    overview: 0,
    nutrients: 1,
    benefits: 2,
    sources: 3,
    tips: 4,
    summary: 5,
  };

  const idx = sectionIndex[section] ?? 0;
  const entry = entries[idx % entries.length];

  return `**${entry.title}**\n\n${entry.content}\n\n*Source: ${entry.source}*`;
}
