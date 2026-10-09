"use client";

import { useState, useEffect } from "react";
import { NutriQuest } from "@/components/NutriQuest";

// ── Data ───────────────────────────────────────────────────────────────────

const dietaryOptions = [
  { id: "none", label: "No restrictions" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "halal", label: "Halal" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "nut-allergy", label: "Nut allergy" },
  { id: "shellfish-allergy", label: "Shellfish allergy" },
];

const situationOptions = [
  { id: "busy-studying", icon: "auto_stories", label: "Busy studying", sub: "Exam prep / Dense schedule" },
  { id: "need-energy", icon: "bolt", label: "Need more energy", sub: "Combat afternoon slumps" },
  { id: "saving-money", icon: "savings", label: "Saving money", sub: "Budget-friendly macros" },
  { id: "eat-campus", icon: "domain", label: "Eat on campus", sub: "Cafeteria / Warung reliance" },
  { id: "cook-home", icon: "skillet", label: "Cook at home", sub: "Boarding room / Kitchen prep" },
  { id: "active", icon: "directions_run", label: "Active lifestyle", sub: "Sports & physical activity" },
];

const goalOptions = [
  { id: "balanced", label: "Balanced eating" },
  { id: "energy", label: "More energy" },
  { id: "focus", label: "Better focus" },
  { id: "habits", label: "Build healthy habits" },
  { id: "protein", label: "Increase protein" },
  { id: "hydration", label: "Improve hydration" },
];

const foodChipsDefault = ["Rice", "Eggs", "Tofu", "Vegetables"];

