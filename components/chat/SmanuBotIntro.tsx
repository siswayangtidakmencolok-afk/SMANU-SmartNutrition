"use client";

import { useEffect, useState } from "react";
import { SmanuBotMascot } from "@/components/chat/SmanuBotMascot";

type MascotMood = "idle" | "attentive" | "thinking" | "happy" | "concerned";

interface SmanuBotIntroProps {
  mood: MascotMood;
  lookAtInput: boolean;
}

export function SmanuBotIntro({ mood, lookAtInput }: SmanuBotIntroProps) {
  const [launched, setLaunched] = useState(false);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLaunched(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  function handleFlightEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (
      event.target === event.currentTarget &&
      ["smanu-bot-flight", "smanu-bot-flight-fallback", "smanu-bot-flight-reduced"].includes(event.animationName)
    ) {
      setArrived(true);
    }
  }

  return (
    <section
      aria-label="Perkenalan SMANU"
      className={`smanu-bot-intro relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-r from-white via-emerald-50/70 to-teal-50/60 p-4 shadow-[0_8px_28px_rgba(16,185,129,0.07)] sm:flex-row sm:gap-4 sm:p-5${launched ? " smanu-bot-intro--launching" : ""}${arrived ? " smanu-bot-intro--arrived" : ""}`}
    >
      <div className="smanu-bot-flight-stage relative h-[136px] w-[184px] shrink-0" aria-hidden="true">
        <div className="smanu-bot-intro-glow absolute inset-3 rounded-full bg-emerald-300/30 blur-2xl" />

        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 184 136" fill="none">
          <path
            className="smanu-bot-flight-guide"
            d="M5 127C10 31 164 8 100 68"
          />
          <path
            className="smanu-bot-flight-trail"
            d="M5 127C10 31 164 8 100 68"
          />
          <path
            className="smanu-bot-wind-streak"
            d="M4 122C23 103 29 86 43 75M11 132C32 114 40 95 56 85"
          />
          <circle className="smanu-bot-pressure-ring smanu-bot-pressure-ring--one" cx="12" cy="116" r="13" />
          <circle className="smanu-bot-pressure-ring smanu-bot-pressure-ring--two" cx="12" cy="116" r="13" />
          <g className="smanu-bot-energy">
            <circle cx="27" cy="100" r="2" />
            <circle cx="40" cy="119" r="1.5" />
            <circle cx="58" cy="81" r="1.5" />
            <circle cx="23" cy="76" r="1.5" />
          </g>
        </svg>

        <span className="smanu-bot-falling-leaf smanu-bot-falling-leaf--one">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 4C10 3 4 7 4 14c0 3 2 5 5 5 7 0 11-7 11-15Z" fill="#22c55e" />
            <path d="M4 20c4-5 8-8 13-12" stroke="#dcfce7" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
        <span className="smanu-bot-falling-leaf smanu-bot-falling-leaf--two">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 4C10 3 4 7 4 14c0 3 2 5 5 5 7 0 11-7 11-15Z" fill="#4ade80" />
            <path d="M4 20c4-5 8-8 13-12" stroke="#dcfce7" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
        <span className="smanu-bot-falling-leaf smanu-bot-falling-leaf--three">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 4C10 3 4 7 4 14c0 3 2 5 5 5 7 0 11-7 11-15Z" fill="#86efac" />
            <path d="M4 20c4-5 8-8 13-12" stroke="#f0fdf4" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>

        <div
          className={`smanu-bot-flight absolute left-0 top-0 h-[76px] w-[76px]${arrived ? " smanu-bot-flight--arrived" : ""}`}
          onAnimationEnd={handleFlightEnd}
        >
          <SmanuBotMascot
            className="h-full w-full"
            mood={mood}
            lookAtInput={lookAtInput}
            animated={arrived}
            decorative
          />
        </div>
      </div>

      <div className="smanu-bot-intro-copy relative z-10 min-w-0 text-center sm:text-left">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
          Asisten Nutrisi SMANU
        </p>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Halo! Saya SMANU.
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Siap membantu memahami kebutuhan nutrisi dan pilihan makananmu hari ini.
        </p>
      </div>
    </section>
  );
}
