import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmanuLogo } from "@/components/SmanuLogo";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="About"
        title="About SMANU"
        subtitle="SmartNutrition for Students — an educational AI nutrition assistant."
      />

      {/* Full logo */}
      <div className="flex justify-center py-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 rounded-xl">
        <SmanuLogo variant="full" className="w-full max-w-sm h-auto" />
      </div>

      {/* Hero card */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[--color-primary] to-[--color-inverse-surface] p-6 text-[--color-on-primary]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">SMANU</h2>
            <p className="text-sm opacity-80 mt-0.5">SmartNutrition for Students</p>
            <p className="text-sm opacity-90 mt-3 leading-relaxed max-w-sm">
              SMANU helps students make better food decisions by translating general nutrition
              knowledge into personalized, context-aware guidance grounded in peer-reviewed research.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">smart_toy</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {["RAG-Powered", "Context-Aware", "Educational", "Student-First"].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Problem statement */}
      <Card>
        <h2 className="text-sm font-bold text-[--color-on-surface] mb-2">🎯 The Problem</h2>
        <p className="text-sm text-[--color-on-surface-variant] leading-relaxed">
          Nutrition information is widely available but rarely personalized for real student
          situations — limited budgets, campus canteen choices, time pressure, and uncertainty
          about which food to pick from what&apos;s available. Generic AI answers don&apos;t
          account for your specific context.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[--color-outline-variant] bg-[--color-surface-container-low] p-3">
            <p className="text-[11px] font-semibold text-[--color-on-surface-variant] mb-2">
              Generic AI
            </p>
            <div className="text-xs text-[--color-on-surface-variant] space-y-1">
              <p>User → Question</p>
              <p>→ AI → Generic Answer</p>
            </div>
          </div>
          <div className="rounded-lg border border-[--color-secondary-container] bg-[--color-secondary-container]/10 p-3">
            <p className="text-[11px] font-semibold text-[--color-secondary] mb-2">SMANU RAG</p>
            <div className="text-xs text-[--color-on-surface-variant] space-y-1">
              <p>Context + Question</p>
              <p>→ Knowledge Retrieval</p>
              <p>→ Structured Answer</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Responsible AI */}
      <Card className="border border-amber-200 bg-amber-50">
        <h2 className="text-sm font-bold text-amber-800 mb-3">⚖️ Responsible AI Principles</h2>
        <ul className="flex flex-col gap-2">
          {[
            "Never diagnoses health conditions or makes medical claims",
            "Never requests sensitive health data, medical history, or personal ID",
            "All recommendations cite knowledge base sources — no hallucination",
            "Always includes educational disclaimer and suggests professionals for medical needs",
            "User provides their own context — AI does not assume health status",
            "Designed for educational purposes only, not clinical use",
          ].map((principle) => (
            <li key={principle} className="flex items-start gap-2 text-sm text-amber-800">
              <span className="text-amber-600 flex-shrink-0 mt-0.5">✓</span>
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Tech stack */}
      <Card>
        <h2 className="text-sm font-bold text-[--color-on-surface] mb-4">🔧 Technical Architecture</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Frontend", value: "Next.js 16 + TypeScript + Tailwind CSS v4" },
            { label: "RAG Engine", value: "Astra DB Vector DB + IBM Langflow (Phase 2)" },
            { label: "Knowledge Base", value: "Structured nutrition entries — peer reviewed" },
            { label: "LLM", value: "OpenAI GPT-4o-mini via streaming API (Phase 2)" },
            { label: "Personalization", value: "User-defined context — no health data assumed" },
            { label: "Response Format", value: "Structured output with source citations" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-[--color-surface-container-low] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[--color-on-surface-variant]">
                {item.label}
              </p>
              <p className="text-xs text-[--color-on-surface] mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Knowledge categories */}
      <Card>
        <h2 className="text-sm font-bold text-[--color-on-surface] mb-4">
          📚 Knowledge Base Categories
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: "🥗", cat: "Basic Nutrition", desc: "Carbs, protein, fat, fiber, vitamins" },
            { emoji: "💧", cat: "Hydration", desc: "Water needs, beverages, dehydration" },
            { emoji: "🍽️", cat: "Food Choices", desc: "Food groups, meal composition" },
            { emoji: "🎒", cat: "Student Context", desc: "Affordable meals, canteen choices" },
            { emoji: "🏷️", cat: "Food Label Literacy", desc: "Serving size, calories, sugar" },
            { emoji: "📖", cat: "Nutrition Education", desc: "GI index, definitions, myths" },
          ].map((item) => (
            <div key={item.cat} className="rounded-lg bg-[--color-surface-container-low] p-3">
              <p className="text-sm font-semibold text-[--color-on-surface]">
                {item.emoji} {item.cat}
              </p>
              <p className="text-[11px] text-[--color-on-surface-variant] mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col items-center gap-3 py-4">
        <Badge variant="neutral">Prototype v0.1</Badge>
        <p className="text-xs text-[--color-on-surface-variant] text-center">
          SMANU · A RAG-powered educational nutrition assistant for students
          <br />
          Built with Next.js, TypeScript, Tailwind CSS
        </p>
        <Link href="/how-it-works" className="text-xs text-[--color-secondary] hover:underline font-medium">
          Learn how SMANU works →
        </Link>
      </div>
    </div>
  );
}
