"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { useHistory } from "@/context/HistoryContext";
import { HistorySession } from "@/lib/history-store";

// ── Types ─────────────────────────────────────────────────────────────────────
type QueryStatus = "idle" | "loading" | "streaming" | "done" | "error";

interface Message {
  id: string;
  role: "user" | "assistant";
  text?: string;          // user message text
  answer?: string;        // assistant raw answer from Langflow
  timestamp: string;
}

// ── Quick prompt pills ────────────────────────────────────────────────────────
const quickPrompts = [
  { emoji: "🍲", label: "Pilihkan makanan" },
  { emoji: "💰", label: "Sesuaikan budget" },
  { emoji: "⚡", label: "Saya butuh energi" },
  { emoji: "🧠", label: "Bantu fokus belajar" },
  { emoji: "🥗", label: "Analisis makanan" },
  { emoji: "🧭", label: "Beri saya panduan" },
];

// ── Toolbar chips (bottom input bar) ─────────────────────────────────────────
const toolbarChips = [
  { emoji: "📍", label: "Situasi sekarang" },
  { emoji: "🪙",  label: "Budget" },
  { emoji: "🍲", label: "Makanan tersedia" },
  { emoji: "📋", label: "Panduan" },
];

// ── Context sidebar data (static for now) ────────────────────────────────────
const FOOD_PREFERENCES = ["Ayam", "Ikan", "Sayur", "Buah", "Nasi"];
const QUICK_TIP = "Jangan lupa minum air minimal 8 gelas sehari untuk menjaga konsentrasi dan metabolisme tubuh.";

// ── Parse Langflow plain text → structured sections ──────────────────────────
interface StructuredSection {
  label: string;
  content: string;
  variant: "recommendation" | "why" | "budget" | "options" | "steps" | "note";
}

