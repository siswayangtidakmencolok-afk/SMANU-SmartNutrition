"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SCENARIOS,
  FOOD_OPTIONS,
  scoreChallengeSelection,
  searchFoodOptions,
  FOOD_KB_LINKS,
  Scenario,
  FoodOption,
  ChallengeScore,
} from "@/lib/food-challenge-data";
import { saveChallengeResult } from "@/lib/challenge-store";

// ── Types ──────────────────────────────────────────────────────────────────
type Tab = "simulation" | "evaluation" | "comparator";
type FoodFilter = "all" | FoodOption["foodGroup"];

// ── Constants ──────────────────────────────────────────────────────────────
const GROUP_LABEL: Record<FoodOption["foodGroup"], string> = {
  carbs:     "Karbohidrat",
  protein:   "Protein",
  vegetable: "Sayuran",
  fruit:     "Buah",
  dairy:     "Susu / Produk Susu",
  snack:     "Camilan",
  beverage:  "Minuman",
};

const GROUP_BADGE: Record<FoodOption["foodGroup"], string> = {
  carbs:     "bg-amber-100 text-amber-800",
  protein:   "bg-blue-100 text-blue-800",
  vegetable: "bg-emerald-100 text-emerald-800",
  fruit:     "bg-orange-100 text-orange-800",
  dairy:     "bg-purple-100 text-purple-800",
  snack:     "bg-rose-100 text-rose-800",
  beverage:  "bg-sky-100 text-sky-800",
};

const FILTER_OPTIONS: { id: FoodFilter; label: string }[] = [
  { id: "all",       label: "Semua" },
  { id: "carbs",     label: "Pokok" },
  { id: "protein",   label: "Lauk" },
  { id: "vegetable", label: "Sayuran" },
  { id: "fruit",     label: "Buah" },
  { id: "beverage",  label: "Minuman" },
  { id: "snack",     label: "Camilan" },
];

// Inline SVG icons for scenario cards — renders immediately on Android
// without waiting for Google Fonts CDN.
const SCENARIO_SVG: Record<string, React.ReactNode> = {
  "school-day-budget": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "exam-week-focus": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  "sport-activity": (
    // Soccer ball / sports icon — the one the user specifically mentioned as missing
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3l2.5 5-2.5 1.5L9.5 8 12 3zm0 18l-2.5-5 2.5-1.5 2.5 1.5L12 21zM3 12l5-2.5L9.5 12 8 14.5 3 12zm18 0l-5 2.5L14.5 12 16 9.5 21 12z" />
    </svg>
  ),
  "busy-dorm-morning": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  ),
};

const SCENARIO_SVG_FALLBACK = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 80) return "text-emerald-600";
  if (s >= 60) return "text-amber-500";
  return "text-rose-500";
}

function scoreBgRing(s: number) {
  if (s >= 80) return "stroke-emerald-500";
  if (s >= 60) return "stroke-amber-400";
  return "stroke-rose-400";
}

function scoreLabel(s: number) {
  if (s >= 80) return "Keputusan Sangat Baik!";
  if (s >= 60) return "Pilihan Cukup Baik";
  if (s >= 40) return "Perlu Diperbaiki";
  return "Perlu Banyak Revisi";
}

// ── Slot config (4 compartments on the meal tray) ─────────────────────────
const TRAY_SLOTS = [
  { key: "carbs",     label: "¼ Karbo",  badge: "bg-amber-100 text-amber-800"    },
  { key: "protein",   label: "¼ Protein", badge: "bg-blue-100 text-blue-800"      },
  { key: "vegetable", label: "½ Serat",   badge: "bg-emerald-100 text-emerald-800"},
  { key: "beverage",  label: "Hidrasi",   badge: "bg-sky-100 text-sky-800"        },
];

