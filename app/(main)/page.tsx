import Link from "next/link";
import { QUEST_QUESTION_COUNT } from "@/lib/nutriquest-bank";
import { LiveContextWidget } from "@/components/dashboard/LiveContextWidget";
import { RecentSessionsWidget } from "@/components/dashboard/RecentSessionsWidget";
import { NutriQuestProgressWidget } from "@/components/dashboard/NutriQuestProgressWidget";
import { StudentNutritionLeagueWidget } from "@/components/dashboard/StudentNutritionLeagueWidget";
import { DashboardNavigationHub } from "@/components/dashboard/DashboardNavigationHub";

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

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <DashboardNavigationHub />

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE DATA ROW — 3 client widgets
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveContextWidget />
        <RecentSessionsWidget />
        <NutriQuestProgressWidget />
      </div>

      <StudentNutritionLeagueWidget />

      {/* ══════════════════════════════════════════════════════════════════════
          NEW FEATURES ROW — Food Challenge + Learning Journey
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Food Challenge CTA */}
        <Link
          href="/food-challenge"
          className="group relative bg-[#131b2e] rounded-2xl p-5 shadow-sm hover:shadow-lg border border-slate-700 transition-all overflow-hidden flex flex-col gap-4"
        >
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-3">
              ⚡ Baru
            </div>
            <h3 className="text-base font-bold text-white leading-tight">Food Challenge</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Simulasi pilihan makanan harian. Uji kemampuan manajemen budget dan nutrisi dalam skenario nyata.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:gap-2.5 transition-all">
            Mulai tantangan
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </Link>

        {/* Learning Journey CTA */}
        <Link
          href="/learning-journey"
          className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-100 hover:border-slate-200 transition-all overflow-hidden flex flex-col gap-4"
        >
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-[#006c49]/10 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#006c49]/10 text-[#006c49] text-[10px] font-bold mb-3">
              📊 Progres
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Learning Journey</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Lihat ringkasan progres belajarmu, topik yang perlu diulang, dan rekomendasi materi relevan.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-[#006c49] group-hover:gap-2.5 transition-all">
            Lihat perjalanan belajar
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </Link>
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
