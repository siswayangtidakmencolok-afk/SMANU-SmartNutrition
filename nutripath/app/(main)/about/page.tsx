import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmanuLogo } from "@/components/SmanuLogo";

// ─────────────────────────────────────────────────────────────
// Developer & project data
// Untuk mengubah: edit bagian DEVELOPER dan OTHER_PROJECTS di bawah.
// ─────────────────────────────────────────────────────────────

const DEVELOPER = {
  displayName: "Fhazwan Athar Ramadhan",
  role: "Student Developer & Creator of SMANU",
  bio: "Pelajar yang mengembangkan SMANU sebagai platform edukasi gizi berbasis AI. Tertarik pada perpaduan antara teknologi, pendidikan, dan kesehatan sehari-hari — khususnya bagaimana AI dapat membantu pelajar membuat keputusan makan yang lebih baik dengan sumber daya terbatas.",
  motivation:
    "SMANU lahir dari pengalaman nyata: banyak pelajar yang bingung memilih makanan sehat dengan budget terbatas dan pilihan kantin yang tidak bervariasi. Informasi gizi yang tersedia secara umum jarang memperhitungkan konteks spesifik siswa Indonesia.",
  contributions: [
    { icon: "💡", label: "Product Concept", desc: "Ide awal, riset kebutuhan pengguna, dan desain solusi" },
    { icon: "🖥️", label: "Frontend Development", desc: "UI/UX dengan Next.js, TypeScript, dan Tailwind CSS v4" },
    { icon: "🤖", label: "AI Workflow & API Integration", desc: "IBM Langflow pipeline, Astra DB RAG, dan Gemini AI" },
    { icon: "🔍", label: "Testing & Debugging", desc: "Uji coba alur pengguna, perbaikan bug, dan optimasi" },
    { icon: "🚀", label: "Deployment", desc: "Konfigurasi lingkungan dan deployment aplikasi" },
  ],
  techStack: [
    { name: "Next.js 16", type: "Framework" },
    { name: "TypeScript", type: "Language" },
    { name: "Tailwind CSS v4", type: "Styling" },
    { name: "IBM Langflow", type: "AI Orchestration" },
    { name: "IBM Bob (LLM)", type: "Language Model" },
    { name: "Astra DB", type: "Vector Database" },
    { name: "Google Gemini", type: "AI Assistant" },
    { name: "Vercel", type: "Deployment" },
  ],
  social: {
    github: "https://github.com/siswayangtidakmencolok-afk",
    githubUsername: "siswayangtidakmencolok-afk",
    projectRepo: "https://github.com/siswayangtidakmencolok-afk/SMANU-SmartNutrition",
    instagram: "https://www.instagram.com/f.zvvn_/",
    tiktok: "https://www.tiktok.com/@ekstrovertselalu",
    telegram: "https://t.me/Art_zwn",
    linkedin: "https://www.linkedin.com/in/fhazwan26092008/",
  },
  honesty:
    "Produk ini dikembangkan oleh satu developer dengan bantuan framework open-source, library pihak ketiga, dan AI coding assistant. Tidak semua baris kode ditulis manual — SMANU adalah hasil kolaborasi antara developer dan tools yang disebutkan di atas.",
};

// ─────────────────────────────────────────────────────────────
// Proyek lain milik developer
// Tambahkan proyek baru di sini — cukup tambah satu objek ke array.
// ─────────────────────────────────────────────────────────────

