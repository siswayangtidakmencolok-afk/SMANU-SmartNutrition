"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FOOD_OPTIONS,
  SCENARIOS,
  compareFoodOptions,
  scoreChallengeSelection,
  FoodOption,
  ComparisonResult,
} from "@/lib/food-challenge-data";
import { PageHeader } from "@/components/ui/PageHeader";

const GROUP_LABEL: Record<FoodOption["foodGroup"], string> = {
  carbs: "Karbohidrat",
  protein: "Protein",
  vegetable: "Sayuran",
  fruit: "Buah",
  dairy: "Susu/Produk Susu",
  snack: "Camilan",
  beverage: "Minuman",
};

function NullNote() {
  return <span className="text-slate-400">Data belum tersedia</span>;
}

// ── Comparison table ──────────────────────────────────────────────────────
function ComparisonTable({ result }: { result: ComparisonResult }) {
  const { foodA, foodB } = result;
  const rows = [
    {
      label: "Harga (simulasi)",
      a: foodA.price !== null ? `Rp ${foodA.price.toLocaleString("id-ID")}` : null,
      b: foodB.price !== null ? `Rp ${foodB.price.toLocaleString("id-ID")}` : null,
    },
    {
      label: "Kalori",
      a: foodA.calories !== null ? `${foodA.calories} kcal` : null,
      b: foodB.calories !== null ? `${foodB.calories} kcal` : null,
    },
    {
      label: "Protein",
      a: foodA.proteinG !== null ? `${foodA.proteinG}g` : null,
      b: foodB.proteinG !== null ? `${foodB.proteinG}g` : null,
    },
    {
      label: "Karbohidrat",
      a: foodA.carbsG !== null ? `${foodA.carbsG}g` : null,
      b: foodB.carbsG !== null ? `${foodB.carbsG}g` : null,
    },
    {
      label: "Lemak",
      a: foodA.fatG !== null ? `${foodA.fatG}g` : null,
      b: foodB.fatG !== null ? `${foodB.fatG}g` : null,
    },
    {
      label: "Kelompok",
      a: GROUP_LABEL[foodA.foodGroup],
      b: GROUP_LABEL[foodB.foodGroup],
    },
    {
      label: "Ketersediaan",
      a: foodA.availabilityNote,
      b: foodB.availabilityNote,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
        <div className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aspek</div>
        <div className="p-3 text-sm font-bold text-emerald-800 border-l border-slate-200 truncate">{foodA.name}</div>
        <div className="p-3 text-sm font-bold text-blue-800 border-l border-slate-200 truncate">{foodB.name}</div>
      </div>
      {rows.map((row, i) => (
        <div key={i} className={`grid grid-cols-3 border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
          <div className="p-3 text-xs font-medium text-slate-500">{row.label}</div>
          <div className="p-3 text-xs text-slate-800 border-l border-slate-100">
            {row.a ?? <NullNote />}
          </div>
          <div className="p-3 text-xs text-slate-800 border-l border-slate-100">
            {row.b ?? <NullNote />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Scenario comparison ───────────────────────────────────────────────────
function ScenarioComparison({
  selectedIds,
  scenarioId,
}: {
  selectedIds: [string, string];
  scenarioId: string;
}) {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) return null;

  const scoreA = scoreChallengeSelection([selectedIds[0]], scenario);
  const scoreB = scoreChallengeSelection([selectedIds[1]], scenario);

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <p className="text-xs font-bold text-slate-700 mb-3">
        Perbandingan dalam skenario: <span className="text-emerald-700">{scenario.emoji} {scenario.title}</span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[{ name: FOOD_OPTIONS.find(f => f.id === selectedIds[0])?.name ?? "", score: scoreA.score },
          { name: FOOD_OPTIONS.find(f => f.id === selectedIds[1])?.name ?? "", score: scoreB.score }].map((item, i) => (
          <div key={i} className={`p-3 rounded-xl text-center border ${item.score >= 60 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
            <p className="text-[10px] text-slate-500 truncate">{item.name}</p>
            <p className={`text-2xl font-black ${item.score >= 60 ? "text-emerald-700" : "text-rose-600"}`}>{item.score}</p>
            <p className="text-[10px] text-slate-500">skor skenario</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center">
        Skor satu item saja — bukan pilihan lengkap skenario
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function FoodComparatorPage() {
  const [foodAId, setFoodAId] = useState<string>(FOOD_OPTIONS[0].id);
  const [foodBId, setFoodBId] = useState<string>(FOOD_OPTIONS[4].id);
  const [scenarioId, setScenarioId] = useState<string>("");
  const [showScenario, setShowScenario] = useState(false);

  const comparison = compareFoodOptions(foodAId, foodBId);

  const sameFood = foodAId === foodBId;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/food-challenge" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </Link>
        <PageHeader
          badge="Perbandingan Netral"
          title="Smart Food Comparator"
          subtitle="Bandingkan dua pilihan makanan berdasarkan estimasi harga dan nutrisi. Hasil bergantung pada data yang tersedia."
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-amber-500 shrink-0">⚠️</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Estimasi Edukatif:</strong> Harga adalah harga simulasi. Nilai gizi adalah estimasi umum — bukan data klinis atau label kemasan.
          Perbandingan ini membantu berpikir kritis tentang pilihan makanan, bukan membuat keputusan kesehatan.
        </p>
      </div>

      {/* Food selectors */}
      <div className="grid grid-cols-2 gap-4">
        {([
          { label: "Makanan A", value: foodAId, onChange: setFoodAId, color: "emerald" },
          { label: "Makanan B", value: foodBId, onChange: setFoodBId, color: "blue" },
        ] as const).map((col) => (
          <div key={col.label} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">{col.label}</label>
            <select
              value={col.value}
              onChange={(e) => col.onChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white text-xs text-slate-800 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            >
              {FOOD_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Rp {f.price.toLocaleString("id-ID")})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {sameFood && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center font-medium">
          Pilih dua makanan yang berbeda untuk membandingkan.
        </div>
      )}

      {/* Comparison table */}
      {!sameFood && comparison && (
        <>
          <ComparisonTable result={comparison} />

          {/* Considerations */}
          {comparison.considerations.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pertimbangan</h3>
              {comparison.considerations.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 shrink-0">•</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          )}

          {/* Data note */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="material-symbols-outlined text-slate-400 text-[16px] shrink-0">info</span>
            <p className="text-xs text-slate-500 leading-relaxed">{comparison.dataNote}</p>
          </div>

          {/* Scenario comparison toggle */}
          <div>
            <button
              onClick={() => setShowScenario((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showScenario ? "expand_less" : "expand_more"}
              </span>
              {showScenario ? "Sembunyikan" : "Bandingkan dalam skenario"}
            </button>

            {showScenario && (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Pilih Skenario</label>
                  <select
                    value={scenarioId}
                    onChange={(e) => setScenarioId(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white text-xs text-slate-800 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  >
                    <option value="">— Pilih skenario —</option>
                    {SCENARIOS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                {scenarioId && (
                  <ScenarioComparison
                    selectedIds={[foodAId, foodBId]}
                    scenarioId={scenarioId}
                  />
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/food-challenge"
              className="flex-1 py-3 rounded-xl border-2 border-[#131b2e] text-[#131b2e] font-bold text-sm text-center hover:bg-slate-50 transition-colors"
            >
              ← Coba Food Challenge
            </Link>
            <Link
              href="/learning-journey"
              className="flex-1 py-3 rounded-xl bg-[#131b2e] text-white font-bold text-sm text-center hover:bg-slate-700 transition-colors"
            >
              Lihat Learning Journey →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
