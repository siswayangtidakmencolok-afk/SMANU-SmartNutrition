import Link from "next/link";
import { QUEST_QUESTION_COUNT } from "@/lib/nutriquest-bank";
import { LiveContextWidget } from "@/components/dashboard/LiveContextWidget";
import { RecentSessionsWidget } from "@/components/dashboard/RecentSessionsWidget";
import { NutriQuestProgressWidget } from "@/components/dashboard/NutriQuestProgressWidget";

// ── Static data ────────────────────────────────────────────────────────────

const featureCards = [
  {
    href: "/ask-smanu",
    icon: "smart_toy",
    iconBg: "bg-[#6cf8bb] text-[#002113]",
    badge: "Interactive RAG",
    title: "Ask SMANU AI",
    desc: "Konsultasi gizi berbasis konteks kamu — budget kantin, bahan tersedia, dan jadwal sekolah.",
    cta: "Mulai Chat AI",
    ctaColor: "text-emerald-600",
  },
  {
    href: "/nutrition-knowledge",
    icon: "menu_book",
    iconBg: "bg-[#dce9ff] text-[#0b1c30]",
    badge: "Kurikulum Gizi",
    title: "Nutrition Knowledge",
    desc: "Modul sains terverifikasi: makronutrien, mikronutrien, hidrasi, dan kebiasaan makan sehat.",
    cta: "Buka Katalog Sains",
    ctaColor: "text-slate-700",
  },
  {
    href: "/my-context",
    icon: "emoji_events",
    iconBg: "bg-[#acedff] text-[#004e5c]",
    badge: "Sertifikasi Siswa",
    title: "NutriQuest Challenge",
    desc: `Kuis ${QUEST_QUESTION_COUNT} soal literasi gizi dengan sertifikat digital untuk portofolio.`,
    cta: `Uji Kemampuan (${QUEST_QUESTION_COUNT} Soal)`,
    ctaColor: "text-emerald-600",
  },
  {
    href: "/nutrition-knowledge",
    icon: "fact_check",
    iconBg: "bg-slate-100 text-slate-700",
    badge: "Panduan Praktis",
    title: "Pahami Label Makanan",
    desc: "Panduan membaca batas GGL (Gula, Garam, Lemak) pada jajanan kemasan dan kantin.",
    cta: "Pelajari Skrining Label",
    ctaColor: "text-slate-700",
  },
];

