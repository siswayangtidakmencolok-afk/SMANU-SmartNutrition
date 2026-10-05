"use client";

import { useState, useRef } from "react";
import { SituationSelector } from "@/components/SituationSelector";
import { StreamingResponse } from "@/components/StreamingResponse";
import { KnowledgeBaseExplorer } from "@/components/KnowledgeBaseExplorer";
import { RetrievedChunkMeta } from "@/lib/types";
import { clsx } from "clsx";

type Tab = "navigate" | "knowledge" | "about";
type QueryStatus = "idle" | "loading" | "streaming" | "done" | "error";

// Example prompts to guide users
const examplePrompts = [
  {
    situation: "School Day",
    availableFoods: "nasi, telur, ayam goreng, sayur bayam",
    budget: "Rp15.000",
    question: "Mana pilihan makan siang yang paling seimbang dari makanan yang tersedia?",
  },
  {
    situation: "Comparing Food",
    availableFoods: "mie instan, nasi + tempe",
    budget: "Rp10.000",
    question: "Antara mie instan dan nasi + tempe, mana yang lebih baik untuk makan siang?",
  },
  {
    situation: "Hydration",
    availableFoods: "air putih, teh botol, susu, jus jeruk",
    budget: "",
    question: "Minuman apa yang paling baik untuk dikonsumsi selama hari sekolah?",
  },
  {
    situation: "Learning Nutrition",
    availableFoods: "",
    budget: "",
    question: "Apa itu glikemik indeks dan mengapa itu penting untuk konsentrasi saat belajar?",
  },
  {
    situation: "Choosing Food",
    availableFoods: "gorengan, roti, buah, yogurt",
    budget: "Rp8.000",
    question: "Saya hanya punya Rp8.000 untuk snack sore, pilihan mana yang paling bergizi?",
  },
];

