"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { SituationSelector } from "@/components/SituationSelector";

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

export default function MyContextPage() {
  const [situation, setSituation] = useState("");
  const [budget, setBudget] = useState("");
  const [availableFoods, setAvailableFoods] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function togglePreference(id: string) {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setSituation("");
    setBudget("");
    setAvailableFoods("");
    setPreferences([]);
    setSaved(false);
  }

  const hasAnyContext = situation || budget || availableFoods || preferences.length > 0;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="Personalization"
        title="My Context"
        subtitle="Set your parameters to help SMANU tailor nutrition explanations to your real-life environment."
      />

      {/* Privacy notice */}
      <Card variant="low" className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[--color-secondary] text-[20px] flex-shrink-0 mt-0.5">
          lock
        </span>
        <p className="text-xs text-[--color-on-surface-variant]">
          Your context is stored locally in your session and is never shared. It is strictly used
          to personalize nutrition explanations from the knowledge base.
        </p>
      </Card>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Section 1 — Situation */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[--color-on-surface]">Your Situation</h2>
              <p className="text-xs text-[--color-on-surface-variant]">
                What best describes your current context?
              </p>
            </div>
            <Badge variant={situation ? "success" : "neutral"}>
              {situation ? "Set" : "Not set"}
            </Badge>
          </div>
          <SituationSelector selected={situation} onChange={setSituation} />
        </Card>

        {/* Section 2 — Budget */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[--color-on-surface]">
                Budget{" "}
                <span className="text-[--color-outline] font-normal">(optional)</span>
              </h2>
              <p className="text-xs text-[--color-on-surface-variant]">
                Your approximate budget per meal or day. Helps suggest cost-effective food options.
              </p>
            </div>
            <Badge variant={budget ? "success" : "neutral"}>
              {budget || "Not set"}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="e.g. Rp15.000 per meal / Rp50.000 per day"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-lg border border-[--color-outline-variant] bg-[--color-surface-container-lowest] px-4 py-2.5 text-sm text-[--color-on-surface] placeholder:text-[--color-outline] outline-none focus:border-[--color-secondary] focus:ring-2 focus:ring-[--color-secondary]/20 transition-all"
            />
            <p className="text-[11px] text-[--color-on-surface-variant]">
              Leave blank to receive general recommendations without cost constraints.
            </p>
          </div>
        </Card>

        {/* Section 3 — Available Foods */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[--color-on-surface]">
                Food Available{" "}
                <span className="text-[--color-outline] font-normal">(optional)</span>
              </h2>
              <p className="text-xs text-[--color-on-surface-variant]">
                What foods or ingredients do you regularly have access to?
              </p>
            </div>
            <Badge variant={availableFoods ? "success" : "neutral"}>
              {availableFoods ? "Set" : "Not set"}
            </Badge>
          </div>
          <textarea
            placeholder="e.g. rice, eggs, tofu, tempe, chicken, vegetables from campus canteen, instant noodles, bread, fruit…"
            value={availableFoods}
            onChange={(e) => setAvailableFoods(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[--color-outline-variant] bg-[--color-surface-container-lowest] px-4 py-2.5 text-sm text-[--color-on-surface] placeholder:text-[--color-outline] outline-none focus:border-[--color-secondary] focus:ring-2 focus:ring-[--color-secondary]/20 transition-all resize-none"
          />
          <p className="text-[11px] text-[--color-on-surface-variant] mt-1.5">
            Separate items with commas. Include campus dining options or dorm kitchen staples.
          </p>
        </Card>

        {/* Section 4 — Dietary Preferences */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[--color-on-surface]">
                Dietary Preferences{" "}
                <span className="text-[--color-outline] font-normal">(optional)</span>
              </h2>
              <p className="text-xs text-[--color-on-surface-variant]">
                Select any restrictions or preferences that apply to you.
              </p>
            </div>
            <Badge variant={preferences.length > 0 ? "success" : "neutral"}>
              {preferences.length > 0 ? `${preferences.length} selected` : "Not set"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {dietaryOptions.map((opt) => {
              const selected = preferences.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => togglePreference(opt.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                    selected
                      ? "border-[--color-secondary] bg-[--color-secondary-container]/20 text-[--color-secondary]"
                      : "border-[--color-outline-variant] bg-[--color-surface-container-lowest] text-[--color-on-surface-variant] hover:border-[--color-outline] hover:text-[--color-on-surface]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" size="lg" className="flex-1">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Context
          </Button>
          {hasAnyContext && (
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset All
            </Button>
          )}
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[--color-secondary-container]/20 rounded-xl text-[--color-secondary] text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Context saved successfully.
          </div>
        )}
      </form>

      {/* Preview */}
      {hasAnyContext && (
        <Card variant="low">
          <p className="text-xs font-semibold uppercase tracking-wider text-[--color-on-surface-variant] mb-3">
            Context Preview
          </p>
          <div className="flex flex-col gap-2">
            {situation && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[--color-secondary]">
                  badge
                </span>
                <span className="text-xs text-[--color-on-surface]">
                  <strong>Situation:</strong> {situation}
                </span>
              </div>
            )}
            {budget && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[--color-secondary]">
                  payments
                </span>
                <span className="text-xs text-[--color-on-surface]">
                  <strong>Budget:</strong> {budget}
                </span>
              </div>
            )}
            {availableFoods && (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[--color-secondary] flex-shrink-0">
                  restaurant
                </span>
                <span className="text-xs text-[--color-on-surface]">
                  <strong>Foods:</strong> {availableFoods}
                </span>
              </div>
            )}
            {preferences.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[--color-secondary] flex-shrink-0">
                  checklist
                </span>
                <span className="text-xs text-[--color-on-surface]">
                  <strong>Preferences:</strong>{" "}
                  {preferences
                    .map((p) => dietaryOptions.find((o) => o.id === p)?.label)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
