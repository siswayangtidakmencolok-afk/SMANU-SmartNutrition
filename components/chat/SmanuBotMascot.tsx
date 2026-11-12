"use client";

import { useEffect, useId, useState } from "react";

type MascotMood = "idle" | "attentive" | "thinking" | "happy" | "concerned";
type MascotMotion = "idle" | "blink" | "nod" | "tilt" | "leaves";
type MascotLook = "center" | "left" | "right" | "input";

interface SmanuBotMascotProps {
  className?: string;
  mood?: MascotMood;
  lookAtInput?: boolean;
  animated?: boolean;
  decorative?: boolean;
}

export function SmanuBotMascot({
  className = "",
  mood = "idle",
  lookAtInput = false,
  animated = true,
  decorative = false,
}: SmanuBotMascotProps) {
  const [motion, setMotion] = useState<MascotMotion>("idle");
  const [pointerLook, setPointerLook] = useState<Exclude<MascotLook, "input">>("center");
  const gradientId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let active = true;
    let idleTimer = 0;
    let motionTimer = 0;

    function scheduleMotion() {
      idleTimer = window.setTimeout(() => {
        if (!active) return;
        if (document.visibilityState === "hidden") {
          scheduleMotion();
          return;
        }

        const motions: MascotMotion[] = ["blink", "blink", "nod", "tilt", "leaves"];
        const nextMotion = motions[Math.floor(Math.random() * motions.length)];
        const duration = nextMotion === "blink" ? 260 : nextMotion === "leaves" ? 1500 : 1000;

        setMotion(nextMotion);
        motionTimer = window.setTimeout(() => {
          if (!active) return;
          setMotion("idle");
          scheduleMotion();
        }, duration);
      }, 2600 + Math.random() * 3900);
    }

    scheduleMotion();
    return () => {
      active = false;
      window.clearTimeout(idleTimer);
      window.clearTimeout(motionTimer);
    };
  }, [animated]);

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (event.pointerType !== "mouse" || lookAtInput) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    setPointerLook(relativeX < 0.38 ? "left" : relativeX > 0.62 ? "right" : "center");
  }

  const look: MascotLook = lookAtInput ? "input" : pointerLook;
  const mouth = mood === "thinking"
    ? "M104 116a6 6 0 1 0 12 0a6 6 0 1 0-12 0"
    : mood === "concerned"
      ? "M101 121q9-9 18 0"
      : mood === "happy"
        ? "M98 112q12 18 24 0"
        : "M100 113q10 13 20 0";

  return (
    <svg
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Maskot SMANU, asisten nutrisi"}
      aria-hidden={decorative || undefined}
      className={`smanu-bot-mascot ${className}`}
      viewBox="0 0 220 220"
      fill="none"
      data-mood={mood}
      data-motion={motion}
      data-look={look}
      data-animated={animated}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointerLook("center")}
    >
      <defs>
        <linearGradient id={`${gradientId}-shell`} x1="30" y1="35" x2="190" y2="176" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#d7eee3" />
        </linearGradient>
        <linearGradient id={`${gradientId}-screen`} x1="70" y1="63" x2="150" y2="136" gradientUnits="userSpaceOnUse">
          <stop stopColor="#103d34" />
          <stop offset="1" stopColor="#071e1b" />
        </linearGradient>
        <linearGradient id={`${gradientId}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#86efac" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
        <filter id={`${gradientId}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#065f46" floodOpacity=".16" />
        </filter>
      </defs>

      <g className="smanu-bot-float" filter={`url(#${gradientId}-shadow)`}>
        <ellipse cx="110" cy="194" rx="43" ry="7" fill="#059669" opacity=".12" />

        <g className="smanu-bot-branches" stroke="#528a62" strokeWidth="3" strokeLinecap="round">
          <path d="M62 149c-20-10-24-25-23-40m119 40c20-10 24-25 23-40" />
          <path d="M46 118c-9-9-10-17-8-24m136 24c9-9 10-17 8-24" strokeWidth="2" />
        </g>
        <g className="smanu-bot-shoulder-leaves" fill={`url(#${gradientId}-leaf)`}>
          <path d="M44 111c-15-16-15-28-12-34 14 7 20 18 17 31 8-13 18-17 25-16-4 14-14 22-30 19Zm132 0c15-16 15-28 12-34-14 7-20 18-17 31-8-13-18-17-25-16 4 14 14 22 30 19Z" />
        </g>

        <g className="smanu-bot-body">
          <path d="M72 143h76l13 39c-18 17-84 17-102 0l13-39Z" fill={`url(#${gradientId}-shell)`} stroke="#9ac8ae" strokeWidth="2" />
          <path d="M82 153c13 8 43 8 56 0" stroke="#93d4ad" strokeWidth="3" strokeLinecap="round" />
          <text x="110" y="174" textAnchor="middle" fill="#4d8067" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif">SMANU</text>
          <path d="M88 184c12 7 32 7 44 0" stroke="#7ed9aa" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="smanu-bot-head">
          <g className="smanu-bot-crown">
            <path d="M75 48C61 31 65 17 72 12c12 11 15 21 11 34 9-21 23-28 32-27-1 18-12 31-30 38Z" fill={`url(#${gradientId}-leaf)`} />
            <path d="M98 37c-5-21 4-33 13-36 8 15 7 26-1 38 16-15 32-15 39-10-7 17-21 25-41 24Z" fill="#4caf70" />
            <path d="M129 45c5-18 17-24 26-21 1 14-4 22-16 29 18-5 30 1 34 9-13 10-28 11-43 1Z" fill="#8bd39a" />
            <path d="M76 45c-8-13-8-22-5-28m35 19c4-13 8-20 14-25m19 34c8-7 16-10 23-10" stroke="#c7f3cc" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
          </g>

          <circle cx="45" cy="91" r="13" fill="#d9eee2" stroke="#91bfa1" strokeWidth="2" />
          <circle cx="175" cy="91" r="13" fill="#d9eee2" stroke="#91bfa1" strokeWidth="2" />
          <circle cx="45" cy="91" r="6" fill="#a6cdb2" opacity=".7" />
          <circle cx="175" cy="91" r="6" fill="#a6cdb2" opacity=".7" />

          <path d="M56 59c0-14 11-25 25-25h58c14 0 25 11 25 25v53c0 20-16 36-36 36H92c-20 0-36-16-36-36V59Z" fill={`url(#${gradientId}-shell)`} stroke="#8bbba0" strokeWidth="2.5" />
          <path d="M71 69c0-10 8-18 18-18h42c10 0 18 8 18 18v34c0 14-11 25-25 25H96c-14 0-25-11-25-25V69Z" fill={`url(#${gradientId}-screen)`} stroke="#b2d8be" strokeWidth="3" />
          <path d="M82 58c8-7 16-9 27-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".72" />

          {mood === "concerned" && (
            <g stroke="#c6f8d4" strokeWidth="2" strokeLinecap="round">
              <path d="m88 76 8 2m36-2-8 2" />
            </g>
          )}

          <g className="smanu-bot-eyes">
            <g className="smanu-bot-pupil">
              <ellipse cx="94" cy="88" rx="5.5" ry={mood === "thinking" ? "6.5" : "7.5"} fill="#65f5bd" />
              <circle cx="96" cy="86" r="1.8" fill="#eafff5" />
            </g>
            <g className="smanu-bot-pupil">
              <ellipse cx="126" cy="88" rx="5.5" ry={mood === "thinking" ? "6.5" : "7.5"} fill="#65f5bd" />
              <circle cx="128" cy="86" r="1.8" fill="#eafff5" />
            </g>
          </g>
          <path d={mouth} stroke="#8af5c3" strokeWidth="3" strokeLinecap="round" />
          <path d="M67 106c2 12 9 20 18 25m67-25c-2 12-9 20-18 25" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".35" />
        </g>
      </g>
    </svg>
  );
}
