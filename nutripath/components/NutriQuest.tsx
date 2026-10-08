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
    return { title: "Nutrition Master", emoji: "🏆", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  if (pct >= 86)
    return { title: "Nutrition Scholar", emoji: "🎓", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
  if (pct >= 73)
    return { title: "Nutrition Explorer", emoji: "🌿", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" };
  return { title: "Nutrition Starter", emoji: "🌱", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
}

// ── Certificate download via canvas ───────────────────────────────────────
function downloadCertificate(params: {
  userName: string;
  score: number;
  total: number;
  achievement: string;
  date: string;
}) {
  const { userName, score, total, achievement, date } = params;
  const pct = Math.round((score / total) * 100);

  const W = 1280;
  const H = 880;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // Inner border (light)
  ctx.strokeStyle = "#D1FAE5";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Corner accents
  const corners = [
    [52, 52], [W - 52, 52], [52, H - 52], [W - 52, H - 52],
  ] as [number, number][];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // SMANU brand header
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 36px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SMANU", W / 2, 120);

  ctx.fillStyle = "#10B981";
  ctx.font = "600 15px 'Inter', sans-serif";
  ctx.letterSpacing = "0.1em";
  ctx.fillText("SMARTNUTRITION FOR STUDENTS", W / 2, 148);

  // Pill: Student Nutrition Quest
  ctx.fillStyle = "#ECFDF5";
  roundRect(ctx, W / 2 - 110, 158, 220, 28, 14);
  ctx.fill();
  ctx.fillStyle = "#059669";
  ctx.font = "600 12px 'Inter', sans-serif";
  ctx.fillText("STUDENT NUTRITION QUEST", W / 2, 177);

  // NUTRIQUEST title
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 72px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("NUTRIQUEST", W / 2, 276);

  // ACHIEVEMENT AWARD
  ctx.fillStyle = "#10B981";
  ctx.font = "600 18px 'Inter', sans-serif";
  ctx.fillText("A C H I E V E M E N T   A W A R D", W / 2, 308);

  // Divider line
  ctx.strokeStyle = "#D1D5DB";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, 326);
  ctx.lineTo(W / 2 + 200, 326);
  ctx.stroke();

  // AWARDED TO
  ctx.fillStyle = "#6B7280";
  ctx.font = "500 14px 'Inter', sans-serif";
  ctx.fillText("AWARDED TO", W / 2, 360);

  // User name
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 54px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(userName || "SMANU Student", W / 2, 430);

  // Description
  ctx.fillStyle = "#374151";
  ctx.font = "400 17px 'Inter', sans-serif";
  ctx.fillText(
    "For successfully completing the SMANU Nutrition Quest and demonstrating",
    W / 2,
    474
  );
  ctx.fillText("practical mastery of evidence-based student dietary fundamentals.", W / 2, 496);

  // Three info boxes
  const boxY = 540;
  const boxH = 100;

  // Box 1: Achievement
  drawInfoBox(ctx, 160, boxY, 260, boxH, "#F0FDF4", "#BBF7D0");
  ctx.fillStyle = "#6B7280";
  ctx.font = "600 11px 'Inter', sans-serif";
  ctx.fillText("ACHIEVEMENT", 290, boxY + 28);
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(achievement, 290, boxY + 62);
  // Star icon (text)
  ctx.fillStyle = "#FBBF24";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("★", 290 + ctx.measureText(achievement).width / 2 + 16, boxY + 64);

  // Box 2: SMANU badge (circle)
  ctx.fillStyle = "#0F172A";
  ctx.beginPath();
  ctx.arc(W / 2, boxY + boxH / 2, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#10B981";
  ctx.beginPath();
  ctx.arc(W / 2, boxY + boxH / 2, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`${pct}%`, W / 2, boxY + boxH / 2 + 8);
  ctx.font = "600 10px 'Inter', sans-serif";
  ctx.fillText("VERIFIED", W / 2, boxY + boxH / 2 + 26);

  // Box 3: Quest Score
  drawInfoBox(ctx, W - 420, boxY, 260, boxH, "#F0FDF4", "#BBF7D0");
  ctx.fillStyle = "#6B7280";
  ctx.font = "600 11px 'Inter', sans-serif";
  ctx.fillText("QUEST SCORE", W - 290, boxY + 28);
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`${score} / ${total}`, W - 290, boxY + 62);
  ctx.fillStyle = "#10B981";
  ctx.font = "600 14px 'Inter', sans-serif";
  ctx.fillText(`${pct}%  ✓`, W - 290, boxY + 82);

  // Footer
  ctx.fillStyle = "#6B7280";
  ctx.font = "500 13px 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("DATE COMPLETED", 80, H - 140);
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(date, 80, H - 118);
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "400 11px 'Inter', sans-serif";
  ctx.fillText(`Quest ID: NQ-${Date.now().toString(36).toUpperCase()}`, 80, H - 96);

  // Center footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#6B7280";
  ctx.font = "500 12px 'Inter', sans-serif";
  ctx.fillText("Student Internal Learning Achievement • SMANU Educational Platform", W / 2, H - 132);
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "400 10px 'Inter', sans-serif";
  ctx.fillText("Self-paced nutrition curriculum for collegiate & high school nutrition literacy", W / 2, H - 112);

  // Right footer: SMANU Education Team
  ctx.textAlign = "right";
  // Wavy signature line
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x <= 80; x += 4) {
    const y = H - 140 + Math.sin(x * 0.3) * 4;
    x === 0 ? ctx.moveTo(W - 200 + x, y) : ctx.lineTo(W - 200 + x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("SMANU Education Team", W - 80, H - 118);
  ctx.fillStyle = "#6B7280";
  ctx.font = "500 12px 'Inter', sans-serif";
  ctx.fillText("SmartNutrition for Students", W - 80, H - 100);

  // Download
  const link = document.createElement("a");
  link.download = `SMANU_NutriQuest_Certificate_${userName.replace(/\s+/g, "_")}.png`;
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawInfoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string
) {
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
}

// ── Types ──────────────────────────────────────────────────────────────────
type QuestPhase =
  | "widget"       // card di My Context
  | "domain"       // pilih domain
  | "quiz"         // kerjakan soal
  | "result"       // lihat skor
  | "review";      // lihat pembahasan

// ── Main component ─────────────────────────────────────────────────────────
export function NutriQuest({ userName = "SMANU Student" }: { userName?: string }) {
  const [phase, setPhase] = useState<QuestPhase>("widget");
  const [selectedDomain, setSelectedDomain] = useState<string>(ALL_DOMAINS_LABEL);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // id → chosen
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  const domains = getDomains(QUESTION_BANK);
  const total = questions.length || QUEST_QUESTION_COUNT;
  const current = questions[currentIdx];

  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const achievement = getAchievement(correctCount, questions.length);
  const isMaster = correctCount === questions.length && questions.length > 0;

  const completedDate = useRef(
    new Date().toLocaleDateString("id-ID", {
      day: "long", month: "long", year: "numeric",
    })
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  function startQuest() {
    const picked = pickQuestions(QUESTION_BANK, selectedDomain, QUEST_QUESTION_COUNT);
    setQuestions(picked);
    setAnswers({});
    setCurrentIdx(0);
    setShowValidation(false);
    setPhase("quiz");
  }

  function selectAnswer(option: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
    setShowValidation(false);
  }

  function goNext() {
    if (!current) return;
    if (!answers[current.id]) {
      setShowValidation(true);
      return;
    }
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setShowValidation(false);
    }
  }

  function goBack() {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setShowValidation(false);
    }
  }

  function submitQuest() {
    if (!current) return;
    if (!answers[current.id]) {
      setShowValidation(true);
      return;
    }
    // Check all answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setShowValidation(true);
      return;
    }
    completedDate.current = new Date().toLocaleDateString("id-ID", {
      day: "long", month: "long", year: "numeric",
    });
    setPhase("result");
  }

  const handleDownload = useCallback(() => {
    downloadCertificate({
      userName,
      score: correctCount,
      total: questions.length,
      achievement: achievement.title,
      date: completedDate.current,
    });
  }, [userName, correctCount, questions.length, achievement.title]);

  // ── RENDER ─────────────────────────────────────────────────────────────────

  // 1. Widget card (shown inside My Context)
  if (phase === "widget") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">NutriQuest</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  QUIZ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Uji wawasanmu tentang makanan dan nutrisi.
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed">
          Jawab {QUEST_QUESTION_COUNT} pertanyaan dan lihat seberapa baik pemahamanmu tentang nutrisi sehari-hari. Pilih domain topik yang ingin kamu uji.
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" fillRule="evenodd" />
            </svg>
            {QUEST_QUESTION_COUNT} soal
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            9 domain
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
            </svg>
            Sertifikat untuk nilai sempurna
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => setPhase("domain")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          Kerjakan Quest
        </button>
      </div>
    );
  }

  // 2. Domain selection
  if (phase === "domain") {
    return (
      <QuestShell title="Nutrition Quest" onBack={() => setPhase("widget")}>
        <p className="text-sm text-slate-600 mb-5">
          Pilih domain topik yang ingin kamu uji. Pilih &ldquo;Semua Domain&rdquo; untuk soal dari seluruh kategori.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={clsx(
                "px-3 py-3 rounded-xl text-xs font-semibold text-left border transition-all",
                selectedDomain === d
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
              )}
            >
              {d === ALL_DOMAINS_LABEL ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🌐</span> {d}
                </span>
              ) : (
                <span>{d}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-5">
          <span>
            Domain dipilih: <strong className="text-slate-900">{selectedDomain}</strong>
          </span>
          <span>
            {QUEST_QUESTION_COUNT} soal
          </span>
        </div>

        <button
          onClick={startQuest}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Mulai Quest →
        </button>
      </QuestShell>
    );
  }

  // 3. Quiz
  if (phase === "quiz" && current) {
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const chosen = answers[current.id];
    const isLast = currentIdx === questions.length - 1;
    const labels = ["A", "B", "C", "D"];

    return (
      <QuestShell
        title="NutriQuest"
        subtitle={`Domain: ${selectedDomain}`}
        onBack={() => setPhase("domain")}
      >
        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700">
              Pertanyaan {currentIdx + 1} dari {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Domain badge */}
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 mb-3">
          {current.domain}
        </span>

        {/* Question */}
        <p className="text-sm font-semibold text-slate-900 leading-relaxed mb-4">
          {current.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2.5 mb-5">
          {current.options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => selectAnswer(opt)}
              className={clsx(
                "w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all",
                chosen === opt
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30"
              )}
            >
              <span
                className={clsx(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 transition-colors",
                  chosen === opt
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {labels[i]}
              </span>
              <span className="flex-1 leading-relaxed">{opt}</span>
            </button>
          ))}
        </div>

        {/* Validation */}
        {showValidation && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium mb-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
            </svg>
            Pilih salah satu jawaban terlebih dahulu.
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {currentIdx > 0 && (
            <button
              onClick={goBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              ← Kembali
            </button>
          )}
          <button
            onClick={isLast ? submitQuest : goNext}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {isLast ? "Kumpulkan Jawaban ✓" : "Berikutnya →"}
          </button>
        </div>

        {/* Quick nav dots */}
        <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => { setCurrentIdx(i); setShowValidation(false); }}
              title={`Soal ${i + 1}`}
              className={clsx(
                "w-6 h-6 rounded-full text-[10px] font-bold transition-all border",
                i === currentIdx
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : answers[q.id]
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : "bg-slate-100 text-slate-400 border-slate-200"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </QuestShell>
    );
  }

  // 4. Result
  if (phase === "result") {
    return (
      <QuestShell title="Quest Selesai! 🎉">
        {/* Score card */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-500 flex flex-col items-center justify-center mb-4 shadow-md">
            <span className="text-2xl font-black text-emerald-700">{pct}%</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">Skor Kamu</h3>
          <p className="text-3xl font-black text-emerald-600">{correctCount} / {questions.length}</p>
          <p className="text-xs text-slate-500 mt-1">
            {correctCount} benar · {questions.length - correctCount} salah
          </p>
        </div>

        {/* Achievement */}
        <div className={clsx(
          "flex items-center gap-3 p-4 rounded-xl border mb-4",
          achievement.bg
        )}>
          <span className="text-3xl">{achievement.emoji}</span>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Achievement</p>
            <p className={clsx("text-lg font-black", achievement.color)}>
              {achievement.title}
            </p>
          </div>
        </div>

        {/* Certificate (only for perfect score) */}
        {isMaster && (
          <div className="flex flex-col items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
            <span className="text-2xl">🏆</span>
            <p className="text-sm font-bold text-amber-800 text-center">
              Selamat! Kamu mendapatkan skor sempurna.
            </p>
            <p className="text-xs text-amber-600 text-center">
              Unduh sertifikat NutriQuest Achievement kamu di bawah ini.
            </p>
            <button
              onClick={handleDownload}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Unduh Sertifikat
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setPhase("review")}
            className="w-full py-2.5 rounded-xl border border-emerald-500 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            Lihat Pembahasan
          </button>
          <button
            onClick={() => { setPhase("widget"); setQuestions([]); setAnswers({}); }}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Kembali ke My Context
          </button>
        </div>
      </QuestShell>
    );
  }

  // 5. Review / Pembahasan
  if (phase === "review") {
    const reviewQ = questions[reviewIdx];
    const userAnswer = answers[reviewQ.id];
    const isCorrect = userAnswer === reviewQ.correctAnswer;

    return (
      <QuestShell
        title="Pembahasan"
        subtitle={`${reviewIdx + 1} / ${questions.length}`}
        onBack={() => setPhase("result")}
      >
        {/* Nav dots */}
        <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
          {questions.map((q, i) => {
            const ok = answers[q.id] === q.correctAnswer;
            return (
              <button
                key={q.id}
                onClick={() => setReviewIdx(i)}
                className={clsx(
                  "w-6 h-6 rounded-full text-[10px] font-bold border transition-all",
                  i === reviewIdx
                    ? "ring-2 ring-offset-1 ring-slate-400"
                    : "",
                  ok
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : "bg-rose-100 text-rose-700 border-rose-300"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Status badge */}
        <div className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold mb-3",
          isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
        )}>
          {isCorrect ? "✓ Jawaban kamu benar" : "✕ Jawaban kamu kurang tepat"}
        </div>

        {/* Domain */}
        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold mb-2">
          {reviewQ.domain}
        </span>

        {/* Question */}
        <p className="text-sm font-semibold text-slate-900 leading-relaxed mb-4">
          {reviewQ.question}
        </p>

        {/* Options with correct/wrong highlight */}
        <div className="flex flex-col gap-2 mb-4">
          {reviewQ.options.map((opt) => {
            const isRight = opt === reviewQ.correctAnswer;
            const isUserPick = opt === userAnswer;
            return (
              <div
                key={opt}
                className={clsx(
                  "flex items-start gap-2 px-3 py-2.5 rounded-lg border text-sm",
                  isRight
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                    : isUserPick && !isRight
                      ? "border-rose-400 bg-rose-50 text-rose-800 line-through"
                      : "border-slate-100 bg-white text-slate-600"
                )}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {isRight ? "✓" : isUserPick ? "✕" : "·"}
                </span>
                <span className="flex-1">{opt}</span>
                {isRight && (
                  <span className="text-[10px] font-bold text-emerald-600 flex-shrink-0">Benar</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed mb-4">
          <p className="font-semibold text-slate-900 mb-1">Penjelasan:</p>
          <p>{reviewQ.explanation}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          {reviewIdx > 0 && (
            <button
              onClick={() => setReviewIdx((i) => i - 1)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              ← Sebelumnya
            </button>
          )}
          {reviewIdx < questions.length - 1 ? (
            <button
              onClick={() => setReviewIdx((i) => i + 1)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              Berikutnya →
            </button>
          ) : (
            <button
              onClick={() => { setPhase("widget"); setQuestions([]); setAnswers({}); }}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Kembali ke My Context
            </button>
          )}
        </div>
      </QuestShell>
    );
  }

  return null;
}

// ── Shell wrapper ──────────────────────────────────────────────────────────
function QuestShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="bg-emerald-600 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
          )}
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-emerald-200 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path clipRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" fillRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto max-h-[80vh]">{children}</div>
    </div>
  );
}
