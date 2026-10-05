export function SmanuLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 60"
      width="240"
      height="60"
      fill="none"
      className={className}
    >
      <g transform="translate(6, 6)">
        {/* Shield backing */}
        <rect width="48" height="48" rx="12" fill="#0F172A" />
        {/* Geometric Leaf S Mark */}
        <path
          d="M 32 14 C 24 14 19 18 19 23 C 19 28 24 29 29 31 C 34 33 36 35 36 38 C 36 43 31 46 24 46 C 18 46 15 43 14 40"
          stroke="#10B981"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 28 14 C 33 16 38 21 38 27 C 33 27 27 24 26 19 Z"
          fill="#06B6D4"
          opacity="0.9"
        />
        <circle cx="20" cy="18" r="2.5" fill="#34D399" />
      </g>
      {/* Wordmark */}
      <text
        x="66"
        y="32"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#0F172A"
        letterSpacing="-0.5"
      >
        SMANU
      </text>
      <rect x="156" y="20" width="56" height="18" rx="4" fill="#ECFDF5" />
      <text
        x="162"
        y="32.5"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="10"
        fontWeight="700"
        fill="#059669"
        letterSpacing="0.5"
      >
        PROTOTYPE
      </text>
      <text
        x="67"
        y="47"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="11"
        fontWeight="500"
        fill="#64748B"
        letterSpacing="0.2"
      >
        SmartNutrition for Students
      </text>
    </svg>
  );
}
