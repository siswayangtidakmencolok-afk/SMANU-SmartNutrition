"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";

// ── Types ────────────────────────────────────────────────────────────────────
type QueryStatus = "idle" | "loading" | "streaming" | "done" | "error";

interface StructuredSection {
  num: number;
  label: string;
  content: string;
  accent: "primary" | "blue" | "green"; // #131B2E | #DCE9FF | #006C49
  tag?: string; // optional context pill
}

interface Message {
  id: string;
  role: "user" | "assistant";
  question?: string;
  sections?: StructuredSection[];
  timestamp: string;
  knowledgeSource?: { title: string; score: string };
}

// ── Constants ────────────────────────────────────────────────────────────────
const situations = ["School Day", "Dormitory", "Exam Week", "Training"];
const budgetOptions = ["Not Selected", "Budget", "Moderate", "Flexible"];
const foodOptions = ["Not Selected", "Canteen", "Small Kitchen", "Packaged Snacks"];
const dietOptions = [
  ["Not Selected", "Vegetarian"],
  ["Nut-Free", "Halal"],
  ["None"],
];

const suggestedQueries = [
  "What is protein?",
  "What foods help with concentration while studying?",
  "Simple balanced meal for dormitory students",
  "How to read a nutrition label",
];

// ─────────────────────────────────────────────────────────────
// Parse teks plain dari Langflow → StructuredSection[]
//
// Langflow biasanya mengembalikan jawaban dalam format paragraf.
// Fungsi ini memecah teks menjadi section-section terstruktur
// agar sesuai dengan UI yang sudah ada.
// ─────────────────────────────────────────────────────────────
function parseLangflowText(
  rawText: string,
  situation: string
): StructuredSection[] {
  if (!rawText.trim()) return [];

  // Normalisasi teks: hilangkan trailing whitespace per baris
  const text = rawText.trim();

  // Coba deteksi header section yang umum dikirim oleh prompt SMANU
  // (bold markdown, numbered list, atau kata kunci tertentu)
  const sectionPatterns = [
    // **HEADER** atau **Header:**
    /\*\*([^*]+)\*\*[:\s]*([\s\S]*?)(?=\*\*[^*]+\*\*|$)/g,
    // ## Header atau # Header
    /^#{1,3}\s+(.+)\n([\s\S]*?)(?=^#{1,3}\s+|\s*$)/gm,
  ];

  // Coba ekstrak dengan pola bold markdown
  const boldMatches: Array<{ label: string; content: string }> = [];
  const boldRegex = /\*\*([^*\n]+)\*\*[:\s]*([\s\S]*?)(?=\n\*\*[^*\n]+\*\*|\n#{1,3}\s+|$)/g;
  let match = boldRegex.exec(text);
  while (match !== null) {
    const label = match[1].replace(/[:#\s]+$/, "").trim();
    const content = match[2].replace(/\n{2,}/g, "\n").trim();
    if (label && content) {
      boldMatches.push({ label, content });
    }
    match = boldRegex.exec(text);
  }

  const accents: Array<StructuredSection["accent"]> = [
    "primary", "blue", "green", "blue", "primary",
  ];

  if (boldMatches.length >= 2) {
    return boldMatches.slice(0, 5).map((s, i) => ({
      num: i + 1,
      label: s.label,
      content: s.content,
      accent: accents[i % accents.length],
      tag: i === 0 ? situation : undefined,
    }));
  }

  // Fallback: tidak ada bold header — pecah berdasarkan paragraf
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 10);

  if (paragraphs.length === 0) {
    return [{ num: 1, label: "Jawaban", content: text, accent: "primary", tag: situation }];
  }

  const sectionLabels = ["Jawaban", "Penjelasan", "Berdasarkan Konteks", "Saran Praktis", "Catatan"];
  return paragraphs.slice(0, 5).map((content, i) => ({
    num: i + 1,
    label: sectionLabels[i] ?? `Bagian ${i + 1}`,
    content,
    accent: accents[i % accents.length],
    tag: i === 0 ? situation : undefined,
  }));
}

// ── Accent color helpers ─────────────────────────────────────────────────────
const accentBg: Record<StructuredSection["accent"], string> = {
  primary: "bg-[#131B2E]",
  blue: "bg-[#DCE9FF]",
  green: "bg-[#006C49]",
};
const accentText: Record<StructuredSection["accent"], string> = {
  primary: "text-white",
  blue: "text-[#0B1C30]",
  green: "text-white",
};
const accentLabel: Record<StructuredSection["accent"], string> = {
  primary: "text-[#0B1C30]",
  blue: "text-[#0B1C30]",
  green: "text-[#006C49]",
};

// ── Main export ──────────────────────────────────────────────────────────────
export default function AskSmanuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-sm text-[#45464D]">
          Loading…
        </div>
      }
    >
      <AskSmanuContent />
    </Suspense>
  );
}

