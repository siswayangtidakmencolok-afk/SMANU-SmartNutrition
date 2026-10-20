"use client";

import { clsx } from "clsx";

interface SituationSelectorProps {
  selected: string;
  onChange: (s: string) => void;
}

const situations = [
  { id: "School Day", icon: "🏫", label: "School Day", desc: "At school or during school hours" },
  { id: "At Home", icon: "🏠", label: "At Home", desc: "Choosing or preparing food at home" },
  { id: "Choosing Food", icon: "🍽️", label: "Choosing Food", desc: "Deciding what to eat right now" },
  { id: "Learning Nutrition", icon: "📚", label: "Learning Nutrition", desc: "Understanding nutrition concepts" },
  { id: "Comparing Food", icon: "⚖️", label: "Comparing Food", desc: "Comparing two or more food options" },
  { id: "Hydration", icon: "💧", label: "Hydration", desc: "Questions about drinks and hydration" },
  { id: "Other", icon: "💬", label: "Other", desc: "Something else" },
];

export function SituationSelector({ selected, onChange }: SituationSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {situations.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={clsx(
            "flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all duration-150",
            selected === s.id
              ? "border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100"
              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
          )}
        >
          <span className="text-2xl leading-none">{s.icon}</span>
          <span
            className={clsx(
              "text-sm font-semibold leading-tight",
              selected === s.id ? "text-emerald-700" : "text-zinc-800"
            )}
          >
            {s.label}
          </span>
          <span className="text-[11px] leading-tight text-zinc-400">{s.desc}</span>
        </button>
      ))}
    </div>
  );
}