// ── Helpers ────────────────────────────────────────────────────────────────
function completedSections(
  foods: string[],
  budget: string,
  prefs: string[],
  situations: string[],
  goals: string[]
): number {
  let n = 0;
  if (foods.length > 0) n++;
  if (budget.trim()) n++;
  if (prefs.length > 0) n++;
  if (situations.length > 0) n++;
  if (goals.length > 0) n++;
  return n;
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MyContextPage() {
  // Form state
  const [foodText, setFoodText] = useState("");
  const [foodChips, setFoodChips] = useState<string[]>(foodChipsDefault);
  const [budget, setBudget] = useState("15.000");
  const [budgetUnit, setBudgetUnit] = useState<"meal" | "day">("meal");
  const [preferences, setPreferences] = useState<string[]>(["halal"]);
  const [situations, setSituations] = useState<string[]>(["busy-studying", "need-energy", "saving-money"]);
  const [goals, setGoals] = useState<string[]>(["energy", "focus"]);
  const [saved, setSaved] = useState(false);

  // Load persisted context on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("smanu_context_v1");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.foodChips)) setFoodChips(saved.foodChips);
      if (typeof saved.budget === "string") setBudget(saved.budget);
      if (saved.budgetUnit === "meal" || saved.budgetUnit === "day") setBudgetUnit(saved.budgetUnit);
      if (Array.isArray(saved.preferences)) setPreferences(saved.preferences);
      if (Array.isArray(saved.situations)) setSituations(saved.situations);
      if (Array.isArray(saved.goals)) setGoals(saved.goals);
    } catch {
      // Corrupted storage — ignore
    }
  }, []);

  const done = completedSections(foodChips, budget, preferences, situations, goals);
  const pct = Math.round((done / 5) * 100);

  function toggleArr<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function addFoodChip() {
    const val = foodText.trim();
    if (val && !foodChips.includes(val)) setFoodChips((c) => [...c, val]);
    setFoodText("");
  }

  function handleSave() {
    // Persist context to localStorage so it survives page refresh
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("smanu_context_v1", JSON.stringify({
          foodChips, budget, budgetUnit, preferences, situations, goals,
        }));
      } catch {
        // Storage full or disabled — proceed anyway
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setFoodChips([]);
    setBudget("");
    setPreferences([]);
    setSituations([]);
    setGoals([]);
    setSaved(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-[#131b2e] text-white px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 overflow-x-hidden" style={{maxWidth: "100vw"}}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6cf8bb]" />
            <span className="text-xs font-semibold text-[#6cf8bb] tracking-wider uppercase">Student Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">My Context</h1>
          <p className="text-sm text-[#7c839b] leading-relaxed">
            Tell SMANU about your situation so your nutrition recommendations can fit your daily life.
          </p>
        </div>

        {/* Config pill */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#7c839b]">Configuration Status</span>
            <span className="text-base font-semibold text-white">{done} of 5 Sections</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#006c49]/30 flex items-center justify-center text-[#6cf8bb]">
            <span className="material-symbols-outlined text-[22px]">tune</span>
          </div>
        </div>
      </div>

      {/* ── Hero intro panel ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 p-5 sm:p-6 lg:p-10">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#006c49]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 rounded-full bg-[#4cd7f6]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006c49]/20 text-[#6cf8bb] text-xs font-semibold w-fit uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Personalization Engine
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Your Nutrition Context</h2>
            <p className="text-sm text-[#7c839b] leading-relaxed">
              Set your food availability, budget, preferences, and student goals to receive more relevant nutrition guidance grounded in scientific peer reviews and empirical campus research.
            </p>
            {/* Progress bar */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-[#7c839b]">
                <span>Setup completeness</span>
                <span className="text-[#6cf8bb] font-semibold">{pct}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full transition-all ${i < done ? "bg-[#006c49]" : "bg-white/10"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Animated graphic — hidden on small mobile, shown from sm breakpoint */}
          <div className="hidden sm:flex lg:col-span-5 justify-center lg:justify-end overflow-hidden">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full animate-spin [animation-duration:40s]" fill="none" viewBox="0 0 200 200">
                <circle className="text-white/10" cx="100" cy="100" r="90" stroke="currentColor" strokeDasharray="4 6" strokeWidth="1" />
                <circle className="text-[#006c49]/40" cx="100" cy="100" r="68" stroke="currentColor" strokeDasharray="12 12" strokeWidth="1.5" />
                <circle className="text-[#4cd7f6]/30" cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="1" />
              </svg>
              <div className="relative z-10 w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-lg">
                <span className="material-symbols-outlined text-[#6cf8bb] text-[36px]">psychology</span>
                <span className="text-xs font-semibold text-white mt-1">SMANU Core</span>
                <span className="text-[10px] text-[#7c839b]">Live Sync</span>
              </div>
              <div className="absolute top-2 left-4 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md text-[10px] text-white shadow-md flex items-center gap-1 max-w-[110px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] flex-shrink-0" />
                <span className="truncate">Budget Aware</span>
              </div>
              <div className="absolute bottom-4 right-2 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md text-[10px] text-white shadow-md flex items-center gap-1 max-w-[110px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] flex-shrink-0" />
                <span className="truncate">Pantry Matrix</span>
              </div>
              <div className="absolute -left-2 bottom-12 px-2 py-0.5 rounded-md bg-[#006c49]/30 text-[10px] text-[#6cf8bb] max-w-[70px] truncate">
                Verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column workspace ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">

        {/* LEFT COLUMN — input cards */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">

          {/* CARD 01: Food Available */}
          <ContextCard num="01" title="Food Available" icon="kitchen"
            desc="What foods or ingredients do you regularly have access to?">
            <textarea
              value={foodText}
              onChange={(e) => setFoodText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFoodChip(); } }}
              rows={3}
              placeholder="e.g. rice, eggs, tofu, tempeh, chicken, seasonal vegetables, local fruits..."
              className="w-full bg-white/10 text-white placeholder:text-[#7c839b] text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#006c49]/50 transition-all resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {foodChips.map((chip) => (
                <div key={chip} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white text-xs">
                  <span>{chip}</span>
                  <button onClick={() => setFoodChips((c) => c.filter((x) => x !== chip))} className="text-[#7c839b] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
              <button
                onClick={addFoodChip}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#006c49]/20 text-[#6cf8bb] hover:bg-[#006c49]/30 text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                Add food
              </button>
            </div>
          </ContextCard>

          {/* CARD 02: Budget */}
          <ContextCard num="02" title="Budget" icon="payments"
            desc="Set your typical food budget so SMANU can suggest realistic options.">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7c839b]">Rp</span>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white/10 text-white text-base font-semibold rounded-lg outline-none focus:ring-2 focus:ring-[#006c49]/50 transition-all"
                />
              </div>
              <div className="flex items-center p-1 rounded-lg bg-white/10 self-start sm:self-auto">
                {(["meal", "day"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setBudgetUnit(u)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      budgetUnit === u
                        ? "bg-[#006c49] text-white shadow-sm"
                        : "text-[#7c839b] hover:text-white"
                    }`}
                  >
                    Per {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#7c839b] text-xs">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>Optional — leave blank for unconstrained nutritional recommendations.</span>
            </div>
          </ContextCard>

          {/* CARD 03: Dietary Preferences */}
          <ContextCard num="03" title="Dietary Preferences" icon="restaurant_menu"
            desc="Choose restrictions or preferences that apply to you.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dietaryOptions.map((opt) => {
                const sel = preferences.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleArr(preferences, opt.id, setPreferences)}
                    className={`p-2.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-all ${
                      sel
                        ? "bg-[#006c49]/30 text-[#6cf8bb]"
                        : "bg-white/10 text-[#7c839b] hover:text-white hover:bg-white/15"
                    }`}
                  >
                    <span className={sel ? "font-semibold" : ""}>{opt.label}</span>
                    {sel && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                  </button>
                );
              })}
            </div>
          </ContextCard>

          {/* CARD 04: Student Situation */}
          <ContextCard num="04" title="Student Situation" icon="school"
            desc="Tell SMANU what your current daily situation looks like.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {situationOptions.map((s) => {
                const active = situations.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleArr(situations, s.id, setSituations)}
                    className={`p-4 rounded-xl text-left flex flex-col justify-between h-24 transition-all ${
                      active ? "bg-[#006c49]/20" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`material-symbols-outlined text-[22px] ${active ? "text-[#6cf8bb]" : "text-[#7c839b]"}`}>
                        {s.icon}
                      </span>
                      {active && <span className="w-2 h-2 rounded-full bg-[#006c49]" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${active ? "text-white" : "text-white"}`}>{s.label}</span>
                      <span className={`text-[11px] ${active ? "text-[#6cf8bb]" : "text-[#7c839b]"}`}>{s.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ContextCard>
        </div>

        {/* RIGHT COLUMN — summary + goals + actions */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-w-0 overflow-hidden">

          {/* CARD 05: Your Nutrition Profile */}
          <div className="rounded-xl bg-white/5 p-5 flex flex-col gap-5 overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <h3 className="text-base font-semibold text-white">Your Nutrition Profile</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#006c49]/20 text-[#6cf8bb]">Active</span>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: "Food Access", icon: "inventory_2", val: foodChips.length ? foodChips.join(" · ") : "Not set" },
                { label: "Budget Target", icon: "price_check", val: budget ? `Rp ${budget} / ${budgetUnit}` : "Not set" },
                {
                  label: "Dietary Preferences", icon: "verified",
                  val: preferences.length
                    ? preferences.map((p) => dietaryOptions.find((o) => o.id === p)?.label).join(", ")
                    : "Not set",
                },
                {
                  label: "Current Focus", icon: "center_focus_strong",
                  val: goals.length
                    ? goals.map((g) => goalOptions.find((o) => o.id === g)?.label).join(" · ")
                    : "Not set",
                  highlight: true,
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[10px] font-semibold text-[#7c839b] uppercase tracking-wider truncate">{item.label}</span>
                    <span className="material-symbols-outlined text-[#7c839b] shrink-0" style={{fontSize: "16px", width: "16px", height: "16px", overflow: "hidden"}}>{item.icon}</span>
                  </div>
                  <span className={`text-sm font-medium break-words ${item.highlight ? "text-[#6cf8bb]" : "text-white"}`}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 overflow-hidden">
              <span className="material-symbols-outlined text-[#6cf8bb] mt-0.5 flex-shrink-0" style={{fontSize: "18px", width: "18px", height: "18px", overflow: "hidden"}}>verified_user</span>
              <p className="text-xs text-[#7c839b] leading-normal">
                SMANU uses this context strictly to tailor meal advice, ingredient substitutions, and academic energy curves. No personal health records are shared.
              </p>
            </div>
          </div>

          {/* CARD 06: Nutrition Goals */}
          <div className="rounded-xl bg-white/5 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Nutrition Goals</h3>
                <p className="text-xs text-[#7c839b]">What would you like to improve?</p>
              </div>
              <span className="material-symbols-outlined text-[#7c839b] text-[20px]">flag</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {goalOptions.map((g) => {
                const sel = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleArr(goals, g.id, setGoals)}
                    className={`p-2.5 rounded-lg text-left text-sm flex items-center justify-between transition-all ${
                      sel ? "bg-[#006c49]/25 text-white" : "bg-white/5 text-[#7c839b] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className={sel ? "font-semibold text-[#6cf8bb]" : ""}>{g.label}</span>
                    <span className={`material-symbols-outlined text-[16px] ${sel ? "text-[#6cf8bb]" : "opacity-30"}`}>
                      {sel ? "check_circle" : "circle"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STICKY ACTION PANEL */}
          <div className="rounded-xl bg-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006c49]" />
              <span className="text-xs text-[#7c839b]">Context helps SMANU tailor recommendations</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-white/10 text-[#7c839b] hover:text-white text-sm font-medium transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-[#006c49] text-white hover:bg-[#005236] text-sm font-semibold flex items-center gap-1.5 shadow-md transition-all"
              >
                <span>Save Context</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#006c49]/20 rounded-xl text-[#6cf8bb] text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Context saved successfully.
            </div>
          )}
        </div>
      </div>

      {/* ── NutriQuest Section ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 p-5 sm:p-6 lg:p-10">
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#4cd7f6]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-0 w-80 h-80 rounded-full bg-[#006c49]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left: text + widget */}
          <div className="lg:col-span-7 flex flex-col gap-5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4cd7f6]/15 text-[#4cd7f6] text-xs font-semibold w-fit uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">psychology_alt</span>
              Nutrition Quiz
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">NutriQuest</h2>
              <h3 className="text-lg text-[#7c839b] font-normal">Uji wawasanmu tentang makanan dan nutrisi.</h3>
            </div>
            <p className="text-sm text-[#7c839b] max-w-xl leading-relaxed">
              Jawab 15 pertanyaan berbasis riset dan lihat seberapa baik pemahamanmu tentang nutrisi sehari-hari, makronutrien terjangkau, serta strategi fokus belajar.
            </p>
            {/* NutriQuest widget rendered here */}
            <NutriQuest userName="SMANU Student" />
          </div>

          {/* Right: graphic — hidden on small mobile */}
          <div className="hidden sm:flex lg:col-span-5 justify-center lg:justify-end overflow-hidden">
            <div className="relative w-56 h-52 sm:w-72 sm:h-64 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-white/5 animate-pulse [animation-duration:6s]" />
              </div>
              <div className="relative z-10 w-44 h-44 rounded-2xl bg-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-2 shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-[#006c49]/30 flex items-center justify-center text-[#6cf8bb]">
                  <span className="material-symbols-outlined text-[28px]">quiz</span>
                </div>
                <span className="text-xl font-semibold text-white">15 Soal</span>
                <span className="text-xs text-[#4cd7f6]">Terverifikasi SMANU</span>
              </div>
              <div className="absolute top-2 right-2 sm:right-4 px-2 py-1 rounded-xl bg-white/10 backdrop-blur-md shadow-lg flex items-center gap-1.5 max-w-[130px]">
                <span className="material-symbols-outlined text-[#6cf8bb] text-[14px] flex-shrink-0">task_alt</span>
                <span className="text-[10px] text-white font-medium truncate">Nutrition Challenge</span>
              </div>
              <div className="absolute bottom-4 left-2 px-2 py-1 rounded-xl bg-white/10 backdrop-blur-md shadow-lg flex items-center gap-1.5 max-w-[120px]">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[14px] flex-shrink-0">star</span>
                <span className="text-[10px] text-white font-medium truncate">Peer Reviewed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── ContextCard helper ─────────────────────────────────────────────────────
function ContextCard({
  num, title, icon, desc, children,
}: {
  num: string;
  title: string;
  icon: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-[#7c839b]">{num}</span>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className="text-xs text-[#7c839b]">{desc}</p>
        </div>
        <span className="material-symbols-outlined text-[#7c839b] shrink-0 overflow-hidden" style={{fontSize: "20px", width: "20px", height: "20px"}}>{icon}</span>
      </div>
      {children}
    </div>
  );
}