// ── ScenarioCard ──────────────────────────────────────────────────────────
function ScenarioCard({
  scenario,
  isActive,
  onSelect,
}: {
  scenario: Scenario;
  isActive: boolean;
  onSelect: () => void;
}) {
  const iconSvg = SCENARIO_SVG[scenario.id] ?? SCENARIO_SVG_FALLBACK;
  return (
    <button
      onClick={onSelect}
      className={`group w-full text-left p-3 rounded-xl shadow-sm flex flex-col gap-2 transition-all duration-200 ${
        isActive
          ? "ring-2 ring-[#006c49] bg-gradient-to-b from-[#006c49]/5 to-transparent"
          : "bg-white hover:shadow-md border border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-[#6cf8bb] text-[#002113]" : "bg-slate-100 text-slate-500"}`}>
          {iconSvg}
        </div>
        {isActive ? (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#006c49] text-white whitespace-nowrap">Aktif</span>
        ) : (
          <span className="text-[11px]">{scenario.emoji}</span>
        )}
      </div>
      <h3 className={`text-[11px] font-bold leading-tight group-hover:text-[#006c49] transition-colors ${isActive ? "text-[#006c49]" : "text-slate-900"}`}>
        {scenario.title}
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-400 font-medium">Pagu</span>
        <span className={`text-[10px] font-bold ${isActive ? "text-[#006c49]" : "text-slate-700"}`}>
          Rp {(scenario.rule.maxBudget / 1000).toFixed(0)}rb
        </span>
      </div>
    </button>
  );
}