// ── Content ──────────────────────────────────────────────────────────────────
function AskSmanuContent() {
  const searchParams = useSearchParams();

  // Context state
  const [situation, setSituation] = useState("School Day");
  const [budget, setBudget] = useState("Budget");
  const [food, setFood] = useState("Small Kitchen");
  const [diet, setDiet] = useState("None");

  // Chat state
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<QueryStatus>("idle");

  const canvasRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Pre-fill from URL ?q=
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setInputText(q);
  }, [searchParams]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
    }
  }, [messages]);

  function now() {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || status === "loading" || status === "streaming") return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      question: text,
      timestamp: now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setStatus("loading");

    // ── Panggil /api/nutripath → Langflow ──────────────────
    try {
      const res = await fetch("/api/nutripath", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          availableFoods: food,
          budget,
          question: text,
          sessionId: crypto.randomUUID(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error("Tidak ada stream dari server");

      setStatus("streaming");

      // ── Baca SSE stream ────────────────────────────────────
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      let source = "langflow";

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
              source = event.source ?? "langflow";
            } else if (event.type === "token") {
              fullText += event.content;
            } else if (event.type === "done") {
              // stream selesai — parse teks → sections
              break;
            }
          } catch {
            // skip malformed event
          }
        }
      }

      // ── Parse jawaban Langflow → StructuredSection[] ──────
      const sections = parseLangflowText(fullText, situation);

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        sections: sections.length > 0
          ? sections
          : [{ num: 1, label: "Jawaban", content: fullText || "Tidak ada jawaban.", accent: "primary", tag: situation }],
        timestamp: now(),
        knowledgeSource: {
          title: source === "langflow" ? "Langflow RAG · Astra DB" : "Knowledge Base",
          score: "—",
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setStatus("done");
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        sections: [
          {
            num: 1,
            label: "Error",
            content: err instanceof Error
              ? err.message
              : "Gagal menghubungi server. Pastikan Langflow berjalan dan LANGFLOW_API_KEY sudah di-set.",
            accent: "primary",
          },
        ],
        timestamp: now(),
        knowledgeSource: { title: "Error", score: "—" },
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStatus("error");
    }
  }

  function fillSuggestion(text: string) {
    setInputText(text);
    inputRef.current?.focus();
  }

  const isDisabled = status === "loading" || status === "streaming";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Top Context Strip ──────────────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 py-2 gap-4 bg-[#EFF4FF] rounded-xl">
        {/* Row 1: status */}
        <div className="flex items-center gap-2">
          {/* Pulse dot */}
          <div className="relative w-2.5 h-2.5 flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-[#6CF8BB] opacity-75 animate-ping" />
            <span className="relative block w-2.5 h-2.5 rounded-full bg-[#006C49]" />
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#006C49]">
            SMANU AI · Phase 1 Preview
          </span>
          <span className="text-base text-[#C6C6CD] select-none">·</span>
          <span className="text-sm text-[#45464D]">
            Nutrition query interface — connected to Langflow RAG
          </span>
        </div>
        {/* Row 2: privacy note */}
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[#006C49] text-[13px]">lock</span>
          <span className="text-xs font-semibold text-[#45464D]">
            Context kept in session only — not stored or shared. Responses are educational, not medical advice.
          </span>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex gap-6 items-start w-full">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN — Chat Interface (flex-1, ~65%)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col flex-1 min-w-0 bg-white rounded-xl shadow-sm overflow-hidden">

          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#EFF4FF]">
            {/* Left: logo mark + title */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-10 rounded-xl bg-[#131B2E] shadow-sm flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-semibold tracking-tight text-[#0B1C30]">
                    Ask SMANU
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#6CF8BB] text-[11px] font-semibold text-[#00714D]">
                    Nutrition AI
                  </span>
                </div>
                <span className="text-sm text-[#45464D] leading-tight">
                  Context-aware answers grounded in peer-reviewed nutrition science.
                </span>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-1">
              <button
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[#45464D] hover:bg-[#E5EEFF] transition-colors"
                onClick={() => setMessages([])}
                title="Clear conversation"
              >
                <span className="material-symbols-outlined text-[11px]">delete_sweep</span>
                <span className="text-xs font-semibold">Clear</span>
              </button>
              <button
                className="flex items-center justify-center w-7 h-8 rounded-lg text-[#45464D] hover:bg-[#E5EEFF] transition-colors"
                title="More options"
              >
                <span className="material-symbols-outlined text-[11px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* ── Conversation Canvas ─────────────────────────────────────── */}
          <div
            ref={canvasRef}
            className="flex flex-col gap-8 px-6 py-6 overflow-y-auto bg-white/50"
            style={{ height: "560px", maxHeight: "560px" }}
          >
            {/* System banner */}
            <div className="flex justify-center">
              <span className="px-4 py-1 rounded-full bg-[#E5EEFF] text-xs font-semibold text-[#45464D] text-center max-w-lg">
                SMANU provides educational nutrition information. Not a substitute for medical advice.
              </span>
            </div>

            {/* Empty state */}
            {messages.length === 0 && status === "idle" && (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px] text-[#006C49]">psychology</span>
                </div>
                <p className="text-sm font-semibold text-[#0B1C30]">Ask your first nutrition question</p>
                <p className="text-xs text-[#45464D] max-w-xs">
                  Set your context on the right panel, then type a question below or pick a suggestion.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) =>
              msg.role === "user" ? (
                // ── User Bubble ──────────────────────────────────────────
                <div key={msg.id} className="flex items-start gap-2 justify-end max-w-2xl ml-auto w-full">
                  <div className="flex flex-col gap-1 items-end flex-1 min-w-0">
                    {/* Bubble */}
                    <div className="bg-[#131B2E] rounded-xl rounded-tr-none px-6 py-4 shadow-sm max-w-full">
                      <p className="text-base text-white leading-6">{msg.question}</p>
                    </div>
                    {/* Meta */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-[#45464D]">Student User</span>
                      <span className="text-xs font-semibold text-[#45464D]">·</span>
                      <span className="text-xs font-medium text-white bg-[#45464D] px-1.5 rounded">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#DCE9FF] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[12px] text-[#0B1C30]">person</span>
                  </div>
                </div>
              ) : (
                // ── AI Structured Response ───────────────────────────────
                <div key={msg.id} className="flex items-start gap-4 max-w-2xl w-full">
                  {/* SMANU avatar */}
                  <div className="w-8 h-8 rounded-xl bg-[#131B2E] shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-white text-[13px]">smart_toy</span>
                  </div>

                  {/* Response container */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {/* Response card */}
                    <div className="flex flex-col gap-4 p-6 bg-[#EFF4FF] rounded-xl rounded-tl-none shadow-sm relative">
                      {/* Card header */}
                      <div
                        className="flex flex-col gap-1 px-6 py-4 absolute -top-6 -left-6 -right-6 rounded-t-xl"
                        style={{ background: "rgba(255,255,255,0.6)" }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#006C49] text-[18px]">
                            verified
                          </span>
                          <span className="text-xl font-semibold text-[#0B1C30]">
                            SMANU Response
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {msg.knowledgeSource && (
                            <span className="px-2 py-0.5 rounded bg-[#DCE9FF] text-xs font-semibold text-[#0B1C30] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[#006C49] text-[11px]">
                                dataset
                              </span>
                              {msg.knowledgeSource.title}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-[#DCE9FF] text-xs font-semibold text-[#45464D]">
                            Score {msg.knowledgeSource?.score ?? "—"}
                          </span>
                        </div>
                      </div>

                      {/* Structured sections */}
                      <div className="flex flex-col gap-3 pt-8">
                        {msg.sections?.map((section) => (
                          <div
                            key={section.num}
                            className="flex flex-col gap-1 p-4 bg-white rounded-lg"
                          >
                            {/* Section header */}
                            <div className="flex items-center gap-1 w-full">
                              {/* Number badge */}
                              <span
                                className={clsx(
                                  "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                                  accentBg[section.accent],
                                  accentText[section.accent]
                                )}
                              >
                                {section.num}
                              </span>
                              {/* Label */}
                              <span
                                className={clsx(
                                  "text-sm font-semibold tracking-wide uppercase",
                                  accentLabel[section.accent]
                                )}
                              >
                                {section.label}
                              </span>
                              {/* Context tag pill */}
                              {section.tag && (
                                <span className="ml-auto px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[11px] font-medium text-[#0B1C30]">
                                  {section.tag}
                                </span>
                              )}
                            </div>
                            {/* Content */}
                            <div className="pl-7">
                              <p className="text-base text-[#0B1C30] leading-6">
                                {section.content}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Knowledge used section */}
                        {msg.knowledgeSource && (
                          <div className="flex flex-col gap-2 p-4 bg-[#E5EEFF] rounded-lg">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[#45464D] text-[15px]">
                                library_books
                              </span>
                              <span className="text-sm font-semibold tracking-wide uppercase text-[#45464D]">
                                Knowledge Used
                              </span>
                            </div>
                            <div className="relative h-11">
                              <span className="absolute left-0 top-0 text-sm font-medium text-[#0B1C30]">
                                {msg.knowledgeSource.title}
                              </span>
                              <span className="absolute left-[21rem] top-0 text-sm text-[#45464D]">·</span>
                              <div className="absolute left-0 top-6 px-2 py-0.5 rounded bg-white">
                                <span className="text-xs font-semibold text-[#0B1C30]">
                                  Astra DB Vector
                                </span>
                              </div>
                              <span className="absolute left-[13.5rem] top-6 text-sm text-[#45464D]">·</span>
                              <span className="absolute left-[14.5rem] top-6 text-sm font-medium text-[#006C49]">
                                Score {msg.knowledgeSource.score}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interaction bar */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-[#45464D] hover:text-[#0B1C30] transition-colors">
                          <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                          <span className="text-xs font-semibold">Helpful</span>
                        </button>
                        <button className="flex items-center gap-1 text-[#45464D] hover:text-[#0B1C30] transition-colors">
                          <span className="material-symbols-outlined text-[14px]">thumb_down</span>
                          <span className="text-xs font-semibold">Not helpful</span>
                        </button>
                        <button className="flex items-center gap-1 text-[#45464D] hover:text-[#0B1C30] transition-colors">
                          <span className="material-symbols-outlined text-[11px]">content_copy</span>
                          <span className="text-xs font-semibold">Copy</span>
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-[#45464D]">
                        {msg.timestamp} · Educational reference only
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Loading indicator */}
            {(status === "loading" || status === "streaming") && (
              <div className="flex items-start gap-4 max-w-2xl w-full">
                <div className="w-8 h-8 rounded-xl bg-[#131B2E] shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-white text-[13px] animate-spin">
                    progress_activity
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-[#EFF4FF] rounded-xl rounded-tl-none">
                  <span className="text-sm text-[#45464D]">
                    {status === "loading"
                      ? "Retrieving nutrition knowledge vectors…"
                      : "Generating structured response…"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Chat Input Area ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 p-6 bg-[#EFF4FF]">
            {/* Suggestion chips */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[#45464D]">Suggested queries:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {suggestedQueries.map((q) => (
                  <button
                    key={q}
                    onClick={() => fillSuggestion(q)}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full bg-white shadow-sm text-sm font-medium text-[#0B1C30] hover:bg-[#E5EEFF] transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input card */}
            <form
              onSubmit={handleSend}
              className="flex flex-col gap-1 p-2 bg-white rounded-xl shadow-sm"
            >
              {/* Textarea */}
              <div className="px-2 pt-2 pb-14 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isDisabled}
                  placeholder="Ask SMANU anything about nutrition…"
                  rows={2}
                  className="w-full bg-transparent text-base text-[#0B1C30] placeholder:text-[#76777D] outline-none resize-none leading-6 disabled:opacity-50"
                />
              </div>

              {/* Toolbar row */}
              <div className="flex items-center justify-between px-1 pb-1">
                {/* Left: context info */}
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006C49] text-[12px]">badge</span>
                  <span className="text-xs font-semibold text-[#45464D] leading-5">
                    {situation} · {budget} budget · {food}
                  </span>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#45464D] leading-5 text-right pr-2">
                    Enter ↵ to send · Shift+Enter for new line
                  </span>
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isDisabled}
                    className="flex items-center gap-1 px-6 py-2.5 rounded-lg bg-[#000000] text-white text-sm font-medium shadow-sm hover:bg-[#131B2E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm font-medium">Send</span>
                    <span className="material-symbols-outlined text-white text-[12px]">send</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT COLUMN — AI Info + Context Panels (~35%, fixed 293px)
        ════════════════════════════════════════════════════════════════════ */}
        <div
          className="flex flex-col gap-4 flex-shrink-0"
          style={{ width: "293px" }}
        >
          {/* ── Model AI Panel ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 p-4 bg-white rounded-xl">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-base font-semibold text-[#0B1C30]">Model AI</span>
              <span className="text-[11px] font-medium text-right text-[#006C49]">▾ Detail</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#006C49]">
              NUTRITION ASSISTANT · SMANU
            </span>
            <div className="flex flex-col gap-1 p-2.5 bg-[#EDF5F2] rounded-xl">
              <span className="text-xs font-semibold text-[#0B1C30] leading-snug">
                Answer based on context and sources
              </span>
              <span className="text-[11px] text-[#526175] leading-4">
                Generative model: Langflow flow
                <br />
                Orchestration: Langflow RAG · Astra DB
              </span>
            </div>
          </div>

          {/* ── RAG Flow Panel ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 p-4 bg-white rounded-xl">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-base font-semibold text-[#0B1C30]">RAG Flow</span>
              <span className="text-[11px] font-medium text-right text-[#006C49]">▾ Detail</span>
            </div>
            <span className="text-[10px] text-[#526175]">
              Process schema · not live system status
            </span>

            <div className="flex flex-col gap-0.5 p-2 bg-[#EDF5F2] rounded-xl">
              {[
                {
                  num: "01",
                  title: "Question + context",
                  sub: "User situation and preferences",
                  active: false,
                },
                {
                  num: "02",
                  title: "Embedding",
                  sub: "text-embedding-3-small",
                  active: false,
                },
                {
                  num: "03",
                  title: "Astra DB Search",
                  sub: "1,420 embeddings · similarity ≥ 0.82",
                  active: false,
                },
                {
                  num: "04",
                  title: "Relevant sources",
                  sub: "Knowledge context for model",
                  active: false,
                },
                {
                  num: "05",
                  title: "AI Model → answer",
                  sub: "Nutrition answer with sources",
                  active: true,
                },
              ].map((step, i, arr) => (
                <div key={step.num} className="flex flex-col">
                  <div className="flex flex-col gap-0.5 p-2 bg-white rounded-lg">
                    <span
                      className={clsx(
                        "text-[11px] font-semibold leading-4",
                        step.active ? "text-[#006C49]" : "text-[#0B1C30]"
                      )}
                    >
                      {step.num} {step.title}
                    </span>
                    <span className="text-[10px] text-[#526175] leading-[14px]">{step.sub}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="text-center text-[11px] font-medium text-[#006C49] leading-4">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Your Context Panel ──────────────────────────────────────── */}
          <div className="flex flex-col gap-3 p-4 bg-white rounded-xl">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-base font-semibold text-[#0B1C30]">Your Context</span>
              <span className="text-[11px] font-medium text-right text-[#006C49]">Active</span>
            </div>
            <span className="text-[11px] text-[#526175]">
              Selected options help personalize the answer.
            </span>

            {/* Situation */}
            <ContextSection label="Current Situation">
              <div className="grid grid-cols-2 gap-1">
                {situations.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSituation(s)}
                    className={clsx(
                      "py-1.5 px-1 rounded-md text-[10px] font-medium text-center transition-colors",
                      situation === s
                        ? "bg-[#0B1C30] text-white"
                        : "bg-[#E5EEFF] text-[#0B1C30] hover:bg-[#DCE9FF]"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ContextSection>

            {/* Budget */}
            <ContextSection label="Budget">
              <div className="grid grid-cols-2 gap-1">
                {budgetOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={clsx(
                      "py-1.5 px-1 rounded-md text-[10px] font-medium text-center transition-colors",
                      budget === b
                        ? "bg-[#0B1C30] text-white"
                        : "bg-[#E5EEFF] text-[#0B1C30] hover:bg-[#DCE9FF]"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </ContextSection>

            {/* Food available */}
            <ContextSection label="Food Available">
              <div className="grid grid-cols-2 gap-1">
                {foodOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFood(f)}
                    className={clsx(
                      "py-1.5 px-1 rounded-md text-[10px] font-medium text-center transition-colors",
                      food === f
                        ? "bg-[#0B1C30] text-white"
                        : "bg-[#E5EEFF] text-[#0B1C30] hover:bg-[#DCE9FF]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </ContextSection>

            {/* Dietary preferences */}
            <ContextSection label="Dietary Preferences">
              <div className="flex flex-col gap-1">
                {dietOptions.map((row, ri) => (
                  <div key={ri} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                    {row.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDiet(d)}
                        className={clsx(
                          "py-1.5 px-1 rounded-md text-[10px] font-medium text-center transition-colors",
                          diet === d
                            ? "bg-[#0B1C30] text-white"
                            : "bg-[#E5EEFF] text-[#0B1C30] hover:bg-[#DCE9FF]"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </ContextSection>

            {/* Language */}
            <ContextSection label="Response Language">
              <div className="flex flex-col gap-0.5 p-2 bg-[#EDF5F2] rounded-xl">
                <span className="text-[11px] font-semibold text-[#006C49]">
                  ✓ Bahasa Indonesia · selected
                </span>
                <span className="text-[10px] text-[#526175]">Spanish · coming soon</span>
              </div>
            </ContextSection>

            {/* Save button */}
            <button className="w-full py-2.5 px-2.5 bg-[#006C49] rounded-lg text-xs font-semibold text-center text-white hover:bg-[#005236] transition-colors">
              Save &amp; Apply
            </button>
          </div>

          {/* ── Safety note ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1 p-3 bg-[#E5EEFF] rounded-xl">
            <span className="text-[11px] font-semibold text-[#0B1C30]">
              Educational information, not diagnosis
            </span>
            <span className="text-[10px] text-[#526175] leading-snug">
              Context helps SMANU make answers more relevant. Does not diagnose health conditions
              or collect personal health identity.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper: collapsible context section ─────────────────────────────────────
function ContextSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold text-[#0B1C30] text-left hover:text-[#006C49] transition-colors"
      >
        {open ? "▾" : "▸"} {label}
      </button>
      {open && (
        <div className="flex flex-col gap-1 pl-3.5 py-2 bg-[#EDF5F2] rounded-lg">
          {children}
        </div>
      )}
    </div>
  );
}