const suggestedPrompts = [
  { emoji: "⚡", text: "Menu warteg budget 15k tinggi protein" },
  { emoji: "🥱", text: "Cegah ngantuk saat pelajaran ke-5" },
  { emoji: "🥚", text: "Sumber protein murah selain ayam fillet" },
  { emoji: "💧", text: "Target hidrasi 2 liter saat jam ekskul" },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ══════════════════════════════════════════════════════════════════════
          TOP HEADER ROW
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6cf8bb] text-[#002113] text-xs font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
              SMANU PORTAL AKTIF
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] text-xs font-medium">
              <span className="material-symbols-outlined text-[13px] text-[#4cd7f6]">verified</span>
              RAG Verified · Astra DB
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Selamat Datang di SMANU 👋
          </h1>
          <p className="text-sm text-slate-500">
            Platform edukasi gizi pelajar berbasis AI — personalisasi, riset, dan interaktif.
          </p>
        </div>

        {/* Quick CTA */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <Link
            href="/ask-smanu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131b2e] hover:bg-slate-700 text-white text-sm font-bold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            Tanya SMANU AI
          </Link>
          <Link
            href="/nutrition-knowledge"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006c49]">menu_book</span>
            Jelajahi Gizi
          </Link>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER — dark navy
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full rounded-2xl overflow-hidden bg-[#131b2e] text-white shadow-xl">
        {/* Ambient glow */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#006c49] opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-24 w-80 h-80 rounded-full bg-[#4cd7f6] opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-10 items-center">
          {/* Left */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#6cf8bb] text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              SMANU Neural RAG · Adaptif Konteks Pelajar
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-white">
              Pilihan Gizi Cerdas untuk<br className="hidden sm:block" /> Fokus Belajarmu
            </h2>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Asisten nutrisi berbasis riset ilmiah yang menyesuaikan rekomendasi dengan menu kantin sekolah dan budget harianmu.
            </p>

            {/* Suggested prompts */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Coba tanya:</span>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((p) => (
                  <Link
                    key={p.text}
                    href={`/ask-smanu?q=${encodeURIComponent(p.text)}`}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all text-left"
                  >
                    {p.emoji} {p.text}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right — mini energy metric */}
          <div className="lg:col-span-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6cf8bb]">Status Sistem</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6cf8bb] animate-pulse" />
                  Live
                </span>
              </div>
              {/* Sparkline SVG */}
              <div className="w-full h-10 flex items-end">
                <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 200 40">
                  <path d="M0 32 Q 30 35, 60 22 T 120 18 T 160 12 T 200 8" fill="none" stroke="#6cf8bb" strokeLinecap="round" strokeWidth="2.5" />
                  <circle cx="200" cy="8" fill="#6cf8bb" r="4" className="animate-ping opacity-75" />
                  <circle cx="200" cy="8" fill="white" r="3" />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-slate-400">Langflow</p>
                  <p className="text-xs font-bold text-[#6cf8bb]">RAG</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Astra DB</p>
                  <p className="text-xs font-bold text-[#4cd7f6]">Vector</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Gemini</p>
                  <p className="text-xs font-bold text-[#6cf8bb]">AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-lg text-xs text-slate-400">
                <span className="material-symbols-outlined text-[16px] text-[#6cf8bb]">wb_sunny</span>
                Prototype v0.1 · IBM Langflow + Bob + Gemini
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE DATA ROW — 3 client widgets
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveContextWidget />
        <RecentSessionsWidget />
        <NutriQuestProgressWidget />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE CARDS — 4 module pathways
      ══════════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Eksplorasi Fitur</h2>
            <p className="text-xs text-slate-500">4 modul terintegrasi untuk belajar, konsultasi AI, dan uji kemampuan</p>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">4 Modul</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-[26px]">{card.icon}</span>
                </div>
                <div className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  {card.badge}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-tight">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
              <div className={`pt-4 flex items-center gap-1 text-xs font-semibold ${card.ctaColor}`}>
                <span>{card.cta}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          DAILY NUTRITION INSIGHT
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Insight card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl" />
          <div className="flex items-center justify-between gap-2 flex-wrap pl-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6cf8bb] text-[#002113] text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">tips_and_updates</span>
              Insight Gizi Hari Ini
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">+35% Daya Fokus</span>
          </div>
          <div className="pl-2">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Atasi Lemas di Jam Ke-5 Sekolah
            </h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Mengombinasikan <strong className="text-slate-800">telur rebus + sayur bening</strong> di kantin jauh lebih menjaga kewaspadaan otak dibanding mie instan dobel karbohidrat.
            </p>
          </div>

          {/* Comparison bars */}
          <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2.5 pl-2">
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Protein + Serat
                </span>
                <span className="font-semibold text-emerald-600">Stabil 4 jam</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Karbohidrat Sederhana
                </span>
                <span className="font-semibold text-red-500">Spike → Crash</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full rounded-full" style={{ width: "35%" }} />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic pl-2">
            &ldquo;Asam amino tirosin dari telur mendukung neurotransmiter dopamin untuk konsentrasi mengerjakan soal matematika.&rdquo;
          </p>

          <div className="flex items-center justify-between pl-2">
            <span className="text-[11px] text-slate-400">Sumber: Litbang Gizi Remaja & Biokimia Otak</span>
            <Link href="/nutrition-knowledge" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-0.5">
              Baca selengkapnya
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* How SMANU works — mini 4-step */}
        <div className="bg-[#131b2e] rounded-2xl p-5 text-white flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6cf8bb] text-[20px]">account_tree</span>
            <div>
              <h3 className="text-sm font-bold text-white">Bagaimana SMANU Bekerja</h3>
              <p className="text-[11px] text-slate-400">Retrieval-Augmented Generation Pipeline</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { n: "01", icon: "badge", title: "Konteks Kamu", desc: "Situasi, budget, makanan tersedia" },
              { n: "02", icon: "record_voice_over", title: "Pertanyaanmu", desc: "Bahasa alami sehari-hari" },
              { n: "03", icon: "dataset", title: "Retrieval Astra DB", desc: "Semantic search knowledge base" },
              { n: "04", icon: "assignment_turned_in", title: "Jawaban Terstruktur", desc: "Berbasis bukti ilmiah" },
            ].map((step, i, arr) => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#006c49]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#6cf8bb] text-xs font-black">{step.n}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px h-4 bg-[#006c49]/30 mt-1" />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className="text-xs font-semibold text-white leading-tight">{step.title}</p>
                  <p className="text-[11px] text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/how-it-works"
            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Pelajari arsitektur lengkap
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          RESPONSIBLE AI FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="rounded-2xl bg-slate-50 border border-slate-200 p-4 md:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px] text-slate-600">policy</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">🛡️ Catatan Edukasi & AI Bertanggung Jawab</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                SMANU menyediakan informasi literasi gizi edukatif berbasis pedoman resmi Kementerian Kesehatan RI dan riset terverifikasi.{" "}
                <strong className="text-slate-700">Bukan pengganti konsultasi, diagnosis, atau terapi medis oleh dokter atau nutrisionis klinis bersertifikat.</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/help" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors">
              Etika AI
            </Link>
            <Link href="/about" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors">
              Tentang SMANU
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