// ── TraySlot ──────────────────────────────────────────────────────────────
function TraySlot({
  group,
  food,
  onRemove,
}: {
  group: (typeof TRAY_SLOTS)[number];
  food: FoodOption | undefined;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col justify-between relative transition-all hover:shadow">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${group.badge}`}>
          {group.label}
        </span>
        {food && (
          <button
            onClick={() => onRemove(food.id)}
            className="text-slate-300 hover:text-rose-500 transition-colors"
            aria-label="Hapus"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {food ? (
        <>
          <div className="w-full h-20 rounded-lg bg-slate-100 flex items-center justify-center mb-2 overflow-hidden relative">
            <span className="material-symbols-outlined text-[32px] text-slate-300">
              {group.key === "carbs" ? "grain" : group.key === "protein" ? "egg" : group.key === "vegetable" ? "eco" : "water_drop"}
            </span>
            <div className="absolute bottom-1 right-1 bg-white/90 text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-bold">
              Rp {food.price.toLocaleString("id-ID")}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 truncate leading-tight">{food.name}</h4>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
              <span>{food.calories !== null ? `${food.calories} kkal` : "—"}</span>
              <span className="text-[#006c49] font-semibold">
                {food.proteinG !== null ? `${food.proteinG}g P` : food.carbsG !== null ? `${food.carbsG}g KH` : "—"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-20 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center mb-2 gap-1">
          <span className="material-symbols-outlined text-[22px] text-slate-200">add_circle</span>
          <span className="text-[9px] text-slate-300 font-medium">Pilih dari katalog</span>
        </div>
      )}
    </div>
  );
}

// ── FoodCatalogItem ───────────────────────────────────────────────────────
function FoodCatalogItem({
  food,
  isSelected,
  canSelect,
  onToggle,
}: {
  food: FoodOption;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: () => void;
}) {
  const hasWarning =
    food.id === "teh-manis" ||
    food.id === "mie-goreng-instan" ||
    (food.carbsG !== null && food.fatG !== null && food.carbsG + food.fatG > 60);

  return (
    <div
      className={`p-3 rounded-xl flex flex-col justify-between transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-[#006c49] bg-[#006c49]/5"
          : canSelect
          ? "bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer"
          : "bg-slate-50 opacity-40 cursor-not-allowed border border-transparent"
      }`}
      onClick={() => canSelect && onToggle()}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <span className="material-symbols-outlined text-[24px] text-slate-400">
            {food.foodGroup === "carbs" ? "grain" :
             food.foodGroup === "protein" ? "egg" :
             food.foodGroup === "vegetable" ? "eco" :
             food.foodGroup === "fruit" ? "nutrition" :
             food.foodGroup === "beverage" ? "water_drop" :
             food.foodGroup === "dairy" ? "local_drink" : "restaurant"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[9px] font-semibold uppercase ${hasWarning ? "text-rose-500" : "text-slate-400"}`}>
              {hasWarning ? "Perhatikan" : GROUP_LABEL[food.foodGroup]}
            </span>
            <span className="text-xs font-bold text-slate-800">Rp {food.price.toLocaleString("id-ID")}</span>
          </div>
          <h4 className="text-[12px] font-bold text-slate-900 truncate leading-tight mt-0.5">{food.name}</h4>
          <div className={`text-[10px] mt-0.5 ${hasWarning ? "text-rose-500 font-medium" : "text-slate-400"}`}>
            {food.calories !== null ? `${food.calories} kkal` : "—"}
            {food.proteinG !== null ? ` · ${food.proteinG}g protein` : ""}
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
        {isSelected ? (
          <>
            <span className="text-[10px] font-bold text-[#006c49] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Di Piring
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-500 hover:text-rose-500 font-semibold transition-colors border border-slate-200"
            >
              Lepas
            </button>
          </>
        ) : (
          <>
            <span className="text-[10px] text-slate-400">
              {food.availabilityNote.split(" ").slice(0, 3).join(" ")}
            </span>
            <button
              disabled={!canSelect}
              onClick={(e) => { e.stopPropagation(); if (canSelect) onToggle(); }}
              className={`text-[10px] px-2.5 py-1 rounded font-semibold transition-colors ${
                canSelect
                  ? "bg-[#131b2e] text-white hover:bg-slate-700"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
            >
              + Pilih
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Score Circle SVG ──────────────────────────────────────────────────────
function ScoreCircle({ score }: { score: number }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="transparent" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="transparent"
          className={scoreBgRing(score)}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Skor</span>
        <span className={`text-3xl font-black ${scoreColor(score)}`}>{score}</span>
        <span className="text-[10px] text-slate-400 font-semibold">/100</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function FoodChallengePage() {
  const router = useRouter();

  // ── State ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("simulation");
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [scoreResult, setScoreResult] = useState<ChallengeScore | null>(null);
  const [saved, setSaved] = useState(false);
  const [foodFilter, setFoodFilter] = useState<FoodFilter>("all");
  const [foodSearch, setFoodSearch] = useState("");
  const [priceAnim, setPriceAnim] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────
  const totalPrice = useMemo(
    () => selectedFoodIds.reduce((sum, id) => sum + (FOOD_OPTIONS.find(f => f.id === id)?.price ?? 0), 0),
    [selectedFoodIds]
  );
  const overBudget = totalPrice > activeScenario.rule.maxBudget;
  const budgetPct = Math.min(100, (totalPrice / activeScenario.rule.maxBudget) * 100);
  const canSubmit = selectedFoodIds.length >= 2;

  const totalCalories = useMemo(() =>
    selectedFoodIds.reduce((sum, id) => {
      const f = FOOD_OPTIONS.find(x => x.id === id);
      return sum + (f?.calories ?? 0);
    }, 0),
    [selectedFoodIds]
  );
  const totalProtein = useMemo(() =>
    selectedFoodIds.reduce((sum, id) => {
      const f = FOOD_OPTIONS.find(x => x.id === id);
      return sum + (f?.proteinG ?? 0);
    }, 0),
    [selectedFoodIds]
  );
  const totalCarbs = useMemo(() =>
    selectedFoodIds.reduce((sum, id) => {
      const f = FOOD_OPTIONS.find(x => x.id === id);
      return sum + (f?.carbsG ?? 0);
    }, 0),
    [selectedFoodIds]
  );

  // Slot assignment: first selected food per group
  const slotFoods = useMemo(() => {
    const result: Record<string, FoodOption | undefined> = {};
    for (const slot of TRAY_SLOTS) {
      result[slot.key] = FOOD_OPTIONS.find(
        f => f.foodGroup === slot.key && selectedFoodIds.includes(f.id)
      );
    }
    return result;
  }, [selectedFoodIds]);

  const filledSlots = TRAY_SLOTS.filter(s => slotFoods[s.key]).length;

  const filteredFoods = useMemo(() => {
    const base = foodFilter === "all" ? FOOD_OPTIONS : FOOD_OPTIONS.filter(f => f.foodGroup === foodFilter);
    if (!foodSearch.trim()) return base;
    return searchFoodOptions(foodSearch).filter(f => foodFilter === "all" || f.foodGroup === foodFilter);
  }, [foodFilter, foodSearch]);

  // ── Handlers ─────────────────────────────────────────────────────────
  function handleToggleFood(id: string) {
    setPriceAnim(true);
    setTimeout(() => setPriceAnim(false), 300);
    setSelectedFoodIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    const result = scoreChallengeSelection(selectedFoodIds, activeScenario);
    setScoreResult(result);
    setActiveTab("evaluation");
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
    setSelectedFoodIds([]);
    setScoreResult(null);
    setSaved(false);
    setActiveTab("simulation");
  }

  function handleScenarioChange(s: Scenario) {
    setActiveScenario(s);
    setSelectedFoodIds([]);
    setScoreResult(null);
    setSaved(false);
    setActiveTab("simulation");
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 pb-40 sm:pb-10">

      {/* ── Sub-header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap text-slate-500 mb-1">
              <span className="material-symbols-outlined text-[13px]">school</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Simulasi Edukatif</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6cf8bb] text-[#002113]">
                Pagu Rp {activeScenario.rule.maxBudget.toLocaleString("id-ID")}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Food Challenge</h1>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Simulasi pilihan makanan harian. Estimasi gizi berbasis kurikulum edukasi.
            </p>
          </div>
          {/* Tab switcher — icon-only on mobile, with label on sm+ */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl shadow-sm shrink-0">
            {([
              { id: "simulation" as Tab, icon: "restaurant_menu", label: "Susun Piring" },
              { id: "evaluation"  as Tab, icon: "fact_check",      label: "Evaluasi" },
              { id: "comparator"  as Tab, icon: "compare_arrows",  label: "Komparator" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === t.id
                    ? "bg-[#131b2e] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/70"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scenario deck (always visible) ──────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#006c49] text-[16px]">explore</span>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pilih Skenario</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCENARIOS.map(s => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              isActive={activeScenario.id === s.id}
              onSelect={() => handleScenarioChange(s)}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          VIEW 1: SIMULATION — Tray + Catalog + Sticky Tracker
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "simulation" && (
        <>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">

          {/* Left 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-5">

            {/* Meal Tray */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c49] text-[22px]">lunch_dining</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Baki Makan Siang Edukatif</h3>
                    <p className="text-[10px] text-slate-400">Model Piring Seimbang: ½ Sayur–Buah · ¼ Karbohidrat · ¼ Protein</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  filledSlots === 4
                    ? "bg-[#6cf8bb] text-[#002113]"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {filledSlots} / 4 Terisi
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 shadow-inner">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRAY_SLOTS.map(slot => (
                    <TraySlot
                      key={slot.key}
                      group={slot}
                      food={slotFoods[slot.key]}
                      onRemove={handleToggleFood}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#006c49] text-[16px]">verified</span>
                  <span className="text-xs">
                    {selectedFoodIds.length === 0
                      ? "Pilih makanan dari katalog di bawah"
                      : filledSlots >= 3
                      ? <span className="text-slate-700"><strong className="text-slate-900">Piring hampir seimbang</strong> — pastikan ada sayuran &amp; minuman</span>
                      : "Tambahkan lebih banyak komponen gizi"}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[10px] hover:text-rose-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Food Catalog */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Katalog Makanan Kantin Sekolah</h3>
                    <p className="text-[10px] text-slate-400">Klik kartu makanan untuk menambah atau melepas dari baki</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {filteredFoods.length} item ditampilkan
                  </span>
                </div>
                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">search</span>
                  <input
                    type="text"
                    placeholder="Cari makanan…"
                    value={foodSearch}
                    onChange={e => setFoodSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49]/30 focus:border-[#006c49] transition-all"
                  />
                  {foodSearch && (
                    <button onClick={() => setFoodSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
                {/* Filter pills — horizontal scroll, contained */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                  {FILTER_OPTIONS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFoodFilter(f.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                        foodFilter === f.id
                          ? "bg-[#131b2e] text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {f.label} ({foodFilter === f.id && foodSearch ? filteredFoods.length : f.id === "all" ? FOOD_OPTIONS.length : FOOD_OPTIONS.filter(x => x.foodGroup === f.id).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop: card grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFoods.map(food => (
                  <FoodCatalogItem
                    key={food.id}
                    food={food}
                    isSelected={selectedFoodIds.includes(food.id)}
                    canSelect={true}
                    onToggle={() => handleToggleFood(food.id)}
                  />
                ))}
              </div>

              {/* Mobile: compact row list */}
              <div className="flex flex-col divide-y divide-slate-100 sm:hidden">
                {filteredFoods.map(food => {
                  const sel = selectedFoodIds.includes(food.id);
                  const hasWarning =
                    food.id === "teh-manis" ||
                    food.id === "mie-goreng-instan" ||
                    (food.carbsG !== null && food.fatG !== null && food.carbsG + food.fatG > 60);
                  return (
                    <div
                      key={food.id}
                      onClick={() => handleToggleFood(food.id)}
                      className={`flex items-center gap-3 py-2.5 px-1 transition-colors cursor-pointer ${sel ? "bg-[#006c49]/5" : ""}`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sel ? "bg-[#006c49]/15" : "bg-slate-100"}`}>
                        <span className={`material-symbols-outlined text-[20px] ${sel ? "text-[#006c49]" : "text-slate-400"}`}>
                          {food.foodGroup === "carbs" ? "grain" :
                           food.foodGroup === "protein" ? "egg" :
                           food.foodGroup === "vegetable" ? "eco" :
                           food.foodGroup === "fruit" ? "nutrition" :
                           food.foodGroup === "beverage" ? "water_drop" :
                           food.foodGroup === "dairy" ? "local_drink" : "restaurant"}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{food.name.split("(")[0].trim()}</span>
                          {hasWarning && (
                            <span className="text-[9px] text-rose-500 font-semibold shrink-0">⚠ Perhatikan</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{food.calories !== null ? `${food.calories} kkal` : "—"}</span>
                          {food.proteinG !== null && <><span>·</span><span>{food.proteinG}g protein</span></>}
                        </div>
                      </div>
                      {/* Price + toggle */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-700">Rp {(food.price / 1000).toFixed(0)}rb</span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          sel ? "bg-[#006c49] text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          <span className="material-symbols-outlined text-[16px]">{sel ? "check" : "add"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state when search yields nothing */}
              {filteredFoods.length === 0 && (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-2">search_off</span>
                  <p className="text-sm text-slate-500">Tidak ada makanan yang cocok.</p>
                  <button onClick={() => { setFoodSearch(""); setFoodFilter("all"); }} className="mt-2 text-xs text-[#006c49] underline">
                    Tampilkan semua
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 cols — Sticky tracker */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5 lg:sticky lg:top-20 flex flex-col gap-4">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c49] text-[20px]">account_balance_wallet</span>
                  <h3 className="text-sm font-bold text-slate-900">Ringkasan Pilihan</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  overBudget ? "bg-rose-100 text-rose-700" : "bg-[#6cf8bb] text-[#002113]"
                }`}>
                  {overBudget ? "Melebihi Budget" : "Dalam Anggaran"}
                </span>
              </div>

              {/* Budget gauge */}
              <div className="bg-slate-50 rounded-xl p-3.5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] text-slate-500 font-medium">Total Harga Menu</span>
                  <span
                    className={`text-xl font-black transition-all duration-200 ${
                      overBudget ? "text-rose-600" : "text-[#006c49]"
                    } ${priceAnim ? "scale-110" : "scale-100"}`}
                    style={{ display: "inline-block" }}
                  >
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                  <span>Pagu: Rp {activeScenario.rule.maxBudget.toLocaleString("id-ID")}</span>
                  {!overBudget && totalPrice > 0 && (
                    <span className="text-[#006c49] font-bold">
                      Sisa Rp {(activeScenario.rule.maxBudget - totalPrice).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${overBudget ? "bg-rose-400" : "bg-[#006c49]"}`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
              </div>

              {/* Macro breakdown */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Estimasi Gizi Piring</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a5 5 0 015 5c0 3.5-5 11-5 11S7 10.5 7 7a5 5 0 015-5z"/><circle cx="12" cy="7" r="1.5"/></svg>,
                      value: `${totalCalories} kkal`, label: "Energi", color: "text-[#006c49]",
                    },
                    {
                      svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3.5 18.5l4-8 4 6 3-4 4 6"/></svg>,
                      value: `${totalProtein.toFixed(1)} g`, label: "Protein", color: "text-blue-600",
                    },
                    {
                      svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
                      value: `${totalCarbs.toFixed(0)} g`, label: "Karbo", color: "text-amber-600",
                    },
                    {
                      svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
                      value: `${selectedFoodIds.length} item`, label: "Dipilih", color: "text-slate-700",
                    },
                  ].map(m => (
                    <div key={m.label} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm ${m.color}`}>
                        {m.svg}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{m.value}</div>
                        <div className="text-[9px] text-slate-400 font-medium">{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick insight */}
              {selectedFoodIds.length >= 2 && (
                <div className="p-3 bg-[#006c49]/5 rounded-xl flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#006c49] text-[18px] mt-0.5">tips_and_updates</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <span className="font-bold text-[#006c49]">Analisis Cepat:</span>{" "}
                    {overBudget
                      ? `Budget terlampaui Rp ${(totalPrice - activeScenario.rule.maxBudget).toLocaleString("id-ID")}. Coba ganti item mahal dengan pilihan lebih hemat.`
                      : totalProtein < 10
                      ? "Protein masih rendah. Tambahkan telur, tempe, atau tahu untuk mendukung fokus belajar."
                      : "Kombinasi ini terlihat seimbang untuk skenario ini. Kirim untuk evaluasi lengkap!"}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full py-3 px-4 rounded-xl bg-[#006c49] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#005236] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  <span>Kirim &amp; Evaluasi Jawaban</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => setActiveTab("comparator")}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">balance</span>
                  Bandingkan dengan Menu Rekomendasi
                </button>
              </div>
            </div>

            {/* Prinsip isi piringku */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Prinsip Isi Piringku SMANU</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Piring sehat pelajar sebaiknya tidak didominasi karbohidrat sederhana. Sayuran membantu metabolisme glukosa lebih stabil dan mencegah kantuk saat pelajaran.
              </p>
            </div>
          </div>
        </div>

        {/* ── Mobile sticky bottom bar (sm:hidden) ──────────────────── */}
        <div className="sm:hidden fixed bottom-16 inset-x-0 z-20 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {/* Budget bar */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${overBudget ? "bg-rose-400" : "bg-[#006c49]"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold shrink-0 ${overBudget ? "text-rose-600" : "text-[#006c49]"}`}>
              Rp {totalPrice.toLocaleString("id-ID")} / {activeScenario.rule.maxBudget.toLocaleString("id-ID")}
            </span>
          </div>
          {/* Selected count + submit */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {selectedFoodIds.length > 0 && (
                <span className="text-[11px] text-slate-500 truncate">
                  {selectedFoodIds.length} item · {totalCalories} kkal · {totalProtein.toFixed(0)}g prot
                </span>
              )}
              {selectedFoodIds.length === 0 && (
                <span className="text-[11px] text-slate-400">Pilih makanan dari daftar</span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-[#006c49] text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <span>Kirim</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW 2: EVALUATION RESULT
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "evaluation" && (
        <div className="flex flex-col gap-5">
          {!scoreResult ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-slate-200 block mb-4">fact_check</span>
              <p className="text-sm font-semibold text-slate-700 mb-2">Belum ada evaluasi</p>
              <p className="text-xs text-slate-400 mb-5">Susun pilihanmu di tab &quot;Susun Piring&quot; dan klik Kirim &amp; Evaluasi.</p>
              <button
                onClick={() => setActiveTab("simulation")}
                className="px-5 py-2.5 rounded-xl bg-[#131b2e] text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                Susun Piring →
              </button>
            </div>
          ) : (
            <>
              {/* Score banner */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Score circle */}
                  <div className="lg:col-span-4 flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl">
                    <ScoreCircle score={scoreResult.score} />
                    <h3 className={`text-sm font-bold mt-2 ${scoreColor(scoreResult.score)}`}>
                      {scoreLabel(scoreResult.score)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Skor mengukur kualitas keputusan, bukan menghakimi pilihanmu.
                    </p>
                  </div>

                  {/* Financial summary */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ringkasan Finansial</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          Rp {scoreResult.totalPrice.toLocaleString("id-ID")}
                        </span>
                        {scoreResult.withinBudget && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6cf8bb] text-[#002113] font-bold">
                            Hemat Rp {(activeScenario.rule.maxBudget - scoreResult.totalPrice).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Budget skenario Rp {activeScenario.rule.maxBudget.toLocaleString("id-ID")}
                        {scoreResult.withinBudget ? " tidak terlampaui." : " — melebihi budget."}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Estimasi Gizi Akhir</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Kalori",    val: scoreResult.totalCalories !== null ? `${scoreResult.totalCalories} kkal` : "—" },
                          { label: "Protein",   val: scoreResult.totalProtein !== null ? `${scoreResult.totalProtein}g` : "—", hl: true },
                          { label: "Karbo",     val: `${totalCarbs.toFixed(0)}g` },
                          { label: "Data Gizi", val: scoreResult.dataComplete ? "Lengkap" : "Sebagian" },
                        ].map(r => (
                          <div key={r.label} className="p-2.5 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-400 block">{r.label}</span>
                            <span className={`text-xs font-bold ${r.hl ? "text-[#006c49]" : "text-slate-800"}`}>{r.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#006c49] text-[18px]">check_box</span>
                      Apa yang Sudah Baik?
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {scoreResult.withinBudget && (
                        <li className="flex items-start gap-2 text-[11px] text-slate-700">
                          <span className="material-symbols-outlined text-[#006c49] text-[15px] shrink-0 mt-0.5">check_circle</span>
                          Total belanja tidak melebihi pagu skenario.
                        </li>
                      )}
                      {scoreResult.meetsProtein && (
                        <li className="flex items-start gap-2 text-[11px] text-slate-700">
                          <span className="material-symbols-outlined text-[#006c49] text-[15px] shrink-0 mt-0.5">check_circle</span>
                          Asupan protein mencukupi target minimum skenario.
                        </li>
                      )}
                      {scoreResult.hasRecommendedGroups && (
                        <li className="flex items-start gap-2 text-[11px] text-slate-700">
                          <span className="material-symbols-outlined text-[#006c49] text-[15px] shrink-0 mt-0.5">check_circle</span>
                          Mencakup semua kelompok makanan yang direkomendasikan.
                        </li>
                      )}
                      {scoreResult.caloriesInRange && (
                        <li className="flex items-start gap-2 text-[11px] text-slate-700">
                          <span className="material-symbols-outlined text-[#006c49] text-[15px] shrink-0 mt-0.5">check_circle</span>
                          Kalori total dalam rentang yang sesuai untuk skenario.
                        </li>
                      )}
                      {scoreResult.score < 40 && (
                        <li className="flex items-start gap-2 text-[11px] text-slate-400 italic">
                          <span className="material-symbols-outlined text-slate-300 text-[15px] shrink-0 mt-0.5">info</span>
                          Coba pilih lebih banyak komponen gizi berbeda.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Feedback + actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#131b2e] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Ulasan Edukatif SMANU</h4>
                      <span className="text-[10px] text-slate-400">Berdasarkan data skenario dan pilihan kamu</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {scoreResult.feedback.map((msg, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                        <span className="material-symbols-outlined text-[#006c49] text-[16px] shrink-0 mt-0.5">info</span>
                        <p className="text-xs text-slate-700 leading-relaxed">{msg}</p>
                      </div>
                    ))}
                  </div>

                  {scoreResult.alternatives.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pertimbangan Alternatif</span>
                      {scoreResult.alternatives.map((alt, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <span className="shrink-0 text-[14px]">💡</span>
                          <p className="text-xs text-blue-800 leading-relaxed">{alt}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Related knowledge teaser — from scenario + selected foods */}
                  {(() => {
                    const kbIds = new Set<string>([
                      ...activeScenario.relatedKnowledgeIds,
                      ...selectedFoodIds.flatMap(id => FOOD_KB_LINKS[id] ?? []),
                    ]);
                    const kbArr = [...kbIds].slice(0, 3);
                    if (kbArr.length === 0) return null;
                    return (
                      <div className="pt-2 flex flex-col gap-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006c49] text-[18px]">auto_awesome</span>
                          <span className="text-xs font-semibold text-slate-700">Pelajari lebih lanjut di Pustaka Gizi</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {kbArr.map(id => (
                            <Link
                              key={id}
                              href={`/nutrition-knowledge/${id}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#006c49]/10 hover:text-[#006c49] text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[13px]">menu_book</span>
                              {id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Langkah Berikutnya</h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Simpan pencapaian ke profil belajarmu, ubah racikan, atau coba skenario berbeda.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setActiveTab("comparator")}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#006c49] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#005236] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                        Buka Komparator Menu Cerdas
                      </button>
                      <button
                        onClick={() => setActiveTab("simulation")}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">tune</span>
                        Ubah Racikan Menu
                      </button>
                      <button
                        onClick={handleReset}
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">replay</span>
                        Coba Skenario Lain
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-300">Simulasi edukatif interaktif SMANU v1.0</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW 3: SMART FOOD COMPARATOR
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "comparator" && (
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Komparator Menu Cerdas</h3>
                <p className="text-xs text-slate-400">Bandingkan pilihanmu dengan rekomendasi berbasis skenario aktif</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-400 font-medium">Skenario:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700">
                  {activeScenario.emoji} {activeScenario.title}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Column A: student selection */}
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#131b2e] text-white">Pilihanmu Saat Ini</span>
                  {scoreResult && (
                    <span className="text-sm font-black text-[#006c49]">Skor: {scoreResult.score}</span>
                  )}
                </div>

                <div className="h-36 w-full rounded-xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center">
                  {selectedFoodIds.length === 0 ? (
                    <span className="text-xs text-slate-300 text-center px-4">Belum ada pilihan.<br/>Kembali ke Susun Piring.</span>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 p-3 flex flex-wrap gap-1.5 items-start content-start overflow-hidden">
                      {selectedFoodIds.slice(0, 6).map(id => {
                        const f = FOOD_OPTIONS.find(x => x.id === id);
                        return f ? (
                          <span key={id} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${GROUP_BADGE[f.foodGroup]}`}>
                            {f.name.split("(")[0].trim()}
                          </span>
                        ) : null;
                      })}
                      {selectedFoodIds.length > 6 && (
                        <span className="text-[9px] text-slate-400">+{selectedFoodIds.length - 6} lagi</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {selectedFoodIds.length === 0 ? "Belum dipilih" : `${selectedFoodIds.length} item dipilih`}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {selectedFoodIds.length === 0
                      ? "Kembali ke tab Susun Piring untuk memilih makanan."
                      : `Total: Rp ${totalPrice.toLocaleString("id-ID")} · ${totalCalories} kkal · ${totalProtein.toFixed(1)}g protein`}
                  </p>
                </div>

                {selectedFoodIds.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Energi", val: `${totalCalories} kkal` },
                      { label: "Protein", val: `${totalProtein.toFixed(1)}g`, hl: true },
                      { label: "Budget", val: `Rp ${(totalPrice/1000).toFixed(0)}rb` },
                    ].map(m => (
                      <div key={m.label} className="bg-white p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-semibold">{m.label}</span>
                        <span className={`text-xs font-bold ${m.hl ? "text-[#006c49]" : "text-slate-800"}`}>{m.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400">Status: {selectedFoodIds.length > 0 ? "Tersusun di Baki" : "Kosong"}</span>
                  <button
                    onClick={() => setActiveTab("simulation")}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Ubah Komposisi
                  </button>
                </div>
              </div>

              {/* Column B: algorithm recommendation */}
              <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 ring-2 ring-[#006c49] shadow-md relative">
                <div className="absolute -top-3 right-4 bg-[#006c49] text-white px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow">
                  Rekomendasi Algoritma
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#6cf8bb] text-[#002113]">Alternatif Lebih Tinggi Serat</span>
                  <span className="text-sm font-black text-[#006c49]">Skor: 94</span>
                </div>

                <div className="h-36 w-full rounded-xl bg-gradient-to-br from-[#006c49]/5 to-[#6cf8bb]/10 flex items-center justify-center">
                  <div className="flex flex-wrap gap-1.5 p-3 items-start content-start w-full h-full overflow-hidden">
                    {[
                      { name: "Nasi Putih",  group: "carbs" as const },
                      { name: "Tempe Goreng", group: "protein" as const },
                      { name: "Tumis Kangkung", group: "vegetable" as const },
                      { name: "Pisang",      group: "fruit" as const },
                      { name: "Air Mineral", group: "beverage" as const },
                    ].map(r => (
                      <span key={r.name} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${GROUP_BADGE[r.group]}`}>
                        {r.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Nasi + Tempe + Kangkung + Pisang + Air</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Rendah minyak jenuh, kaya kalium &amp; magnesium alami untuk ketenangan saraf.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Energi",  val: "~375 kkal" },
                    { label: "Protein", val: "~15g",   hl: true },
                    { label: "Serat",   val: "~7.8g",  hl: true },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">{m.label}</span>
                      <span className={`text-xs font-bold ${m.hl ? "text-[#006c49]" : "text-slate-800"}`}>{m.val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#006c49] text-[14px] mt-0.5">add_circle</span>
                    <span><strong>Kelebihan:</strong> Serat hampir 2× lipat, ada buah segar, lebih hemat.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <span className="material-symbols-outlined text-slate-300 text-[14px] mt-0.5">remove_circle</span>
                    <span><strong>Pertimbangan:</strong> Protein nabati — variasi protein hewani perlu di makan malam.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-[#006c49] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Indeks Glikemik Optimal
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFoodIds(["nasi-putih", "tempe-goreng", "sayur-kangkung", "pisang", "air-putih"]);
                      setActiveTab("simulation");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#006c49] text-white text-[11px] font-bold hover:bg-[#005236] transition-colors flex items-center gap-1"
                  >
                    Terapkan Menu Ini
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge link */}
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#006c49] text-[22px]">menu_book</span>
              <div>
                <span className="text-sm font-bold text-slate-900">Paham Karbohidrat Cepat vs Lambat?</span>
                <p className="text-xs text-slate-400">Pelajari artikel glikemik indeks di Pustaka Gizi SMANU.</p>
              </div>
            </div>
            <Link
              href="/nutrition-knowledge/glycemic-index"
              className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Buka Pustaka Gizi
            </Link>
          </div>
        </div>
      )}

      {/* ── Educational disclaimer ───────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
        <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">verified_user</span>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong>Catatan Pembelajaran SMANU:</strong> Harga kantin dan nilai kandungan gizi merupakan estimasi terstandarisasi untuk tujuan edukasi literasi pangan, bukan pengganti diagnosis medis atau data klinis.
        </p>
      </div>
    </div>
  );
}
