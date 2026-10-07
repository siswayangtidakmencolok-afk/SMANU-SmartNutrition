"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  error?: boolean;
}

type Status = "idle" | "loading" | "error";

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─────────────────────────────────────────────────────────────
// Inline markdown renderer — bold + bullet points
// ─────────────────────────────────────────────────────────────

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function MessageBody({ content }: { content: string }) {
  const lines = content.split("\n").filter((l) => l.trim() !== "");
  return (
    <div className="space-y-1.5 text-[13.5px] leading-relaxed break-words min-w-0">
      {lines.map((line, i) => {
        const bullet = line.match(/^[-•*]\s+(.*)/);
        if (bullet) {
          return (
            <div key={i} className="flex gap-2 min-w-0">
              <span className="mt-[7px] w-1 h-1 rounded-full bg-current flex-shrink-0 opacity-50" />
              <span className="min-w-0">
                <InlineText text={bullet[1]} />
              </span>
            </div>
          );
        }
        return (
          <p key={i} className="min-w-0">
            <InlineText text={line} />
          </p>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Typing indicator dots
// ─────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 h-5 px-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI avatar icon (reused in messages + header)
// ─────────────────────────────────────────────────────────────

function AiAvatar({ size = 24 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        style={{ width: size * 0.5, height: size * 0.5 }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        className="text-emerald-600"
      >
        <path
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Quick starter suggestions shown on empty chat
// ─────────────────────────────────────────────────────────────

const STARTERS = [
  "Aku belum makan, apa yang harus dipilih?",
  "Budget 15 ribu, makanan apa yang cukup bergizi?",
  "Kenapa penting minum air yang cukup saat sekolah?",
  "Apa bedanya karbohidrat dan protein?",
];

// ─────────────────────────────────────────────────────────────
// Main widget
// ─────────────────────────────────────────────────────────────

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "loading";

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll on mobile while panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ── Send message ──────────────────────────────────────────
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
    };

    // Snapshot current messages BEFORE adding the new user message
    // so we build history from what was already in the conversation
    const historySnapshot = messages
      .filter((m) => !m.error)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStatus("loading");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historySnapshot,
        }),
      });

      const data: { reply?: string; error?: string } = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "model", content: data.reply! },
      ]);
      setStatus("idle");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "model", content: msg, error: true },
      ]);
      setStatus("error");
    }
  }, [input, messages, isLoading]);

  // Enter sends, Shift+Enter adds line break
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Remove last error bubble so user can retry cleanly
  function retryLast() {
    setMessages((prev) => prev.filter((m) => !m.error));
    setStatus("idle");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function clearHistory() {
    setMessages([]);
    setStatus("idle");
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Chat Panel ──────────────────────────────────────────── */}
      {/*
        Mobile  : full-width, anchored to bottom, max 92dvh, slide up/down
        Desktop : fixed-size floating panel, bottom-right
      */}
      <div
        role="dialog"
        aria-label="SMANU AI Assistant"
        aria-modal={open}
        className={clsx(
          "fixed z-[70] flex flex-col bg-white",
          "transition-[transform,opacity] duration-300 ease-out will-change-transform",
          // Mobile layout — full width slide-up sheet
          "inset-x-0 bottom-0 rounded-t-2xl",
          "max-h-[92dvh] min-h-0",
          // Desktop layout — floating panel
          "lg:inset-auto lg:bottom-24 lg:right-6",
          "lg:w-[380px] lg:max-h-[580px] lg:rounded-2xl",
          // Open / closed states
          open
            ? "translate-y-0 opacity-100 pointer-events-auto shadow-2xl"
            : "translate-y-6 opacity-0 pointer-events-none shadow-none",
          "border border-slate-200"
        )}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0 rounded-t-2xl bg-gradient-to-r from-[#006c49] to-[#00523a] text-white">
          <AiAvatar size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">SMANU AI Assistant</p>
            <p className="text-[11px] text-white/70 leading-tight">
              Asisten edukasi nutrisi pelajar
            </p>
          </div>

          {/* Clear history */}
          {hasMessages && (
            <button
              onClick={clearHistory}
              className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-white/70 hover:text-white"
              title="Bersihkan percakapan"
              aria-label="Bersihkan percakapan"
            >
              {/* trash icon */}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-white/70 hover:text-white"
            aria-label="Tutup AI Assistant"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Messages ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 min-h-0 space-y-3">
          {/* Empty state */}
          {!hasMessages && (
            <div className="flex flex-col items-center gap-4 py-4 px-2 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                <AiAvatar size={32} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Halo! Aku SMANU AI Assistant.
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[240px] mx-auto">
                  Tanya apa saja tentang nutrisi, pilihan makanan, atau kebiasaan makan sehat untuk pelajar.
                </p>
              </div>
              {/* Starter chips */}
              <div className="w-full max-w-[280px] flex flex-col gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      setTimeout(() => inputRef.current?.focus(), 80);
                    }}
                    className="text-xs text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-slate-600 leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex items-end gap-2 min-w-0",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {/* AI avatar — only on model messages */}
              {msg.role === "model" && <AiAvatar size={24} />}

              <div
                className={clsx(
                  "max-w-[80%] min-w-0 px-3 py-2.5 rounded-2xl",
                  msg.role === "user"
                    ? "bg-[#006c49] text-white rounded-br-sm"
                    : msg.error
                    ? "bg-red-50 border border-red-200 text-red-700 rounded-bl-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                )}
              >
                <MessageBody content={msg.content} />
                {msg.error && (
                  <button
                    onClick={retryLast}
                    className="mt-2 text-xs font-medium underline text-red-600 hover:text-red-800 block"
                  >
                    Coba lagi
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-end gap-2">
              <AiAvatar size={24} />
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2.5">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input area ────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-100 px-3 pb-3 pt-2 bg-white rounded-b-2xl">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis pesanmu… (Enter untuk kirim)"
              rows={1}
              maxLength={800}
              disabled={isLoading}
              className={clsx(
                "flex-1 min-w-0 resize-none rounded-xl border bg-slate-50 px-3 py-2.5",
                "text-[13.5px] text-slate-800 placeholder-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500",
                "transition-all disabled:opacity-50 overflow-y-auto max-h-24",
                "border-slate-200 leading-relaxed"
              )}
            />
            <button
              onClick={send}
              disabled={isLoading || !input.trim()}
              aria-label="Kirim pesan"
              className={clsx(
                "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                "bg-[#006c49] hover:bg-[#005236] text-white",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "transition-colors"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center leading-tight">
            Informasi bersifat edukatif — bukan pengganti dokter atau ahli gizi
          </p>
        </div>
      </div>

      {/* ── Floating trigger button ──────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup SMANU AI Assistant" : "Buka SMANU AI Assistant"}
        className={clsx(
          "fixed z-[70] bottom-6 right-6",
          "w-14 h-14 rounded-full shadow-xl",
          "bg-[#006c49] hover:bg-[#005236] text-white",
          "flex items-center justify-center",
          "transition-all duration-300",
          open ? "rotate-90 scale-95" : "rotate-0 scale-100"
        )}
      >
        {open ? (
          /* X icon when open */
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          /* Chat bubble icon when closed */
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </>
  );
}
