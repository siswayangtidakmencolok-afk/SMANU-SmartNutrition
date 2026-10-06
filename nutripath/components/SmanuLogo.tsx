/**
 * SmanuLogo — Two variants:
 *
 * <SmanuLogo />              → compact horizontal wordmark for sidebar (default)
 * <SmanuLogo variant="full" /> → full emblem + wordmark for splash/about pages
 * <SmanuLogo variant="icon" /> → emblem only (no wordmark) for tight spaces
 */

interface SmanuLogoProps {
  variant?: "sidebar" | "full" | "icon";
  className?: string;
}

export function SmanuLogo({ variant = "sidebar", className = "" }: SmanuLogoProps) {
  if (variant === "full") return <SmanuLogoFull className={className} />;
  if (variant === "icon") return <SmanuLogoIcon className={className} />;
  return <SmanuLogoSidebar className={className} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SIDEBAR variant  — compact horizontal, fits w-72 sidebar header
   Emblem (60×60) + wordmark inline
───────────────────────────────────────────────────────────────────────────── */
function SmanuLogoSidebar({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 52"
      width="260"
      height="52"
      fill="none"
      className={className}
      aria-label="SMANU SmartNutrition"
    >
      <defs>
        <linearGradient id="sb-navy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="sb-leaf" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="sb-tech" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* ── Emblem badge (52×52) ── */}
      <g transform="translate(26, 26)">
        {/* Outer ring */}
        <circle cx="0" cy="0" r="24" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
        {/* Tech orbital arc */}
        <path
          d="M -22 5 A 24 24 0 1 1 19 14"
          fill="none"
          stroke="url(#sb-tech)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="44 8"
        />
        <circle cx="19" cy="14" r="2.5" fill="#06B6D4" />
        {/* Inner groove */}
        <circle cx="0" cy="0" r="20" fill="none" stroke="#F1F5F9" strokeWidth="2" />

        {/* Leaf (right side) */}
        <path
          d="M 0 -14 C 10 -14 17 -6 15 4 C 14 11 8 15 0 14 C 6 9 9 1 5 -7 C 3 -11 1 -13 0 -14 Z"
          fill="url(#sb-leaf)"
        />
        {/* Spoon cutout on leaf */}
        <path
          d="M 7 -6 C 11 -6 12 -2 12 2 C 12 6 9 8 7 8 C 5 8 5 6 5 2 C 5 -3 6 -6 7 -6 Z"
          fill="white"
          opacity="0.9"
        />
        {/* Fork prongs */}
        <line x1="6" y1="-5" x2="6" y2="-1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="-5" x2="8" y2="0" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />

        {/* Brain left side */}
        <path
          d="M -2 -14 C -10 -14 -15 -9 -14 -4 C -15 -1 -16 3 -13 7 C -14 11 -11 15 -6 16 C -4 16 -2 15 -1 14"
          fill="none"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Synaptic dots */}
        <circle cx="-11" cy="-5" r="2" fill="#06B6D4" />
        <circle cx="-12" cy="5" r="2" fill="#06B6D4" />

        {/* Grad cap at top */}
        <g transform="translate(0, -18)">
          <polygon
            points="0,-5 11,-1.5 0,2 -11,-1.5"
            fill="url(#sb-navy)"
            stroke="#10B981"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path d="M -6 0 C -6 3.5 6 3.5 6 0" fill="#0F172A" />
          <circle cx="0" cy="-1.5" r="1.5" fill="#34D399" />
        </g>
      </g>

      {/* ── Wordmark ── */}
      <text
        x="60"
        y="22"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="19"
        fontWeight="900"
        fill="#0F172A"
        letterSpacing="-0.5"
      >
        SMANU
      </text>
      {/* Tagline */}
      <text
        x="61"
        y="37"
        fontFamily="'Inter', system-ui, sans-serif"
        fontSize="10"
        fontWeight="500"
        fill="#475569"
        letterSpacing="0.3"
      >
        SmartNutrition for Students
      </text>
      {/* Prototype pill */}
      <rect x="170" y="26" width="56" height="15" rx="7.5" fill="#ECFDF5" />
      <text
        x="198"
        y="37"
        fontFamily="'Inter', system-ui, sans-serif"
        fontSize="8.5"
        fontWeight="700"
        fill="#059669"
        letterSpacing="0.5"
        textAnchor="middle"
      >
        PROTOTYPE
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ICON variant  — emblem only, no wordmark
───────────────────────────────────────────────────────────────────────────── */
function SmanuLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      width="52"
      height="52"
      fill="none"
      className={className}
      aria-label="SMANU"
    >
      <defs>
        <linearGradient id="ic-navy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="ic-leaf" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="ic-tech" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <g transform="translate(26, 26)">
        <circle cx="0" cy="0" r="24" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M -22 5 A 24 24 0 1 1 19 14" fill="none" stroke="url(#ic-tech)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="44 8" />
        <circle cx="19" cy="14" r="2.5" fill="#06B6D4" />
        <circle cx="0" cy="0" r="20" fill="none" stroke="#F1F5F9" strokeWidth="2" />
        <path d="M 0 -14 C 10 -14 17 -6 15 4 C 14 11 8 15 0 14 C 6 9 9 1 5 -7 C 3 -11 1 -13 0 -14 Z" fill="url(#ic-leaf)" />
        <path d="M 7 -6 C 11 -6 12 -2 12 2 C 12 6 9 8 7 8 C 5 8 5 6 5 2 C 5 -3 6 -6 7 -6 Z" fill="white" opacity="0.9" />
        <line x1="6" y1="-5" x2="6" y2="-1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="-5" x2="8" y2="0" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M -2 -14 C -10 -14 -15 -9 -14 -4 C -15 -1 -16 3 -13 7 C -14 11 -11 15 -6 16 C -4 16 -2 15 -1 14" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-11" cy="-5" r="2" fill="#06B6D4" />
        <circle cx="-12" cy="5" r="2" fill="#06B6D4" />
        <g transform="translate(0, -18)">
          <polygon points="0,-5 11,-1.5 0,2 -11,-1.5" fill="url(#ic-navy)" stroke="#10B981" strokeWidth="1" strokeLinejoin="round" />
          <path d="M -6 0 C -6 3.5 6 3.5 6 0" fill="#0F172A" />
          <circle cx="0" cy="-1.5" r="1.5" fill="#34D399" />
        </g>
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FULL variant  — complete emblem + full wordmark, untuk about/splash pages
   Adapted from the 800×600 Figma spec, scaled down cleanly
───────────────────────────────────────────────────────────────────────────── */
function SmanuLogoFull({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      width="800"
      height="600"
      fill="none"
      className={className}
      aria-label="SMANU SmartNutrition"
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>
        <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="premiumShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#0F172A" floodOpacity="0.10" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#059669" floodOpacity="0.12" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      {/* Emblem */}
      <g transform="translate(400, 215)" filter="url(#premiumShadow)">
        <circle cx="0" cy="0" r="148" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="3" />
        <path d="M -140 30 A 148 148 0 1 1 120 85" fill="none" stroke="url(#techGrad)" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="280 40" />
        <circle cx="120" cy="85" r="5" fill="#06B6D4" />
        <circle cx="0" cy="0" r="126" fill="none" stroke="#F1F5F9" strokeWidth="5" />

        {/* Brain left */}
        <path d="M -16 -88 C -52 -88 -76 -68 -72 -42 C -70 -38 -68 -34 -65 -30 C -82 -24 -92 -6 -88 16 C -86 28 -78 38 -68 44 C -72 58 -64 74 -50 82 C -38 90 -22 92 -14 90" fill="none" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -34 -58 C -48 -54 -54 -40 -46 -28 C -40 -20 -30 -22 -20 -24" fill="none" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M -46 -8 C -62 -4 -64 14 -50 22 C -40 28 -28 22 -18 18" fill="none" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M -42 42 C -52 48 -48 64 -34 68 C -26 70 -18 64 -14 56" fill="none" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="-52" cy="-35" r="4.5" fill="#06B6D4" />
        <line x1="-52" y1="-35" x2="-36" y2="-44" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="-58" cy="10" r="4.5" fill="#06B6D4" />
        <line x1="-58" y1="10" x2="-40" y2="6" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="-42" cy="55" r="4.5" fill="#06B6D4" />
        <line x1="-42" y1="55" x2="-28" y2="48" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />

        {/* Center axis */}
        <line x1="0" y1="-85" x2="0" y2="88" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" />

        {/* Leaf right */}
        <path d="M 0 -85 C 65 -85 105 -35 95 25 C 88 68 50 92 0 88 C 35 55 58 10 35 -45 C 22 -66 10 -78 0 -85 Z" fill="url(#leafGrad)" />
        <path d="M 45 -40 C 65 -40 76 -20 74 5 C 72 24 58 35 44 35 C 32 35 30 24 32 8 C 34 -15 36 -40 45 -40 Z" fill="#FFFFFF" opacity="0.95" />
        <line x1="40" y1="-28" x2="40" y2="-8" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
        <line x1="46" y1="-28" x2="46" y2="-4" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
        <line x1="52" y1="-28" x2="52" y2="-8" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
        <path d="M 38 -6 Q 46 0 54 -6 L 46 22" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 12 18 C 38 18 58 38 52 68 C 36 68 18 52 12 18 Z" fill="#10B981" opacity="0.85" />
        <path d="M 16 30 Q 32 44 42 58" fill="none" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />

        {/* Grad cap */}
        <g transform="translate(0, -96)">
          <polygon points="0,-26 58,-8 0,10 -58,-8" fill="url(#navyGrad)" stroke="#10B981" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M -30 -1 C -30 16 30 16 30 -1" fill="#0F172A" />
          <path d="M 0 -8 L 38 2 Q 44 14 42 26" fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="28" r="3.5" fill="#06B6D4" />
          <circle cx="0" cy="-8" r="4" fill="#34D399" />
        </g>
      </g>

      {/* Typography */}
      <g transform="translate(400, 440)" textAnchor="middle">
        <text x="0" y="32" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="52" fontWeight="900" fill="#0F172A" letterSpacing="-1.5">
          SMANU
        </text>
        <circle cx="120" cy="5" r="6" fill="#10B981" />
        <path d="M 120 5 Q 128 -4 133 2" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
        <text x="0" y="66" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="15" fontWeight="800" fill="#059669" letterSpacing="5">
          SMART NUTRITION
        </text>
        <g transform="translate(-180, 88)">
          <rect width="360" height="30" rx="15" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="24" cy="15" r="4" fill="#06B6D4" />
          <text x="180" y="20" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#475569" letterSpacing="1">
            STUDENT NUTRITION &amp; AI UTILITY
          </text>
          <circle cx="336" cy="15" r="4" fill="#10B981" />
        </g>
      </g>
    </svg>
  );
}