function parseLangflowAnswer(rawText: string): StructuredSection[] {
  if (!rawText.trim()) return [];
  const text = rawText.trim();

  // Detect **bold** section headers
  const boldRegex = /\*\*([^*\n]+)\*\*[:\s]*([\s\S]*?)(?=\n\*\*[^*\n]+\*\*|$)/g;
  const sections: StructuredSection[] = [];
  let match = boldRegex.exec(text);

  while (match !== null) {
    const label = match[1].replace(/[:#\s]+$/, "").trim();
    const content = match[2].replace(/\n{2,}/g, "\n").trim();
    if (label && content) {
      const lower = label.toLowerCase();
      let variant: StructuredSection["variant"] = "note";
      if (lower.includes("rekomen") || lower.includes("pilihan terbaik") || lower.includes("jawaban")) variant = "recommendation";
      else if (lower.includes("kenapa") || lower.includes("mengapa") || lower.includes("why") || lower.includes("alasan")) variant = "why";
      else if (lower.includes("budget") || lower.includes("harga") || lower.includes("biaya")) variant = "budget";
      else if (lower.includes("pilihan") || lower.includes("opsi") || lower.includes("alternatif")) variant = "options";
      else if (lower.includes("langkah") || lower.includes("panduan") || lower.includes("step")) variant = "steps";
      sections.push({ label, content, variant });
    }
    match = boldRegex.exec(text);
  }

  if (sections.length >= 2) return sections.slice(0, 6);

  // Fallback: split by paragraphs
  const paragraphs = text.split(/\n{2,}/).map((p) => p.replace(/\n/g, " ").trim()).filter((p) => p.length > 15);
  if (paragraphs.length === 0) return [{ label: "Jawaban", content: text, variant: "recommendation" }];

  const variantMap: StructuredSection["variant"][] = ["recommendation", "why", "options", "steps", "note"];
  const labelMap = ["Rekomendasi", "Penjelasan", "Pilihan", "Panduan", "Catatan"];
  return paragraphs.slice(0, 5).map((content, i) => ({
    label: labelMap[i] ?? `Bagian ${i + 1}`,
    content,
    variant: variantMap[i % variantMap.length],
  }));
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AskSmanuPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-sm text-slate-500">Loading…</div>}>
      <AskSmanuContent />
    </Suspense>
  );
}

// ── Chat content ──────────────────────────────────────────────────────────────
function AskSmanuContent() {
  const searchParams = useSearchParams();
  const { addSession } = useHistory();

  // Context
  const [situation, setSituation] = useState("School Day");
  const [budget, setBudget] = useState("Budget");
  const [food, setFood] = useState("Canteen");

  // Mobile context drawer
  const [contextOpen, setContextOpen] = useState(false);

  // Chat
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<QueryStatus>("idle");

  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setInputText(q);
  }, [searchParams]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
    }
  }, [messages, status]);

  function now() {
    return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  function appendChip(chip: string) {
    setInputText((prev) => (prev ? `${prev} ${chip}` : chip));
    inputRef.current?.focus();
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || status === "loading" || status === "streaming") return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text, timestamp: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setStatus("loading");

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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6).trim());
            if (event.type === "token") fullText += event.content;
            else if (event.type === "done") break;
          } catch { /* skip */ }
        }
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        answer: fullText || "Tidak ada jawaban dari server.",
        timestamp: now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setStatus("done");

      // ── Save to session history ────────────────────────────────
      const session: HistorySession = {
        id: crypto.randomUUID(),
        question: text,
        answer: fullText || "Tidak ada jawaban dari server.",
        situation,
        budget,
        food,
        messages: [
          { role: "user", text },
          { role: "assistant", text: fullText || "" },
        ],
        timestamp: Date.now(),
      };
      addSession(session);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      const displayMsg = msg.includes("fetch") || msg.includes("network")
        ? "Tidak dapat terhubung ke SMANU AI. Pastikan Langflow Desktop sedang berjalan."
        : msg;
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        answer: `⚠️ ${displayMsg}`,
        timestamp: now(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setStatus("error");
    }
  }

  const isDisabled = status === "loading" || status === "streaming";

  return (
    <div className="flex h-full overflow-hidden bg-[#F8FAFC]">

      {/* ── Mobile context bottom sheet drawer ─────────────────────────────── */}
      {/* Backdrop */}
      {contextOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 xl:hidden"
          onClick={() => setContextOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Bottom sheet panel */}
      <div
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-50 xl:hidden",
          "bg-white rounded-t-3xl shadow-2xl border-t border-slate-200",
          "transition-transform duration-300 ease-out will-change-transform",
          "max-h-[85dvh] flex flex-col",
          contextOpen ? "translate-y-0" : "translate-y-full"
        )}
        aria-modal="true"
        role="dialog"
        aria-label="Konteks Saya"
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">🥗</span>
            <h2 className="text-sm font-bold text-slate-900">Konteks Saya</h2>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
          </div>
          <button
            onClick={() => setContextOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Tutup panel konteks"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">

          {/* Situasi */}
          <ContextCard title="📍 Situasi">
            <div className="grid grid-cols-2 gap-1.5">
              {["School Day", "Dormitory", "Exam Week", "Training"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSituation(s)}
                  className={clsx(
                    "py-2 px-3 rounded-xl text-[12px] font-medium text-center transition-all",
                    situation === s
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </ContextCard>

          {/* Budget */}
          <ContextCard title="🪙 Budget">
            <div className="grid grid-cols-2 gap-1.5">
              {["Budget", "Moderate", "Flexible", "Not Selected"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={clsx(
                    "py-2 px-3 rounded-xl text-[12px] font-medium text-center transition-all",
                    budget === b
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </ContextCard>

          {/* Makanan Tersedia */}
          <ContextCard title="🍴 Makanan Tersedia">
            <div className="grid grid-cols-2 gap-1.5">
              {["Canteen", "Small Kitchen", "Packaged Snacks", "Not Selected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFood(f)}
                  className={clsx(
                    "py-2 px-3 rounded-xl text-[12px] font-medium text-center transition-all",
                    food === f
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </ContextCard>

          {/* Preferensi */}
          <ContextCard title="✨ Preferensi">
            <div className="flex flex-wrap gap-1.5">
              {FOOD_PREFERENCES.map((p) => (
                <span key={p} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/60">
                  {p}
                </span>
              ))}
            </div>
          </ContextCard>

          {/* Tips */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <span>💡</span>
              <span>Tips Hari Ini</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{QUICK_TIP}</p>
          </div>

          {/* Extra bottom padding so content clears the safe area on iOS */}
          <div className="h-4" />
        </div>

        {/* Apply button */}
        <div className="px-5 pb-6 pt-3 border-t border-slate-100 shrink-0 bg-white">
          <button
            onClick={() => setContextOpen(false)}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm transition-all"
          >
            Terapkan Konteks
          </button>
        </div>
      </div>

      {/* ── LEFT: Main chat area ───────────────────────────────────────────── */}
      <main className="flex flex-col flex-1 min-w-0 bg-[#F8FAFC] overflow-hidden">

        {/* Breadcrumb */}
        <div className="h-9 px-6 bg-white/80 border-b border-slate-200/80 flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">SMANU</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 hidden sm:inline">Context-aware nutrition assistant</span>
        </div>

        {/* ── Mobile context bar (below breadcrumb, hidden on xl) ─────────── */}
        <div className="xl:hidden shrink-0 px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-2">
          {/* Active context chips */}
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0">
            <span className="text-[10px] text-slate-400 font-medium shrink-0">Konteks:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-semibold shrink-0">
              📍 {situation}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold shrink-0 border border-slate-200">
              🪙 {budget}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold shrink-0 border border-slate-200">
              🍴 {food}
            </span>
          </div>
          {/* Button to open drawer */}
          <button
            onClick={() => setContextOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-semibold transition-all shadow-sm"
            aria-label="Buka panel konteks"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Konteks Saya
          </button>
        </div>

        {/* Scrollable message stream */}
        <div ref={canvasRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Welcome hero card */}
          <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white border border-emerald-100/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center shrink-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#D1FAE5" stroke="#10B981" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#047857" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                <circle cx="9" cy="9.5" fill="#047857" r="1.5" />
                <circle cx="15" cy="9.5" fill="#047857" r="1.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                Hi, saya SMANU <span>👋</span>
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Jelaskan kondisi makanmu sekarang, saya bantu menentukan pilihan yang paling masuk akal.
              </p>
            </div>
          </div>

          {/* Quick action prompt pills */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => appendChip(p.label)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/40 transition"
                >
                  <span className="text-sm">{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) =>
            msg.role === "user" ? (
              <UserBubble key={msg.id} text={msg.text ?? ""} timestamp={msg.timestamp} />
            ) : (
              <AssistantCard
                key={msg.id}
                answer={msg.answer ?? ""}
                timestamp={msg.timestamp}
                situation={situation}
              />
            )
          )}

          {/* Loading indicator */}
          {(status === "loading" || status === "streaming") && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-1">
                <span className="text-xs">🌱</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
                </span>
                <span className="text-xs text-slate-500">
                  {status === "loading" ? "Mengambil informasi nutrisi…" : "Menyusun rekomendasi…"}
                </span>
              </div>
            </div>
          )}

          <div ref={streamRef} />
        </div>

        {/* ── Bottom input bar ─────────────────────────────────────────── */}
        <footer className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5">
          {/* Toolbar chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {toolbarChips.map((c) => (
              <button
                key={c.label}
                onClick={() => appendChip(c.label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap transition"
              >
                <span>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Text input + send */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isDisabled}
              placeholder="Tanyakan tentang nutrisi, makanan, atau situasi makanmu…"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-14 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isDisabled}
              className="absolute right-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 -translate-x-0.5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} />
              </svg>
            </button>
          </form>

          {/* Safety note */}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            SMANU memberikan informasi edukatif berbasis knowledge base. Bukan pengganti saran medis profesional.
          </p>
        </footer>
      </main>

      {/* ── RIGHT: Context panel ─────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col p-4 overflow-y-auto shrink-0 hidden xl:flex space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">🥗</div>
            <h2 className="text-sm font-bold text-slate-900">Konteks Saya</h2>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
        </div>

        {/* User profile */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-base shrink-0">
              S
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">Siswa SMANU</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Student</p>
            </div>
          </div>
          <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* Situation selector */}
        <ContextCard title="📍 Situasi">
          <div className="grid grid-cols-2 gap-1.5">
            {["School Day", "Dormitory", "Exam Week", "Training"].map((s) => (
              <button
                key={s}
                onClick={() => setSituation(s)}
                className={clsx(
                  "py-1.5 px-2 rounded-lg text-[11px] font-medium text-center transition-all",
                  situation === s
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </ContextCard>

        {/* Budget selector */}
        <ContextCard title="🪙 Budget">
          <div className="grid grid-cols-2 gap-1.5">
            {["Budget", "Moderate", "Flexible", "Not Selected"].map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={clsx(
                  "py-1.5 px-2 rounded-lg text-[11px] font-medium text-center transition-all",
                  budget === b
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </ContextCard>

        {/* Food available */}
        <ContextCard title="🍴 Makanan Tersedia">
          <div className="grid grid-cols-2 gap-1.5">
            {["Canteen", "Small Kitchen", "Packaged Snacks", "Not Selected"].map((f) => (
              <button
                key={f}
                onClick={() => setFood(f)}
                className={clsx(
                  "py-1.5 px-2 rounded-lg text-[11px] font-medium text-center transition-all",
                  food === f
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </ContextCard>

        {/* Food preferences */}
        <ContextCard title="✨ Preferensi">
          <div className="flex flex-wrap gap-1.5">
            {FOOD_PREFERENCES.map((p) => (
              <span key={p} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/60">
                {p}
              </span>
            ))}
          </div>
        </ContextCard>

        {/* Daily tip */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <span>💡</span>
            <span>Tips Hari Ini</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{QUICK_TIP}</p>
        </div>

        {/* Motivational quote */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/40 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-3 mt-auto">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-600 italic leading-snug">
              &ldquo;Pilihan makanan yang baik hari ini, menciptakan energi untuk mimpi besarmu.&rdquo;
            </p>
            <p className="text-[10px] font-bold text-emerald-800 text-right">— SMANU</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ── User Bubble ───────────────────────────────────────────────────────────────
function UserBubble({ text, timestamp }: { text: string; timestamp: string }) {
  return (
    <div className="flex justify-end pt-2">
      <div className="max-w-xl bg-[#E0EEFF] text-slate-800 rounded-2xl rounded-tr-sm p-4 border border-blue-200/60 space-y-1.5">
        <p className="text-sm leading-relaxed">{text}</p>
        <div className="flex items-center justify-end gap-1 text-[11px] text-blue-500 font-medium">
          <span>{timestamp}</span>
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Assistant Response Card ───────────────────────────────────────────────────
function AssistantCard({
  answer,
  timestamp,
  situation,
}: {
  answer: string;
  timestamp: string;
  situation: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const sections = parseLangflowAnswer(answer);

  // Detect error message
  const isError = answer.startsWith("⚠️") || answer.toLowerCase().includes("tidak dapat");

  return (
    <div className="flex items-start gap-3 pt-1">
      {/* Mascot avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-1">
        <span className="text-xs">🌱</span>
      </div>

      {/* Card */}
      <div className="flex-1 max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">

        {isError ? (
          // Error display
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-800">Tidak Dapat Memproses</p>
              <p className="text-xs text-red-700 mt-1">{answer.replace("⚠️ ", "")}</p>
            </div>
          </div>
        ) : sections.length > 0 ? (
          <>
            {/* Top recommendation banner */}
            {sections[0] && (
              <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">🎯</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                    {sections[0].label}
                  </span>
                  <span className="ml-auto text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {situation}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{sections[0].content}</p>
              </div>
            )}

            {/* 2-column grid for remaining sections */}
            {sections.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.slice(1, 5).map((section) => (
                  <SectionCard key={section.label} section={section} />
                ))}
              </div>
            )}

            {/* Expand toggle for extra sections */}
            {sections.length > 5 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors border-t border-slate-100 pt-2"
              >
                <span>{expanded ? "Tampilkan lebih sedikit" : "Lihat detail selengkapnya"}</span>
                <svg className={clsx("w-4 h-4 text-slate-400 transition-transform", expanded && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            )}

            {/* Knowledge used */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
              <span className="text-blue-500 text-sm">📖</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-700">Knowledge Used</p>
                <p className="text-[10px] text-slate-500">SMANU Nutrition Knowledge Base · Langflow RAG</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 shrink-0">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                </svg>
                Verified
              </span>
            </div>
          </>
        ) : (
          // Plain text fallback
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
        )}

        {/* Bottom interaction bar */}
        {!isError && (
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <FeedbackBtn emoji="👍" label="Membantu" />
              <FeedbackBtn emoji="👎" label="Kurang sesuai" />
              <CopyBtn text={answer} />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section Card (2-column grid item) ────────────────────────────────────────
function SectionCard({ section }: { section: StructuredSection }) {
  const iconMap: Record<StructuredSection["variant"], string> = {
    recommendation: "🎯",
    why: "💡",
    budget: "🪙",
    options: "🍴",
    steps: "📋",
    note: "📖",
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
        <span className="text-sm">{iconMap[section.variant]}</span>
        <span>{section.label}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
    </div>
  );
}

// ── Context Card wrapper ───────────────────────────────────────────────────────
function ContextCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
      <p className="text-xs font-bold text-slate-800">{title}</p>
      {children}
    </div>
  );
}

// ── Feedback button ───────────────────────────────────────────────────────────
function FeedbackBtn({ emoji, label }: { emoji: string; label: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <button
      onClick={() => setClicked(true)}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition",
        clicked
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      )}
    >
      <span>{emoji}</span> {label}
    </button>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
    >
      {copied ? "✓ Disalin" : "Salin"}
    </button>
  );
}
