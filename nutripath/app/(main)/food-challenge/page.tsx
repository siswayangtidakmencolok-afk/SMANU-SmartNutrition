"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SCENARIOS,
  FOOD_OPTIONS,
  scoreChallengeSelection,
  Scenario,
  FoodOption,
  ChallengeScore,
} from "@/lib/food-challenge-data";
import { saveChallengeResult } from "@/lib/challenge-store";
import { PageHeader } from "@/components/ui/PageHeader";

// ── Phase type ─────────────────────────────────────────────────────────────
type Phase = "select-scenario" | "select-food" | "result";

const GROUP_LABEL: Record<FoodOption["foodGroup"], string> = {
  carbs: "Karbohidrat",
  protein: "Protein",
  vegetable: "Sayuran",
  fruit: "Buah",
  dairy: "Susu/Produk Susu",
  snack: "Camilan",
  beverage: "Minuman",
};

const GROUP_COLOR: Record<FoodOption["foodGroup"], string> = {
  carbs: "bg-amber-50 text-amber-700 border-amber-200",
  protein: "bg-blue-50 text-blue-700 border-blue-200",
  vegetable: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fruit: "bg-orange-50 text-orange-700 border-orange-200",
  dairy: "bg-purple-50 text-purple-700 border-purple-200",
  snack: "bg-rose-50 text-rose-700 border-rose-200",
  beverage: "bg-sky-50 text-sky-700 border-sky-200",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Pilihan Sangat Baik";
  if (score >= 60) return "Pilihan Cukup Baik";
  if (score >= 40) return "Perlu Perbaikan";
  return "Perlu Banyak Revisi";
}

