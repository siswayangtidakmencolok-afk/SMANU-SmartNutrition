"use client";

import { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { RetrievedChunkMeta } from "@/lib/types";
import { categoryMeta } from "@/lib/knowledge-base";

interface StreamingResponseProps {
  text: string;
  isStreaming: boolean;
  retrievedChunks: RetrievedChunkMeta[];
}

// Parse structured response sections
function parseStructuredResponse(text: string): Array<{ heading: string; content: string }> {
  const sections: Array<{ heading: string; content: string }> = [];
  const lines = text.split("\n");
  let currentHeading = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^\*\*(.+?)\*\*/);
    if (headingMatch && line.trim().startsWith("**")) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() });
      }
      currentHeading = headingMatch[1];
      const restOfLine = line.replace(/^\*\*(.+?)\*\*/, "").replace(/^[\s—\-:]+/, "").trim();
      currentContent = restOfLine ? [restOfLine] : [];
    } else if (currentHeading) {
      currentContent.push(line);
    }
  }

  if (currentHeading) {
    sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() });
  }

  return sections;
}

function SectionIcon({ heading }: { heading: string }) {
  const h = heading.toLowerCase();
  if (h.includes("main") || h.includes("jawaban")) return <span>💡</span>;
  if (h.includes("why") || h.includes("mengapa") || h.includes("matter")) return <span>🔬</span>;
  if (h.includes("practical") || h.includes("saran") || h.includes("suggestion")) return <span>✅</span>;
  if (h.includes("watch") || h.includes("perhatikan") || h.includes("aware")) return <span>⚠️</span>;
  if (h.includes("responsible") || h.includes("ai") || h.includes("note")) return <span>ℹ️</span>;
  return <span>📌</span>;
}

function SectionColor(heading: string): string {
  const h = heading.toLowerCase();
  if (h.includes("main") || h.includes("jawaban")) return "border-emerald-200 bg-emerald-50";
  if (h.includes("why") || h.includes("mengapa") || h.includes("matter")) return "border-blue-200 bg-blue-50";
  if (h.includes("practical") || h.includes("saran") || h.includes("suggestion")) return "border-violet-200 bg-violet-50";
  if (h.includes("watch") || h.includes("perhatikan") || h.includes("aware")) return "border-amber-200 bg-amber-50";
  if (h.includes("responsible") || h.includes("ai") || h.includes("note")) return "border-zinc-200 bg-zinc-50";
  return "border-zinc-200 bg-zinc-50";
}

function FormatContent({ content }: { content: string }) {
  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");
        const isNumbered = /^\d+\./.test(line.trim());
        const text = isBullet
          ? line.replace(/^[-•]\s*/, "")
          : isNumbered
          ? line.replace(/^\d+\.\s*/, "")
          : line;

        // Replace **bold** with <strong>
        const formatted = text.replace(/\*\*(.+?)\*\*/g, "**$1**");

        if (isBullet || isNumbered) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-zinc-700">
              <span className="mt-0.5 flex-shrink-0 text-zinc-400">{isNumbered ? `${i + 1}.` : "•"}</span>
              <span>{formatted}</span>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-zinc-700 leading-relaxed">
            {formatted}
          </p>
        );
      })}
    </div>
  );
}

const categoryColorMap: Record<string, string> = {
  basic_nutrition: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hydration: "bg-blue-100 text-blue-700 border-blue-200",
  food_choices: "bg-orange-100 text-orange-700 border-orange-200",
  student_context: "bg-violet-100 text-violet-700 border-violet-200",
  food_label: "bg-yellow-100 text-yellow-700 border-yellow-200",
  nutrition_education: "bg-teal-100 text-teal-700 border-teal-200",
};

export function StreamingResponse({ text, isStreaming, retrievedChunks }: StreamingResponseProps) {
  const [showSources, setShowSources] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [text, isStreaming]);

  const sections = !isStreaming ? parseStructuredResponse(text) : null;

  return (
    <div className="space-y-4">
      {/* RAG Retrieved Sources Banner */}
      {retrievedChunks.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-700">
                📚 Knowledge Retrieved ({retrievedChunks.length} sources)
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                RAG Active
              </span>
            </div>
            <span className="text-xs text-zinc-400">{showSources ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {showSources && (
            <div className="border-t border-zinc-200 px-4 py-3 space-y-2">
              {retrievedChunks.map((chunk) => {
                const meta = categoryMeta[chunk.category as keyof typeof categoryMeta];
                return (
                  <div key={chunk.id} className="flex items-start gap-3">
                    <span
                      className={clsx(
                        "mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium",
                        categoryColorMap[chunk.category] ?? "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      {meta?.icon} {meta?.label ?? chunk.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-700 truncate">{chunk.title}</p>
                      {chunk.matchedTerms.length > 0 && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Matched: {chunk.matchedTerms.slice(0, 5).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-zinc-400">
                      score {chunk.score}
                    </span>
                  </div>
                );
              })}
              <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-100">
                Retrieval method: keyword TF-IDF + situation-category bias mapping
              </p>
            </div>
          )}
        </div>
      )}

      {/* Streaming text (raw) */}
      {isStreaming && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-zinc-400">Generating response…</span>
          </div>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{text}</p>
          <div ref={bottomRef} />
        </div>
      )}

      {/* Structured sections after streaming */}
      {!isStreaming && sections && sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <div
              key={i}
              className={clsx("rounded-xl border p-4 space-y-2", SectionColor(section.heading))}
            >
              <div className="flex items-center gap-2">
                <SectionIcon heading={section.heading} />
                <h3 className="text-sm font-semibold text-zinc-800">{section.heading}</h3>
              </div>
              <FormatContent content={section.content} />
            </div>
          ))}
        </div>
      )}

      {/* Fallback plain text */}
      {!isStreaming && sections && sections.length === 0 && text && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}
