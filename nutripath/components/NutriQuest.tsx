"use client";

import { useCallback, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  ALL_DOMAINS_LABEL,
  getDomains,
  pickQuestions,
  QUEST_QUESTION_COUNT,
  QUESTION_BANK,
  QuizQuestion,
} from "@/lib/nutriquest-bank";

// ── Achievement logic ──────────────────────────────────────────────────────
function getAchievement(correct: number, total: number) {
  const pct = (correct / total) * 100;
  if (correct === total)
    return { title: "Nutrition Master", emoji: "🏆", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
  if (pct >= 86)
    return { title: "Nutrition Scholar", emoji: "🎓", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
  if (pct >= 73)
    return { title: "Nutrition Explorer", emoji: "🌿", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30" };
  return { title: "Nutrition Starter", emoji: "🌱", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
}

// ── Certificate download via canvas ───────────────────────────────────────
function downloadCertificate(params: {
  userName: string; score: number; total: number; achievement: string; date: string;
}) {
  const { userName, score, total, achievement, date } = params;
  const pct = Math.round((score / total) * 100);
  const W = 1280, H = 880;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#F8FAFC"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#10B981"; ctx.lineWidth = 3; ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.strokeStyle = "#D1FAE5"; ctx.lineWidth = 1; ctx.strokeRect(40, 40, W - 80, H - 80);
  ([[ 52, 52], [W - 52, 52], [52, H - 52], [W - 52, H - 52]] as [number,number][]).forEach(([cx, cy]) => {
    ctx.fillStyle = "#10B981"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A"; ctx.font = "bold 36px sans-serif"; ctx.fillText("SMANU", W / 2, 120);
  ctx.fillStyle = "#10B981"; ctx.font = "600 15px sans-serif"; ctx.fillText("SMARTNUTRITION FOR STUDENTS", W / 2, 148);
  ctx.fillStyle = "#ECFDF5"; roundRect(ctx, W/2-110, 158, 220, 28, 14); ctx.fill();
  ctx.fillStyle = "#059669"; ctx.font = "600 12px sans-serif"; ctx.fillText("STUDENT NUTRITION QUEST", W / 2, 177);
  ctx.fillStyle = "#0F172A"; ctx.font = "bold 72px sans-serif"; ctx.fillText("NUTRIQUEST", W / 2, 276);
  ctx.fillStyle = "#10B981"; ctx.font = "600 18px sans-serif"; ctx.fillText("A C H I E V E M E N T   A W A R D", W / 2, 308);
  ctx.strokeStyle = "#D1D5DB"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(W/2-200, 326); ctx.lineTo(W/2+200, 326); ctx.stroke();
  ctx.fillStyle = "#6B7280"; ctx.font = "500 14px sans-serif"; ctx.fillText("AWARDED TO", W / 2, 360);
  ctx.fillStyle = "#0F172A"; ctx.font = "bold 54px sans-serif"; ctx.fillText(userName || "SMANU Student", W / 2, 430);
  ctx.fillStyle = "#374151"; ctx.font = "400 17px sans-serif";
  ctx.fillText("For successfully completing the SMANU Nutrition Quest and demonstrating", W / 2, 474);
  ctx.fillText("practical mastery of evidence-based student dietary fundamentals.", W / 2, 496);
  const boxY = 540, boxH = 100;
  drawInfoBox(ctx, 160, boxY, 260, boxH, "#F0FDF4", "#BBF7D0");
  ctx.fillStyle = "#6B7280"; ctx.font = "600 11px sans-serif"; ctx.fillText("ACHIEVEMENT", 290, boxY + 28);
  ctx.fillStyle = "#0F172A"; ctx.font = "bold 22px sans-serif"; ctx.fillText(achievement, 290, boxY + 62);
  ctx.fillStyle = "#0F172A"; ctx.beginPath(); ctx.arc(W/2, boxY+boxH/2, 52, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#10B981"; ctx.beginPath(); ctx.arc(W/2, boxY+boxH/2, 46, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 22px sans-serif"; ctx.fillText(`${pct}%`, W/2, boxY+boxH/2+8);
  ctx.font = "600 10px sans-serif"; ctx.fillText("VERIFIED", W/2, boxY+boxH/2+26);
  drawInfoBox(ctx, W-420, boxY, 260, boxH, "#F0FDF4", "#BBF7D0");
  ctx.fillStyle = "#6B7280"; ctx.font = "600 11px sans-serif"; ctx.fillText("QUEST SCORE", W-290, boxY+28);
  ctx.fillStyle = "#0F172A"; ctx.font = "bold 28px sans-serif"; ctx.fillText(`${score} / ${total}`, W-290, boxY+62);
  ctx.fillStyle = "#10B981"; ctx.font = "600 14px sans-serif"; ctx.fillText(`${pct}%  ✓`, W-290, boxY+82);
  ctx.textAlign = "left"; ctx.fillStyle = "#6B7280"; ctx.font = "500 13px sans-serif";
  ctx.fillText("DATE COMPLETED", 80, H-140);
  ctx.fillStyle = "#0F172A"; ctx.font = "bold 18px sans-serif"; ctx.fillText(date, 80, H-118);
  ctx.fillStyle = "#9CA3AF"; ctx.font = "400 11px sans-serif"; ctx.fillText(`Quest ID: NQ-${Date.now().toString(36).toUpperCase()}`, 80, H-96);
  ctx.textAlign = "center"; ctx.fillStyle = "#6B7280"; ctx.font = "500 12px sans-serif";
  ctx.fillText("Student Internal Learning Achievement • SMANU Educational Platform", W/2, H-132);
  ctx.fillStyle = "#9CA3AF"; ctx.font = "400 10px sans-serif";
  ctx.fillText("Self-paced nutrition curriculum for collegiate & high school nutrition literacy", W/2, H-112);
  ctx.textAlign = "right"; ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x <= 80; x += 4) { const y = H-140+Math.sin(x*0.3)*4; x===0?ctx.moveTo(W-200+x,y):ctx.lineTo(W-200+x,y); }
  ctx.stroke();
  ctx.fillStyle = "#0F172A"; ctx.font = "bold 14px sans-serif"; ctx.fillText("SMANU Education Team", W-80, H-118);
  ctx.fillStyle = "#6B7280"; ctx.font = "500 12px sans-serif"; ctx.fillText("SmartNutrition for Students", W-80, H-100);
  const link = document.createElement("a");
  link.download = `SMANU_NutriQuest_Certificate_${userName.replace(/\s+/g,"_")}.png`;
  link.href = canvas.toDataURL("image/png", 1.0); link.click();
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function drawInfoBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke: string) {
  ctx.fillStyle = fill; roundRect(ctx,x,y,w,h,10); ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 1; roundRect(ctx,x,y,w,h,10); ctx.stroke();
}

// ── Types ──────────────────────────────────────────────────────────────────
type QuestPhase = "widget" | "domain" | "quiz" | "result" | "review";
const LABELS = ["A","B","C","D"];

// ── Main ───────────────────────────────────────────────────────────────────
export function NutriQuest({ userName = "SMANU Student" }: { userName?: string }) {
  const [phase, setPhase] = useState<QuestPhase>("widget");
  const [selectedDomain, setSelectedDomain] = useState<string>(ALL_DOMAINS_LABEL);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  const domains = getDomains(QUESTION_BANK);
  const current = questions[currentIdx];
  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const achievement = getAchievement(correctCount, questions.length);
  const isMaster = correctCount === questions.length && questions.length > 0;

  const completedDate = useRef(
    new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  );

  function startQuest() {
    const picked = pickQuestions(QUESTION_BANK, selectedDomain, QUEST_QUESTION_COUNT);
    setQuestions(picked); setAnswers({}); setCurrentIdx(0); setShowValidation(false); setPhase("quiz");
  }

  function selectAnswer(option: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
    setShowValidation(false);
  }

  function goNext() {
    if (!current) return;
    if (!answers[current.id]) { setShowValidation(true); return; }
    if (currentIdx < questions.length - 1) { setCurrentIdx((i) => i + 1); setShowValidation(false); }
  }

  function goBack() {
    if (currentIdx > 0) { setCurrentIdx((i) => i - 1); setShowValidation(false); }
  }

  function submitQuest() {
    if (!current) return;
    if (!answers[current.id]) { setShowValidation(true); return; }
    if (questions.some((q) => !answers[q.id])) { setShowValidation(true); return; }
    completedDate.current = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    setPhase("result");
  }

  const handleDownload = useCallback(() => {
    downloadCertificate({ userName, score: correctCount, total: questions.length, achievement: achievement.title, date: completedDate.current });
  }, [userName, correctCount, questions.length, achievement.title]);

  function reset() { setPhase("widget"); setQuestions([]); setAnswers({}); }

  // ── 1. Widget ─────────────────────────────────────────────────────────────
  if (phase === "widget") {
    return (
      <button
        onClick={() => setPhase("domain")}
        className="group w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#006c49] hover:bg-[#005236] text-white font-semibold text-sm shadow-lg shadow-[#006c49]/30 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">quiz</span>
          </span>
          <div className="text-left">
            <p className="font-bold leading-tight">Kerjakan Quest</p>
            <p className="text-xs text-white/70 font-normal">{QUEST_QUESTION_COUNT} soal · Est. 5–7 menit</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
    );
  }

  // ── 2. Domain picker ──────────────────────────────────────────────────────
  if (phase === "domain") {
    return (
      <DarkPanel title="Nutrition Quest" subtitle="Pilih domain soal" onBack={() => setPhase("widget")}>
        <p className="text-sm text-slate-300 mb-4">
          Pilih domain topik yang ingin kamu uji, atau pilih <strong className="text-white">Semua Domain</strong> untuk soal acak dari seluruh kategori.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={clsx(
                "px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-all",
                selectedDomain === d
                  ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm shadow-emerald-500/10"
                  : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white"
              )}
            >
              {d === ALL_DOMAINS_LABEL ? <span>🌐 {d}</span> : d}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700 text-xs text-slate-400 mb-4">
          <span>Domain: <strong className="text-white">{selectedDomain}</strong></span>
          <span>{QUEST_QUESTION_COUNT} soal</span>
        </div>
        <button
          onClick={startQuest}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-sm font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all"
        >
          Mulai Quest →
        </button>
      </DarkPanel>
    );
  }

  // ── 3. Quiz ───────────────────────────────────────────────────────────────
  if (phase === "quiz" && current) {
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const chosen = answers[current.id];
    const isLast = currentIdx === questions.length - 1;

    return (
      <DarkPanel
        title="NutriQuest"
        subtitle={`Domain: ${selectedDomain}`}
        onBack={() => setPhase("domain")}
        badge="Live"
      >
        {/* Progress */}
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex items-center justify-between text-slate-300 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-100">Pertanyaan {currentIdx + 1}</span>
              <span className="text-slate-400">dari {questions.length}</span>
            </div>
            <span className="font-bold text-emerald-400">{Math.round(progress)}% Selesai</span>
          </div>
          <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Domain badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold mb-4">
          <span className="material-symbols-outlined text-[14px]">water_drop</span>
          {current.domain}
        </div>

        {/* Question */}
        <h2 className="text-lg font-bold text-white leading-snug tracking-tight mb-1">
          {current.question}
        </h2>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Pilih satu jawaban yang paling tepat berdasarkan pedoman gizi seimbang.
        </p>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-5">
          {current.options.map((opt, i) => {
            const sel = chosen === opt;
            return (
              <button
                key={opt}
                onClick={() => selectAnswer(opt)}
                className={clsx(
                  "text-left p-4 rounded-xl flex items-center justify-between transition-all",
                  sel
                    ? "bg-emerald-950/50 text-white shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900/60 hover:bg-slate-800/60 text-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                    sel ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                  )}>
                    {LABELS[i]}
                  </span>
                  <div className="flex flex-col">
                    <span className={clsx("text-sm font-medium", sel && "font-semibold text-white")}>{opt}</span>
                    {sel && <span className="text-emerald-300 text-[11px]">Jawaban dipilih</span>}
                  </div>
                </div>
                {sel ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/30">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </div>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-slate-800 block" />
                )}
              </button>
            );
          })}
        </div>

        {/* Validation */}
        {showValidation && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-950/50 border border-rose-500/30 rounded-lg text-xs text-rose-300 font-medium mb-4">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Pilih salah satu jawaban terlebih dahulu.
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl gap-3">
          <button
            onClick={goBack}
            disabled={currentIdx === 0}
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
          <button
            onClick={isLast ? submitQuest : goNext}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            {isLast ? (
              <><span>Kumpulkan Jawaban</span><span className="material-symbols-outlined text-[18px]">task_alt</span></>
            ) : (
              <><span>Berikutnya</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            )}
          </button>
        </div>

        {/* Question navigator matrix */}
        <div className="mt-4 p-4 bg-slate-900/30 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Navigasi Soal</span>
            <span className="text-xs text-emerald-400 font-medium">
              {Object.keys(answers).length} terjawab · {questions.length - Object.keys(answers).length} menunggu
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => { setCurrentIdx(i); setShowValidation(false); }}
                className={clsx(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  i === currentIdx
                    ? "bg-emerald-500 text-slate-950 scale-110 shadow-lg shadow-emerald-400/40"
                    : answers[q.id]
                      ? "bg-emerald-950 text-emerald-400 hover:bg-emerald-900"
                      : "bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </DarkPanel>
    );
  }

  // ── 4. Result ──────────────────────────────────────────────────────────────
  if (phase === "result") {
    return (
      <DarkPanel title="NutriQuest Review" subtitle="Evaluasi Hasil & Kompetensi" badge="Quest Selesai 🎉">
        {/* Circular score ring */}
        <div className="flex flex-col items-center my-5">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" fill="transparent" r="54" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="60" cy="60" fill="transparent" r="54"
                stroke="#10b981"
                strokeDasharray="339.29"
                strokeDashoffset={339.29 - (339.29 * pct) / 100}
                strokeLinecap="round" strokeWidth="8"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Skor Kamu</span>
              <span className="text-5xl font-black text-white leading-none mt-1">{pct}%</span>
              <span className="text-emerald-400 text-lg font-bold mt-1">{correctCount} / {questions.length}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 bg-slate-900/80 px-4 py-1.5 rounded-full">
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {correctCount} benar
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1 text-rose-400 text-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              {questions.length - correctCount} salah
            </div>
          </div>
        </div>

        {/* Achievement card */}
        <div className={clsx("flex items-center gap-4 p-4 rounded-2xl border mb-4", achievement.bg)}>
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="material-symbols-outlined text-[32px]">school</span>
          </div>
          <div>
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest", achievement.color)}>Achievement Unlocked</span>
            <h3 className={clsx("text-xl font-black tracking-tight", achievement.color)}>{achievement.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {pct}% akurasi dalam {questions.length} pertanyaan.
            </p>
          </div>
        </div>

        {/* Certificate for perfect score */}
        {isMaster && (
          <div className="flex flex-col items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
            <span className="text-2xl">🏆</span>
            <p className="text-sm font-bold text-amber-300 text-center">Skor sempurna! Unduh sertifikatmu.</p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Unduh Sertifikat
            </button>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setReviewIdx(0); setPhase("review"); }}
            className="w-full py-3 rounded-xl bg-transparent hover:bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            Lihat Pembahasan Lengkap
          </button>
          <button
            onClick={reset}
            className="w-full py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke My Context
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[13px]">verified_user</span>
            Terverifikasi Kurikulum Nutrisi Nasional SMANU v1.0
          </span>
        </div>
      </DarkPanel>
    );
  }

  // ── 5. Review ──────────────────────────────────────────────────────────────
  if (phase === "review") {
    const reviewQ = questions[reviewIdx];
    const userAnswer = answers[reviewQ.id];
    const isCorrect = userAnswer === reviewQ.correctAnswer;

    return (
      <DarkPanel
        title="Pembahasan"
        subtitle={`${reviewIdx + 1} / ${questions.length}`}
        onBack={() => setPhase("result")}
      >
        {/* Nav dots */}
        <div className="flex flex-wrap gap-1.5 mb-5 justify-center">
          {questions.map((q, i) => {
            const ok = answers[q.id] === q.correctAnswer;
            return (
              <button
                key={q.id}
                onClick={() => setReviewIdx(i)}
                className={clsx(
                  "w-7 h-7 rounded-lg text-[10px] font-bold border transition-all",
                  i === reviewIdx ? "ring-2 ring-white/40 ring-offset-1 ring-offset-[#0d1527]" : "",
                  ok ? "bg-emerald-950 text-emerald-400 border-emerald-700" : "bg-rose-950 text-rose-400 border-rose-700"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Status */}
        <div className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold mb-3 border",
          isCorrect ? "bg-emerald-950/50 text-emerald-300 border-emerald-700" : "bg-rose-950/50 text-rose-300 border-rose-700"
        )}>
          {isCorrect ? "✓ Jawaban kamu benar" : "✕ Jawaban kamu kurang tepat"}
        </div>

        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold mb-2">
          {reviewQ.domain}
        </span>
        <p className="text-sm font-bold text-white leading-relaxed mb-4">{reviewQ.question}</p>

        {/* Options */}
        <div className="flex flex-col gap-2 mb-4">
          {reviewQ.options.map((opt) => {
            const isRight = opt === reviewQ.correctAnswer;
            const isUserPick = opt === userAnswer;
            return (
              <div
                key={opt}
                className={clsx(
                  "flex items-start gap-2 px-3 py-2.5 rounded-lg border text-sm",
                  isRight ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-200"
                    : isUserPick ? "border-rose-500/50 bg-rose-950/40 text-rose-300 line-through"
                      : "border-slate-700 bg-slate-900/40 text-slate-500"
                )}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {isRight ? "✓" : isUserPick ? "✕" : "·"}
                </span>
                <span className="flex-1">{opt}</span>
                {isRight && <span className="text-[10px] font-bold text-emerald-400 flex-shrink-0">Benar</span>}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-xs text-slate-300 leading-relaxed mb-4">
          <p className="font-semibold text-white mb-1">Penjelasan:</p>
          <p>{reviewQ.explanation}</p>
        </div>

        {/* Nav */}
        <div className="flex gap-2">
          {reviewIdx > 0 && (
            <button onClick={() => setReviewIdx((i) => i - 1)}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">
              ← Sebelumnya
            </button>
          )}
          {reviewIdx < questions.length - 1 ? (
            <button onClick={() => setReviewIdx((i) => i + 1)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-sm font-black hover:from-emerald-400 hover:to-teal-400 transition-all">
              Berikutnya →
            </button>
          ) : (
            <button onClick={reset}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors">
              Kembali ke My Context
            </button>
          )}
        </div>
      </DarkPanel>
    );
  }

  return null;
}

// ── Dark panel shell ───────────────────────────────────────────────────────
function DarkPanel({
  title, subtitle, badge, onBack, children,
}: {
  title: string; subtitle?: string; badge?: string;
  onBack?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl">
      {/* Emerald → teal header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 px-5 py-4 flex items-center justify-between shadow-lg shadow-emerald-950/20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack}
              className="w-9 h-9 rounded-lg bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">{title}</span>
              {badge && (
                <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-emerald-100/70 text-xs">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Dark navy body */}
      <div className="bg-[#0d1527] p-5 md:p-6 overflow-y-auto max-h-[85vh] relative">
        {/* subtle watermark */}
        <svg className="absolute -right-16 -top-16 w-80 h-80 opacity-[0.025] text-emerald-400 pointer-events-none select-none" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="48" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" fill="none" r="32" stroke="currentColor" strokeWidth="2" />
          <path d="M50 10 Q75 50 50 90 Q25 50 50 10 Z" fill="currentColor" />
        </svg>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