export default function NutriPathApp() {
  const [activeTab, setActiveTab] = useState<Tab>("navigate");

  // Query form state
  const [situation, setSituation] = useState("School Day");
  const [availableFoods, setAvailableFoods] = useState("");
  const [budget, setBudget] = useState("");
  const [question, setQuestion] = useState("");

  // Response state
  const [status, setStatus] = useState<QueryStatus>("idle");
  const [responseText, setResponseText] = useState("");
  const [retrievedChunks, setRetrievedChunks] = useState<RetrievedChunkMeta[]>([]);
  const [error, setError] = useState("");
  const [hasQueried, setHasQueried] = useState(false);

  const responseRef = useRef<HTMLDivElement>(null);

  function loadExample(idx: number) {
    const ex = examplePrompts[idx];
    setSituation(ex.situation);
    setAvailableFoods(ex.availableFoods);
    setBudget(ex.budget);
    setQuestion(ex.question);
    setStatus("idle");
    setResponseText("");
    setRetrievedChunks([]);
    setHasQueried(false);
  }

  async function handleSubmit() {
    if (!question.trim() || !situation) return;

    setStatus("loading");
    setResponseText("");
    setRetrievedChunks([]);
    setError("");
    setHasQueried(true);

    try {
      const res = await fetch("/api/nutripath", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, availableFoods, budget, question }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Request failed");
      }

      if (!res.body) throw new Error("No response stream");

      setStatus("streaming");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data) continue;

          try {
            const event = JSON.parse(data);

            if (event.type === "meta") {
              setRetrievedChunks(event.chunks);
            } else if (event.type === "token") {
              setResponseText((prev) => prev + event.content);
              // Scroll to response
              setTimeout(() => {
                responseRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }, 100);
            } else if (event.type === "done") {
              setStatus("done");
            }
          } catch {
            // skip malformed events
          }
        }
      }

      if (status !== "done") setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResponseText("");
    setRetrievedChunks([]);
    setHasQueried(false);
    setError("");
  }

  const canSubmit = question.trim().length > 3 && situation && status !== "loading" && status !== "streaming";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold shadow-sm">
                N
              </div>
              <div>
                <span className="text-base font-bold text-zinc-900">NutriPath</span>
                <span className="ml-1.5 hidden text-xs text-zinc-400 sm:inline">
                  Personal Nutrition Navigator
                </span>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-0.5">
              {(["navigate", "knowledge", "about"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "rounded-lg px-3 py-1.5 text-sm capitalize transition-all",
                    activeTab === tab
                      ? "bg-zinc-100 font-semibold text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  {tab === "navigate" ? "🧭 Navigate" : tab === "knowledge" ? "📚 Knowledge" : "ℹ️ About"}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {/* ── Navigate Tab ── */}
        {activeTab === "navigate" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            {/* Left: Input panel */}
            <div className="space-y-5">
              {/* Hero */}
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold leading-snug">
                      Your Personal Nutrition Navigator
                    </h1>
                    <p className="mt-1.5 text-sm text-emerald-100 leading-relaxed max-w-sm">
                      Get context-aware nutrition guidance based on your real situation. Powered by a
                      structured knowledge base — not generic AI guessing.
                    </p>
                  </div>
                  <div className="shrink-0 text-4xl">🥗</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["RAG-Powered", "Context-Aware", "Educational", "Student-First"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 1: Situation */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    1
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-700">What&apos;s your situation?</h2>
                </div>
                <SituationSelector selected={situation} onChange={setSituation} />
              </div>

              {/* Step 2: Available foods */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    2
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-700">
                    What&apos;s available to you?{" "}
                    <span className="text-zinc-400 font-normal">(optional)</span>
                  </h2>
                </div>
                <input
                  type="text"
                  placeholder="e.g. nasi, telur, ayam goreng, sayur, tahu, tempe"
                  value={availableFoods}
                  onChange={(e) => setAvailableFoods(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <p className="text-[11px] text-zinc-400">
                  List foods available at your canteen, home, or nearby — helps personalize the answer
                </p>
              </div>

              {/* Step 3: Budget */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    3
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-700">
                    Budget?{" "}
                    <span className="text-zinc-400 font-normal">(optional)</span>
                  </h2>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Rp15.000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              {/* Step 4: Question */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    4
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-700">Your question</h2>
                </div>
                <textarea
                  placeholder="Ask anything about food choices, nutrition, hydration, food labels, or meal planning…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={clsx(
                    "flex-1 rounded-xl py-3 text-sm font-semibold transition-all",
                    canSubmit
                      ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]"
                      : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  )}
                >
                  {status === "loading" || status === "streaming"
                    ? "⏳ Retrieving & Generating…"
                    : "🧭 Get Nutrition Guidance"}
                </button>
                {hasQueried && (
                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Example prompts */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Try an example
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examplePrompts.slice(0, 4).map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => loadExample(i)}
                      className="rounded-xl border border-zinc-200 bg-white p-3 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                    >
                      <p className="text-[11px] font-semibold text-emerald-600 group-hover:text-emerald-700">
                        {ex.situation}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-600 line-clamp-2">{ex.question}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Response panel */}
            <div className="space-y-4" ref={responseRef}>
              {/* Context summary card (shown when user has filled in context) */}
              {(situation || availableFoods || budget) && (
                <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Your Context
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-zinc-400 w-20 shrink-0">Situation:</span>
                      <span className="text-xs font-medium text-zinc-700">{situation}</span>
                    </div>
                    {availableFoods && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-zinc-400 w-20 shrink-0">Foods:</span>
                        <span className="text-xs text-zinc-700">{availableFoods}</span>
                      </div>
                    )}
                    {budget && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-zinc-400 w-20 shrink-0">Budget:</span>
                        <span className="text-xs text-zinc-700">{budget}</span>
                      </div>
                    )}
                    {question && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-zinc-400 w-20 shrink-0">Question:</span>
                        <span className="text-xs text-zinc-700 italic">&ldquo;{question}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Idle state */}
              {status === "idle" && !hasQueried && (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-12 px-6 text-center">
                  <div className="text-4xl mb-3">🧭</div>
                  <p className="text-sm font-medium text-zinc-600">
                    Fill in your context and ask a question
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    NutriPath will retrieve relevant knowledge and give you a personalized, structured response
                  </p>
                </div>
              )}

              {/* Error state */}
              {status === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">⚠️ Error</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              )}

              {/* Response */}
              {(status === "streaming" || status === "done") && (
                <StreamingResponse
                  text={responseText}
                  isStreaming={status === "streaming"}
                  retrievedChunks={retrievedChunks}
                />
              )}

              {/* Responsible AI footer disclaimer */}
              {hasQueried && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <strong>⚠️ Educational Use Only:</strong> NutriPath provides general nutrition education based on a structured knowledge base. It is NOT a substitute for professional medical or dietary advice. For medical conditions, allergies, or specific health concerns, consult a qualified healthcare professional.
                  </p>
                </div>
              )}

              {/* RAG Workflow Diagram */}
              {status === "idle" && !hasQueried && (
                <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    How NutriPath works
                  </p>
                  <div className="space-y-2">
                    {[
                      { icon: "👤", step: "You provide context", desc: "Situation, foods, budget, question" },
                      { icon: "🔍", step: "Knowledge Retrieval", desc: "RAG searches 20+ structured entries by relevance" },
                      { icon: "🧠", step: "Context-Aware Reasoning", desc: "AI generates answer grounded in retrieved knowledge" },
                      { icon: "📋", step: "Structured Response", desc: "Answer, reasoning, practical suggestions, sources" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-lg leading-none">{item.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-700">{item.step}</p>
                          <p className="text-[11px] text-zinc-400">{item.desc}</p>
                        </div>
                        {i < 3 && (
                          <div className="ml-auto">
                            <span className="text-zinc-300 text-sm">↓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Knowledge Tab ── */}
        {activeTab === "knowledge" && (
          <div className="max-w-2xl mx-auto">
            <KnowledgeBaseExplorer />
          </div>
        )}

        {/* ── About Tab ── */}
        {activeTab === "about" && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Hero */}
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
              <h1 className="text-2xl font-bold">NutriPath</h1>
              <p className="mt-1.5 text-emerald-100 text-sm">Personal Nutrition Navigator for Students</p>
              <p className="mt-3 text-sm text-emerald-100 leading-relaxed">
                NutriPath helps students make better food decisions by translating general nutrition
                knowledge into personalized, context-aware guidance. It is an educational tool, not a
                medical service.
              </p>
            </div>

            {/* Problem */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2">
              <h2 className="text-sm font-bold text-zinc-800">🎯 The Problem We Solve</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Nutrition information is widely available but rarely personalized for real student
                situations — limited budgets, school canteen choices, time pressure, or simply not
                knowing which food to pick from what&apos;s available. Generic AI answers don&apos;t
                account for your specific context.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">Generic AI</p>
                  <div className="text-xs text-zinc-600 space-y-0.5">
                    <p>User → Question</p>
                    <p>→ AI → Generic Answer</p>
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-[11px] font-semibold text-emerald-600 mb-1.5">NutriPath RAG</p>
                  <div className="text-xs text-zinc-600 space-y-0.5">
                    <p>Context + Question</p>
                    <p>→ Knowledge Retrieval</p>
                    <p>→ Structured Answer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsible AI */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
              <h2 className="text-sm font-bold text-amber-800">⚖️ Responsible AI Principles</h2>
              <ul className="space-y-1.5 text-sm text-amber-800">
                {[
                  "Never diagnoses health conditions or makes medical claims",
                  "Never requests sensitive health data, medical history, or personal ID",
                  "All recommendations cite knowledge base sources — no hallucination",
                  "Always includes educational disclaimer and suggests professionals for medical needs",
                  "User provides their own context — AI does not assume health status",
                  "Designed for educational purposes, not clinical use",
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-amber-600">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
              <h2 className="text-sm font-bold text-zinc-800">🔧 Technical Architecture</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Frontend", value: "Next.js 15 + TypeScript + Tailwind CSS" },
                  { label: "RAG Engine", value: "TF-IDF keyword retrieval + category bias mapping" },
                  { label: "Knowledge Base", value: "20 structured entries across 6 categories" },
                  { label: "LLM", value: "OpenAI GPT-4o-mini via streaming API" },
                  { label: "Personalization", value: "User-defined context (no health data assumed)" },
                  { label: "Response Format", value: "5-section structured output with source citations" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{item.label}</p>
                    <p className="text-xs text-zinc-700 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge categories */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
              <h2 className="text-sm font-bold text-zinc-800">📚 Knowledge Base Categories</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { emoji: "🥗", cat: "Basic Nutrition", desc: "Carbs, protein, fat, fiber, vitamins, balanced meals" },
                  { emoji: "💧", cat: "Hydration", desc: "Water needs, beverages, dehydration signs" },
                  { emoji: "🍽️", cat: "Food Choices", desc: "Food groups, meal composition, food comparison" },
                  { emoji: "🎒", cat: "Student Context", desc: "Affordable meals, canteen choices, meal timing" },
                  { emoji: "🏷️", cat: "Food Label Literacy", desc: "Serving size, calories, sugar, sodium" },
                  { emoji: "📚", cat: "Nutrition Education", desc: "Definitions, GI index, myths vs facts" },
                ].map((item) => (
                  <div key={item.cat} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                    <p className="text-sm font-semibold text-zinc-700">
                      {item.emoji} {item.cat}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-xs text-zinc-400">
                NutriPath · A prototype AI/RAG educational nutrition assistant for students<br />
                Built with Next.js, TypeScript, OpenAI, and structured nutrition knowledge
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