// ── Scenario card ─────────────────────────────────────────────────────────
function ScenarioCard({ scenario, onSelect }: { scenario: Scenario; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left group p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{scenario.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
            {scenario.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{scenario.desc}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          Budget: Rp {scenario.rule.maxBudget.toLocaleString("id-ID")}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
          Pilih {scenario.rule.portionCount} item
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
        Mulai tantangan
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </div>
    </button>
  );
}

// ── Food selection step ───────────────────────────────────────────────────
function FoodSelectionStep({
  scenario,
  selected,
  onToggle,
  onSubmit,
  onBack,
}: {
  scenario: Scenario;
  selected: string[];
  onToggle: (id: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const totalPrice = selected
    .map((id) => FOOD_OPTIONS.find((f) => f.id === id)?.price ?? 0)
    .reduce((a, b) => a + b, 0);
  const overBudget = totalPrice > scenario.rule.maxBudget;
  const canSubmit = selected.length === scenario.rule.portionCount;

  // Group food options
  const groups = [...new Set(FOOD_OPTIONS.map((f) => f.foodGroup))];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors mt-0.5"
          aria-label="Kembali"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">{scenario.emoji}</span>
            <h2 className="font-bold text-slate-900 text-base">{scenario.title}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">{scenario.context}</p>
        </div>
      </div>

      {/* Budget tracker */}
      <div className={`flex items-center justify-between p-4 rounded-2xl border ${overBudget ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
        <div>
          <p className="text-xs font-semibold text-slate-600">Total Harga Simulasi</p>
          <p className={`text-xl font-black ${overBudget ? "text-rose-600" : "text-emerald-700"}`}>
            Rp {totalPrice.toLocaleString("id-ID")}
            <span className="text-sm font-medium text-slate-500 ml-1">
              / Rp {scenario.rule.maxBudget.toLocaleString("id-ID")}
            </span>
          </p>
          {overBudget && (
            <p className="text-xs text-rose-600 font-medium mt-0.5">Melebihi budget skenario</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-600">Dipilih</p>
          <p className={`text-xl font-black ${selected.length === scenario.rule.portionCount ? "text-emerald-700" : "text-slate-700"}`}>
            {selected.length} / {scenario.rule.portionCount}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-amber-500 shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" fillRule="evenodd" />
          </svg>
        </span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Simulasi Edukatif:</strong> Harga dan nilai gizi adalah estimasi untuk tujuan pembelajaran, bukan data pasar nyata.
        </p>
      </div>

      {/* Food list by group */}
      <div className="flex flex-col gap-4">
        {groups.map((group) => {
          const items = FOOD_OPTIONS.filter((f) => f.foodGroup === group);
          return (
            <div key={group}>
              <h4 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border mb-3 ${GROUP_COLOR[group]}`}>
                {GROUP_LABEL[group]}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((food) => {
                  const isSelected = selected.includes(food.id);
                  const canSelect = selected.length < scenario.rule.portionCount || isSelected;
                  return (
                    <button
                      key={food.id}
                      onClick={() => canSelect && onToggle(food.id)}
                      disabled={!canSelect}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : canSelect
                          ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                          : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                                </svg>
                              </span>
                            )}
                            <p className="text-xs font-semibold text-slate-900 truncate">{food.name}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{food.availabilityNote}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 shrink-0">
                          Rp {food.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {/* Nutrition mini */}
                      <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
                        <span>{food.calories !== null ? `${food.calories} kcal` : "Kal: —"}</span>
                        <span>{food.proteinG !== null ? `${food.proteinG}g protein` : "Protein: —"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-2xl bg-[#131b2e] text-white font-bold text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {canSubmit
          ? "Lihat Evaluasi Pilihan →"
          : `Pilih ${scenario.rule.portionCount - selected.length} item lagi`}
      </button>
    </div>
  );
}

// ── Result step ───────────────────────────────────────────────────────────
function ResultStep({
  scenario,
  selected,
  scoreResult,
  onReset,
  onComparator,
}: {
  scenario: Scenario;
  selected: string[];
  scoreResult: ChallengeScore;
  onReset: () => void;
  onComparator: () => void;
}) {
  const foods = selected.map((id) => FOOD_OPTIONS.find((f) => f.id === id)!).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {/* Score header */}
      <div className={`p-6 rounded-2xl border text-center ${scoreBg(scoreResult.score)}`}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Skor Keputusanmu</p>
        <p className={`text-5xl font-black mb-2 ${scoreColor(scoreResult.score)}`}>
          {scoreResult.score}
          <span className="text-2xl">/100</span>
        </p>
        <p className={`text-sm font-bold ${scoreColor(scoreResult.score)}`}>
          {scoreLabel(scoreResult.score)}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Skor mengukur kualitas keputusan berdasarkan tujuan skenario, bukan menghakimi pilihanmu.
        </p>
      </div>

      {/* Selected items */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Pilihan Kamu</h3>
        <div className="flex flex-col gap-2">
          {foods.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-900">{f.name}</p>
                <p className="text-[10px] text-slate-400">
                  {f.calories !== null ? `${f.calories} kcal` : "Kal: —"}
                  {" · "}
                  {f.proteinG !== null ? `${f.proteinG}g protein` : "Protein: —"}
                </p>
              </div>
              <span className="text-sm font-bold text-emerald-700">Rp {f.price.toLocaleString("id-ID")}</span>
            </div>
          ))}
          <div className="flex justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Total (simulasi)</span>
            <span className={`text-xs font-black ${scoreResult.withinBudget ? "text-emerald-700" : "text-rose-600"}`}>
              Rp {scoreResult.totalPrice.toLocaleString("id-ID")}
              {!scoreResult.withinBudget && " ⚠️"}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evaluasi Edukatif</h3>
        {scoreResult.feedback.map((msg, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-slate-200">
            <span className="text-emerald-500 shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
              </svg>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">{msg}</p>
          </div>
        ))}
      </div>

      {/* Alternatives */}
      {scoreResult.alternatives.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pertimbangan Alternatif</h3>
          {scoreResult.alternatives.map((alt, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-blue-500 shrink-0">💡</span>
              <p className="text-xs text-blue-800 leading-relaxed">{alt}</p>
            </div>
          ))}
        </div>
      )}

      {/* Related knowledge */}
      {scenario.relatedKnowledgeIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-emerald-200">
          <p className="text-xs font-bold text-emerald-800 mb-2">📚 Pelajari lebih lanjut:</p>
          <div className="flex flex-wrap gap-2">
            {scenario.relatedKnowledgeIds.map((kid) => (
              <Link
                key={kid}
                href={`/nutrition-knowledge/${kid}`}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 transition-colors"
              >
                {kid.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Data disclaimer */}
      {!scoreResult.dataComplete && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-500 shrink-0">⚠️</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            Data gizi tidak lengkap untuk beberapa pilihan. Evaluasi nutrisi dilakukan sebagian.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl border-2 border-[#131b2e] text-[#131b2e] font-bold text-sm hover:bg-slate-50 transition-colors"
        >
          Coba Skenario Lain
        </button>
        <button
          onClick={onComparator}
          className="flex-1 py-3 rounded-xl bg-[#131b2e] text-white font-bold text-sm hover:bg-slate-700 transition-colors"
        >
          Bandingkan Makanan →
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function FoodChallengePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select-scenario");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [scoreResult, setScoreResult] = useState<ChallengeScore | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSelectScenario(scenario: Scenario) {
    setActiveScenario(scenario);
    setSelectedFoodIds([]);
    setScoreResult(null);
    setSaved(false);
    setPhase("select-food");
  }

  function handleToggleFood(id: string) {
    setSelectedFoodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!activeScenario) return;
    const result = scoreChallengeSelection(selectedFoodIds, activeScenario);
    setScoreResult(result);
    setPhase("result");

    // Persist result
    if (!saved) {
      setSaved(true);
      saveChallengeResult({
        id: crypto.randomUUID(),
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        score: result.score,
        withinBudget: result.withinBudget,
        totalPrice: result.totalPrice,
        selectedFoodIds,
        timestamp: Date.now(),
        relatedDomains: activeScenario.relatedDomains,
        relatedKnowledgeIds: activeScenario.relatedKnowledgeIds,
      });
    }
  }

  function handleReset() {
    setPhase("select-scenario");
    setActiveScenario(null);
    setSelectedFoodIds([]);
    setScoreResult(null);
    setSaved(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header — only shown in scenario select */}
      {phase === "select-scenario" && (
        <div className="mb-6">
          <PageHeader
            badge="Simulasi Edukatif"
            title="Food Challenge"
            subtitle="Simulasi pengambilan keputusan makanan dalam skenario sehari-hari. Harga dan nilai gizi adalah estimasi edukatif."
          />
        </div>
      )}

      {phase === "select-scenario" && (
        <div className="flex flex-col gap-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-[#f0fdf4] border border-emerald-200 rounded-2xl">
            <span className="text-emerald-600 shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Cara bermain</p>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Pilih skenario, lalu tentukan kombinasi makanan sesuai aturan. Sistem menghitung skor berdasarkan budget, kelengkapan gizi, dan tujuan skenario.
              </p>
            </div>
          </div>

          {/* Scenario grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCENARIOS.map((s) => (
              <ScenarioCard key={s.id} scenario={s} onSelect={() => handleSelectScenario(s)} />
            ))}
          </div>

          {/* Link to comparator */}
          <div className="flex justify-center pt-2">
            <Link
              href="/food-challenge/comparator"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">compare</span>
              Langsung ke Smart Food Comparator
            </Link>
          </div>
        </div>
      )}

      {phase === "select-food" && activeScenario && (
        <FoodSelectionStep
          scenario={activeScenario}
          selected={selectedFoodIds}
          onToggle={handleToggleFood}
          onSubmit={handleSubmit}
          onBack={handleReset}
        />
      )}

      {phase === "result" && activeScenario && scoreResult && (
        <ResultStep
          scenario={activeScenario}
          selected={selectedFoodIds}
          scoreResult={scoreResult}
          onReset={handleReset}
          onComparator={() => router.push("/food-challenge/comparator")}
        />
      )}
    </div>
  );
}