const OTHER_PROJECTS: {
  title: string;
  desc: string;
  tags: string[];
  url: string; // Isi dengan URL asli, atau biarkan "#" jika belum ada
  status: "live" | "in-progress" | "coming-soon";
}[] = [
  {
    title: "Web Frieren The Journey",
    desc: "Website dedikasi saya untuk anime peak frieren dan disini semua hal tentang anime/manga frieren ada",
    tags: ["HTML, CSS, Boostrap, APIGateaway"],
    url: "https://siswayangtidakmencolok-afk.github.io/website-frieren/",
    status: "live",
  },
  // Contoh format tambah proyek:
  // {
  //   title: "Nama Proyek",
  //   desc: "Deskripsi singkat proyek.",
  //   tags: ["Next.js", "AI"],
  //   url: "https://github.com/kamu/nama-proyek",
  //   status: "live",
  // },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="About"
        title="About SMANU"
        subtitle="SmartNutrition for Students — an educational AI nutrition assistant."
      />

      {/* Logo */}
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
            <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium">
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
            <p className="text-[11px] font-semibold text-[--color-on-surface-variant] mb-2">Generic AI</p>
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
          ].map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-amber-800">
              <span className="text-amber-600 flex-shrink-0 mt-0.5">✓</span>
              <span>{p}</span>
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
            { label: "AI Orchestration", value: "IBM Langflow + IBM Bob (LLM)" },
            { label: "Vector Database", value: "DataStax Astra DB (RAG)" },
            { label: "AI Assistant", value: "Google Gemini API" },
            { label: "Personalization", value: "User context — no health data assumed" },
            { label: "Knowledge Base", value: "Structured nutrition entries, peer-reviewed" },
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
        <h2 className="text-sm font-bold text-[--color-on-surface] mb-4">📚 Knowledge Base Categories</h2>
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
              <p className="text-sm font-semibold text-[--color-on-surface]">{item.emoji} {item.cat}</p>
              <p className="text-[11px] text-[--color-on-surface-variant] mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          DEVELOPER PROFILE
      ═══════════════════════════════════════════════════════════ */}
      <div id="developer" className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[--color-outline-variant]" />
          <span className="text-xs font-semibold text-[--color-on-surface-variant] uppercase tracking-wider px-2">
            Developer Profile
          </span>
          <div className="h-px flex-1 bg-[--color-outline-variant]" />
        </div>

        {/* Profile card */}
        <Card>
          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--color-secondary-container] to-[--color-tertiary-fixed] flex items-center justify-center flex-shrink-0 shadow-sm">
              {/* Ganti elemen di bawah dengan <Image> jika ada foto profil */}
              <span className="text-2xl font-black text-[--color-on-secondary-container] select-none">F</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h3 className="text-lg font-bold text-[--color-on-surface] leading-tight">
                {DEVELOPER.displayName}
              </h3>
              <p className="text-sm text-[--color-secondary] font-medium">{DEVELOPER.role}</p>
              <p className="text-xs text-[--color-on-surface-variant] leading-relaxed mt-1">
                {DEVELOPER.bio}
              </p>
            </div>
          </div>

          {/* Motivation */}
          <div className="mt-4 p-3 rounded-xl bg-[--color-surface-container-low] border-l-4 border-[--color-secondary]">
            <p className="text-[11px] font-semibold text-[--color-secondary] uppercase tracking-wider mb-1">
              Motivasi
            </p>
            <p className="text-xs text-[--color-on-surface-variant] leading-relaxed">
              {DEVELOPER.motivation}
            </p>
          </div>

          {/* Honesty note */}
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-[--color-surface-container]">
            <span className="text-[--color-outline] text-[14px] flex-shrink-0 mt-0.5">ℹ️</span>
            <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed">
              {DEVELOPER.honesty}
            </p>
          </div>
        </Card>

        {/* Contributions */}
        <Card>
          <h3 className="text-sm font-bold text-[--color-on-surface] mb-3">🛠️ Contribution Areas</h3>
          <div className="flex flex-col gap-2">
            {DEVELOPER.contributions.map((c) => (
              <div key={c.label} className="flex items-start gap-3 p-2.5 rounded-lg bg-[--color-surface-container-low]">
                <span className="text-base flex-shrink-0 mt-0.5">{c.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-[--color-on-surface]">{c.label}</p>
                  <p className="text-[11px] text-[--color-on-surface-variant]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tech stack pills */}
        <Card>
          <h3 className="text-sm font-bold text-[--color-on-surface] mb-3">⚙️ Tools & Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {DEVELOPER.techStack.map((t) => (
              <div
                key={t.name}
                className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-[--color-outline-variant] bg-[--color-surface-container-lowest] min-w-[80px] text-center"
              >
                <span className="text-xs font-semibold text-[--color-on-surface]">{t.name}</span>
                <span className="text-[10px] text-[--color-on-surface-variant]">{t.type}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Social links */}
        <Card>
          <h3 className="text-sm font-bold text-[--color-on-surface] mb-3">🔗 Connect</h3>
          <div className="grid grid-cols-2 gap-2">

            {/* GitHub profile */}
            <a
              href={DEVELOPER.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-outline-variant] hover:border-slate-500 hover:bg-slate-50 transition-all group"
            >
              <svg className="w-4 h-4 shrink-0 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[--color-on-surface] truncate">GitHub</p>
                <p className="text-[10px] text-[--color-on-surface-variant] truncate">@{DEVELOPER.social.githubUsername}</p>
              </div>
            </a>

            {/* Project repo */}
            <a
              href={DEVELOPER.social.projectRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-secondary-container] bg-[--color-secondary-container]/10 hover:bg-[--color-secondary-container]/20 transition-all group"
            >
              <span className="material-symbols-outlined text-[--color-secondary] text-[18px] flex-shrink-0">code</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[--color-on-surface] truncate">Source Code</p>
                <p className="text-[10px] text-[--color-secondary] truncate">SMANU-SmartNutrition</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={DEVELOPER.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-outline-variant] hover:border-pink-300 hover:bg-pink-50 transition-all group"
            >
              <svg className="w-4 h-4 shrink-0 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              <span className="text-xs font-medium text-[--color-on-surface] truncate">Instagram</span>
            </a>

            {/* TikTok */}
            <a
              href={DEVELOPER.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-outline-variant] hover:border-slate-400 hover:bg-slate-50 transition-all group"
            >
              <svg className="w-4 h-4 shrink-0 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.79a8.18 8.18 0 004.78 1.52V6.85a4.85 4.85 0 01-1.01-.16z" />
              </svg>
              <span className="text-xs font-medium text-[--color-on-surface] truncate">TikTok</span>
            </a>

            {/* Telegram */}
            <a
              href={DEVELOPER.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-outline-variant] hover:border-sky-300 hover:bg-sky-50 transition-all group"
            >
              <svg className="w-4 h-4 shrink-0 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="text-xs font-medium text-[--color-on-surface] truncate">Telegram</span>
            </a>

            {/* LinkedIn */}
            <a
              href={DEVELOPER.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-outline-variant] hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <svg className="w-4 h-4 shrink-0 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="text-xs font-medium text-[--color-on-surface] truncate">LinkedIn</span>
            </a>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          OTHER PROJECTS
          Untuk menambah proyek: edit array OTHER_PROJECTS di atas.
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[--color-outline-variant]" />
          <span className="text-xs font-semibold text-[--color-on-surface-variant] uppercase tracking-wider px-2">
            Other Projects
          </span>
          <div className="h-px flex-1 bg-[--color-outline-variant]" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {OTHER_PROJECTS.map((project) => (
            <div
              key={project.title}
              className="rounded-xl border border-[--color-outline-variant] bg-[--color-surface-container-lowest] p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-[--color-on-surface]">{project.title}</h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        project.status === "live"
                          ? "bg-[--color-secondary-container]/30 text-[--color-secondary]"
                          : project.status === "in-progress"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-[--color-surface-container-high] text-[--color-on-surface-variant]"
                      }`}
                    >
                      {project.status === "live" ? "Live" : project.status === "in-progress" ? "In Progress" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-[--color-on-surface-variant] leading-relaxed">{project.desc}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-[--color-surface-container] text-[--color-on-surface-variant] text-[10px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              {project.url !== "#" ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--color-secondary] hover:underline"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  Lihat di GitHub
                </a>
              ) : (
                <span className="text-[11px] text-[--color-outline] italic">
                  — URL belum tersedia. Edit OTHER_PROJECTS di about/page.tsx untuk menambahkan.
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Hint buat developer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[--color-surface-container-low] border border-dashed border-[--color-outline-variant]">
          <span className="material-symbols-outlined text-[--color-outline] text-[16px] mt-0.5 flex-shrink-0">edit_note</span>
          <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed">
            <span className="font-semibold text-[--color-on-surface]">Cara tambah proyek baru:</span>{" "}
            Buka <code className="bg-[--color-surface-container] px-1 py-0.5 rounded text-[10px]">app/(main)/about/page.tsx</code> →
            cari array <code className="bg-[--color-surface-container] px-1 py-0.5 rounded text-[10px]">OTHER_PROJECTS</code> →
            tambahkan objek baru dengan title, desc, tags, url, dan status.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 py-4">
        <Badge variant="neutral">Prototype v0.1</Badge>
        <p className="text-xs text-[--color-on-surface-variant] text-center">
          SMANU · A RAG-powered educational nutrition assistant for students
          <br />
          Built by Fhazwan with Next.js, TypeScript, IBM Langflow & Gemini
        </p>
        <div className="flex items-center gap-4">
          <Link href="/how-it-works" className="text-xs text-[--color-secondary] hover:underline font-medium">
            How it works →
          </Link>
          <a
            href={DEVELOPER.social.projectRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[--color-secondary] hover:underline font-medium flex items-center gap-1"
          >
            GitHub Repo ↗
          </a>
        </div>
      </div>
    </div>
  );
}
