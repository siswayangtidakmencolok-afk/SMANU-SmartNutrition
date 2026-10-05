"use client";

import { useState, useRef } from "react";
import { SmanuLogo } from "@/components/SmanuLogo";
import { clsx } from "clsx";

// ── Types ──────────────────────────────────────────────────────────────────────
type NavPath =
  | "dashboard"
  | "ask-smanu"
  | "nutrition-knowledge"
  | "my-context"
  | "history"
  | "about-smanu"
  | "how-it-works"
  | "settings"
  | "help-notice";

type PrototypeState = "normal" | "loading" | "empty-context" | "retrieval-error" | "service-down";

// ── Knowledge topics data ──────────────────────────────────────────────────────
const knowledgeTopics = [
  {
    id: "nutrition-basics",
    label: "Fundamentals",
    title: "Nutrition Basics",
    desc: "Macronutrients, micronutrients, and daily energy balance.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4_xhMZUHUsrtu4J49rfK1lD8Diw53z6_mhgPCwAapfsD3ZhlTS1RMd1XcjwVtFCGSOhnPmUuqRKxuubtmgjLGTB23-5xEzq3VIod1XoMfGgWtGJw4pDT3RBzM12U9pwgfJ9Od1IH8MfPYr0PGcMleo-NfDWFmyRJ4ywvReJ7ShPqmkLN-uMNs-YjZYfuwP8MqLl43BvhURGq03ll7vpcC3B4QopR18RKrUJzzJQlFDqjb-7j8mpq2bg",
    imgAlt: "Overhead photograph of natural whole food ingredients",
  },
  {
    id: "hydration",
    label: "Wellness",
    title: "Hydration",
    desc: "Daily fluids, electrolytes, and focus benefits.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDokmBnYHi2Ic_u0ydRXzupJ05RGD8K803wEpfrftCAq55TemP-8aOlYem89VMfp0meWUt6LvLyDiCqUOvbuBkdg_oo1f_WHcSmWeJR96zS2tnAQbTeGQZXKlgqVBcR6C2KTg5NIyzRKlemEA2rcKqeuLVgkUvtSNbIcWp4BgH_4inZLsWTvou2GJ1deiD0R9Ua3kojuk0BmaYM1ZD_Ge6HK9KehQSbi_iwGN_oT_AB-_Tm4UdgNLG4XQ",
    imgAlt: "A clean clear glass of fresh water with lemon slice",
  },
  {
    id: "food-choices",
    label: "Lifestyle",
    title: "Food Choices",
    desc: "Building plates with accessible campus cafeteria staples.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1Q-3EdSXm0YUU3KJkqJxZeCBYFLp9eB1qnJqCfdxkh2iGmMoPKiYlAJhm9pn3KSCTmz2DaGPcuPbkzHuiuF9U3qc8PqLfAJtpAxyXY7lecDnvoMhwT5yMaUAYO8YxtOs6ok6g7vZeSES0WXR-t_2T4dSndacJ96SjrGUb7wbNzRcoYheVGKJDKmUnkkRX6ao0SjLn7JP_dmH5we8AmY4e0R31Cl7Sm1H07IjN_wsTj2cB65zcyjuuMA",
    imgAlt: "Vibrant balanced student meal bowl",
  },
  {
    id: "label-topic",
    label: "Practical Skills",
    title: "Food Labels",
    desc: "Serving sizes, daily values %, and hidden sugars.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCa75cS2cUFHSvjEpeUbYIrdzjXFnJ9Rj30VFm_N6pvFUrdtbd625gNfN9-ExuO5DblAE-dTZ6ZPHugg0YMKYbLaqi_ttkTmhg5Hx4HZc1KmXmE7-c1YEOBaAO49Zy_K7zPAnP_L5rwhbkx4vsfvssRSS-TusOOFSp4wujUyVlOcbvDDpNM4S-rGq-DZzhmba4dajYusXG-Z3rIa3gueKXx8qYFXzoV4vbU4VTsYHm66zm7W-X10LGGNQ",
    imgAlt: "A student holding a cereal box inspecting the nutrition facts panel",
  },
  {
    id: "student-meals",
    label: "Quick Recipes",
    title: "Student Meals",
    desc: "Nutritious combinations using dormitory supplies.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCjtvvpr25li5JQiJxBFy0Q3GEF-xWEKaIYDI4IYkPLsD83d3_-Cn7irz3rFHnDynC37GKEEWx3_8Z7IvZLlNonPHewZ4pGzeeOFmwN2gr-P8gzdi8siD0ADsS_eNdWJzwnlytSw2_VBQMGOYxy0W6VJO3zKp6bB0ujbZY7_Spd1qwGyPuUms6FRcebMpTxSKWCuB9gzu1Fbk_0iAzpXYOov_skDjSpgRIE7l0vwZU62FtcRvGUfJqBfQ",
    imgAlt: "A simple practical meal prep setup in a dorm kitchenette",
  },
];

// ── Nav items ──────────────────────────────────────────────────────────────────
const mainNavItems: { path: NavPath; icon: string; label: string }[] = [
  { path: "dashboard", icon: "grid_view", label: "Dashboard" },
  { path: "ask-smanu", icon: "smart_toy", label: "Ask SMANU" },
  { path: "nutrition-knowledge", icon: "menu_book", label: "Nutrition Knowledge" },
  { path: "my-context", icon: "badge", label: "My Context" },
  { path: "history", icon: "receipt_long", label: "History" },
  { path: "about-smanu", icon: "info", label: "About SMANU" },
  { path: "how-it-works", icon: "explore", label: "How It Works" },
];

const bottomNavItems: { path: NavPath; icon: string; label: string }[] = [
  { path: "settings", icon: "settings", label: "Settings" },
  { path: "help-notice", icon: "policy", label: "Help & Responsible AI" },
];

// ── Suggested prompts ──────────────────────────────────────────────────────────
const suggestedPrompts = [
  "What is protein?",
  "How do I read a food label?",
  "Simple balanced lunch ideas",
];

// ── Mock AI responses ──────────────────────────────────────────────────────────
function getMockResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("protein")) {
    return "<strong>Protein</strong> is an essential macronutrient constructed from amino acids. For students with active campus schedules, it supports muscle repair, immune resilience, and sustained satiety between academic lectures. Peer-reviewed reference: Dietary Guidelines 2020–2025.";
  }
  if (q.includes("label")) {
    return "When reading a <strong>Nutrition Facts label</strong>, begin with the serving size to gauge metric accuracy. Next, check % Daily Value (%DV): 5% or less is low, while 20% or more is high. Prioritize fiber and micronutrients while monitoring added sugars.";
  }
  return "A <strong>balanced student plate</strong> typically combines complex carbohydrates (e.g. brown rice, oats), lean proteins (beans, eggs, tofu), and dietary fiber from accessible fresh or frozen greens to prevent afternoon energy dips.";
}

// ══════════════════════════════════════════════════════════════════════════════
export default function SmanuDashboard() {
  const [activePath, setActivePath] = useState<NavPath>("dashboard");
  const [protoState, setProtoState] = useState<PrototypeState>("normal");
  const [queryInput, setQueryInput] = useState("");
  const [aiPanelVisible, setAiPanelVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultHtml, setAiResultHtml] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Context state (driven by prototype state switcher) ───────────────────
  const situationVal = protoState === "empty-context" ? "Not set" : "School Day";
  const situationBadge = protoState === "empty-context" ? "Unconfigured" : "Active";
  const situationSub =
    protoState === "empty-context"
      ? "Using global reference model"
      : "Campus schedule with study blocks";
  const situationActive = protoState !== "empty-context";

  // ── Derived booleans ─────────────────────────────────────────────────────
  const inputDisabled = protoState === "loading" || protoState === "service-down";

  // ── Handlers ─────────────────────────────────────────────────────────────
  function fillPrompt(text: string) {
    setQueryInput(text);
    inputRef.current?.focus();
  }

  function handleQuerySubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = queryInput.trim();
    if (!query || inputDisabled) return;

    setAiPanelVisible(true);
    setAiLoading(true);
    setAiResultHtml("");

    setTimeout(() => {
      setAiLoading(false);
      setAiResultHtml(getMockResponse(query));
    }, 750);
  }

  function navClick(path: NavPath) {
    setActivePath(path);
    setSidebarOpen(false);
  }

  // ── State alert content ──────────────────────────────────────────────────
  function renderStateAlert() {
    if (protoState === "normal") return null;
    if (protoState === "loading") {
      return (
        <div className="mb-4 p-4 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex items-center gap-4 text-[--color-on-surface]">
          <span className="material-symbols-outlined animate-spin text-[--color-secondary]">sync</span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Simulating Background Knowledge Synchronisation</span>
            <span className="text-xs text-[--color-on-surface-variant]">
              Astra DB vector indices are refreshing knowledge chunks for Term 2.
            </span>
          </div>
        </div>
      );
    }
    if (protoState === "empty-context") {
      return (
        <div className="mb-4 p-4 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex items-center justify-between text-[--color-on-surface]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[--color-outline]">person_alert</span>
            <div>
              <p className="text-sm font-semibold">Student Context Empty</p>
              <p className="text-xs text-[--color-on-surface-variant]">
                No custom parameters provided. SMANU is responding with general collegiate guidelines.
              </p>
            </div>
          </div>
          <button
            onClick={() => setProtoState("normal")}
            className="px-3 py-1.5 rounded-lg bg-[--color-surface-container] text-sm font-semibold hover:bg-[--color-surface-container-high] transition-colors"
          >
            Reset to Default
          </button>
        </div>
      );
    }
    if (protoState === "retrieval-error") {
      return (
        <div className="mb-4 p-4 bg-[--color-error-container] rounded-xl shadow-sm flex items-center justify-between text-[--color-on-error-container]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[--color-error]">database</span>
            <div>
              <p className="text-sm font-semibold">Knowledge Retrieval Disruption</p>
              <p className="text-xs opacity-90">
                Could not retrieve embeddings from Astra DB cluster. Cached baseline answers will be served.
              </p>
            </div>
          </div>
          <button
            onClick={() => setProtoState("normal")}
            className="px-3 py-1.5 rounded-lg bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm font-semibold shadow-sm hover:bg-[--color-surface-container-low] transition-colors"
          >
            Retry Pipeline
          </button>
        </div>
      );
    }
    if (protoState === "service-down") {
      return (
        <div className="mb-4 p-4 bg-[--color-surface-container] rounded-xl shadow-sm flex items-center justify-between text-[--color-on-surface]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[--color-error]">cloud_off</span>
            <div>
              <p className="text-sm font-semibold">Langflow AI Service Unavailable</p>
              <p className="text-xs text-[--color-on-surface-variant]">
                The inference engine is currently undergoing maintenance. Static knowledge exploration remains
                fully active.
              </p>
            </div>
          </div>
          <a
            href="#knowledge-section"
            className="px-3 py-1.5 rounded-lg bg-[--color-primary] text-[--color-on-primary] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Browse Knowledge
          </a>
        </div>
      );
    }
    return null;
  }

  // ── Sidebar nav link ─────────────────────────────────────────────────────
  function NavLink({
    path,
    icon,
    label,
  }: {
    path: NavPath;
    icon: string;
    label: string;
  }) {
    const isActive = activePath === path;
    return (
      <button
        onClick={() => navClick(path)}
        className={clsx(
          "w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-all text-left",
          isActive
            ? "bg-[--color-primary-container] text-[--color-on-primary] font-semibold shadow-sm"
            : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span className="text-sm">{label}</span>
      </button>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-[--color-surface] font-[family-name:--font-body-md] text-[--color-on-surface] antialiased">
      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <aside
        className={clsx(
          "fixed left-0 top-0 h-full w-72 bg-[--color-surface-container-lowest] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top scrollable area */}
        <div className="flex flex-col flex-1 overflow-y-auto sidebar-scroll">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center">
            <SmanuLogo className="h-8 w-auto" />
          </div>

          {/* Section label */}
          <div className="px-4 py-2">
            <div className="px-2 py-1 text-xs text-[--color-on-surface-variant] tracking-wider uppercase font-semibold">
              Academic Hub
            </div>
          </div>

          {/* Main nav */}
          <nav className="flex flex-col gap-1 px-4">
            {mainNavItems.map((item) => (
              <NavLink key={item.path} path={item.path} icon={item.icon} label={item.label} />
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col p-4 bg-[--color-surface-container-low]/50">
          <nav className="flex flex-col gap-1 mb-4">
            {bottomNavItems.map((item) => (
              <NavLink key={item.path} path={item.path} icon={item.icon} label={item.label} />
            ))}
          </nav>

          {/* User card */}
          <div className="flex items-center gap-2 p-2 bg-[--color-surface-container-lowest] rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[--color-secondary-container] flex items-center justify-center text-[--color-on-secondary-container] text-sm font-bold">
                S
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[--color-secondary-container] ring-2 ring-[--color-surface-container-lowest]" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <span className="text-sm font-semibold text-[--color-on-surface] truncate">Student User</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[--color-secondary]" />
                <span className="text-xs text-[--color-secondary] font-medium truncate">Student • Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT WRAPPER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* ── Top Header ──────────────────────────────────────────────────── */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[--color-surface]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px] hidden sm:block">
              school
            </span>
            <div className="flex items-center gap-1 text-sm text-[--color-on-surface-variant]">
              <span className="font-medium">SMANU Portal</span>
              <span className="opacity-50">/</span>
              <span className="text-[--color-on-surface] font-semibold">Student Nutrition Assistant</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-[--color-surface-container] text-[--color-on-surface-variant] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[--color-secondary-container] animate-pulse" />
              <span>Prototype v0.1 • Astra DB + Langflow RAG Ready</span>
            </div>
            <div className="h-4 w-px bg-[--color-surface-container-highest]" />
            <div className="flex items-center gap-1">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface] transition-colors"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface] transition-colors"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[--color-error]" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-[--color-secondary-container] flex items-center justify-center text-[--color-on-secondary-container] text-sm font-bold ring-1 ring-[--color-surface-container-highest]">
              S
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            PAGE CONTENT
        ══════════════════════════════════════════════════════════════════ */}
        <main className="w-full pt-16 bg-[--color-surface] flex-1">
          <div className="flex flex-col w-full px-4 sm:px-6 py-6 max-w-7xl mx-auto">

            {/* ── Prototype State Switcher ─────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[--color-surface-container] rounded-xl shadow-sm mb-6">
              <div className="flex items-center gap-1 text-[--color-on-surface-variant]">
                <span className="material-symbols-outlined text-[18px]">developer_mode</span>
                <span className="text-xs uppercase tracking-wider font-semibold">Prototype State Switcher</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "normal", label: "Normal" },
                    { id: "loading", label: "Loading State" },
                    { id: "empty-context", label: "Empty Context" },
                    { id: "retrieval-error", label: "Retrieval Error" },
                    { id: "service-down", label: "AI Service Unavailable" },
                  ] as { id: PrototypeState; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setProtoState(s.id)}
                    className={clsx(
                      "px-3 py-1 rounded-md text-xs font-medium transition-all",
                      protoState === s.id
                        ? "bg-[--color-primary] text-[--color-on-primary] shadow-sm"
                        : "bg-[--color-surface-container-lowest] text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high]"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── State Alerts ──────────────────────────────────────────────── */}
            {renderStateAlert()}

            {/* ── Dashboard Page Header ─────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[--color-secondary] font-semibold uppercase tracking-wider">
                    SMANU Student Hub
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[--color-outline-variant]" />
                  <span className="text-xs text-[--color-on-surface-variant]">Term 2 Active</span>
                </div>
                <h1 className="text-2xl sm:text-[2rem] leading-tight font-semibold text-[--color-on-surface] tracking-tight font-[family-name:--font-headline-lg]">
                  Good morning, Student.
                </h1>
                <p className="text-sm text-[--color-on-surface-variant]">
                  Let&apos;s make your nutrition questions easier to understand.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <a
                  href="#assistant-card"
                  className="inline-flex items-center gap-1 px-5 py-2.5 rounded-lg bg-[--color-primary] text-[--color-on-primary] text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px] text-[--color-secondary-container]">
                    psychology
                  </span>
                  <span>Ask SMANU</span>
                </a>
                <a
                  href="#knowledge-section"
                  className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm font-medium shadow-sm hover:bg-[--color-surface-container-high] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-[--color-on-surface-variant]">
                    menu_book
                  </span>
                  <span>Explore Knowledge</span>
                </a>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                AI ASSISTANT CARD
            ══════════════════════════════════════════════════════════════ */}
            <section
              id="assistant-card"
              className="bg-[--color-surface-container-lowest] rounded-xl p-6 md:p-8 shadow-sm mb-12 relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col gap-4 max-w-4xl">
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[--color-secondary-container]/30 flex items-center justify-center text-[--color-secondary]">
                      <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                        How can SMANU help?
                      </h2>
                      <p className="text-xs text-[--color-on-surface-variant]">
                        Ask questions grounded in academic nutrition science and tailored to your student context.
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[--color-surface-container] text-[--color-on-surface-variant] text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-[--color-secondary]" />
                    <span>Astra DB Vector RAG</span>
                  </div>
                </div>

                {/* Search form */}
                <form
                  onSubmit={handleQuerySubmit}
                  className="flex flex-col sm:flex-row gap-1 mt-1 bg-[--color-surface-container-low] p-1.5 rounded-xl shadow-sm focus-within:shadow-md transition-shadow"
                >
                  <div className="relative flex-1 flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[--color-on-surface-variant] text-[20px]">
                      search
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={
                        protoState === "loading"
                          ? "Fetching current vector indices..."
                          : queryInput
                      }
                      onChange={(e) => !inputDisabled && setQueryInput(e.target.value)}
                      disabled={inputDisabled}
                      placeholder="Ask a nutrition question..."
                      className="w-full pl-10 pr-4 py-3 bg-transparent text-[--color-on-surface] text-sm focus:outline-none placeholder:text-[--color-outline] disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={inputDisabled}
                    className="flex items-center justify-center gap-1 px-6 py-3 rounded-lg bg-[--color-secondary] text-[--color-on-secondary] text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Ask SMANU</span>
                  </button>
                </form>

                {/* Suggested prompts */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-xs text-[--color-on-surface-variant] font-medium mr-1">
                    Suggested prompts:
                  </span>
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => fillPrompt(prompt)}
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-[--color-surface-container] hover:bg-[--color-surface-container-high] text-[--color-on-surface] text-xs transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* AI response panel */}
                {aiPanelVisible && (
                  <div className="mt-4 p-4 bg-[--color-surface-container-low] rounded-xl">
                    {aiLoading ? (
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined animate-spin text-[--color-secondary] text-[22px]">
                          progress_activity
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[--color-on-surface]">
                            Retrieving nutrition knowledge vectors…
                          </span>
                          <span className="text-xs text-[--color-on-surface-variant]">
                            Connecting Langflow query pipeline with student context parameters
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[--color-secondary] font-semibold uppercase">
                            Retrieved from Peer-Reviewed Sources
                          </span>
                          <span className="text-xs text-[--color-on-surface-variant]">
                            Verified Reference • Astra DB
                          </span>
                        </div>
                        <p
                          className="text-sm text-[--color-on-surface]"
                          dangerouslySetInnerHTML={{ __html: aiResultHtml }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                YOUR CONTEXT SECTION
            ══════════════════════════════════════════════════════════════ */}
            <section id="context-section" className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <h2 className="text-xl font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                      Your Context
                    </h2>
                    <span
                      className="material-symbols-outlined text-[16px] text-[--color-on-surface-variant]"
                      title="Context influences personalized explanations"
                    >
                      tune
                    </span>
                  </div>
                  <p className="text-xs text-[--color-on-surface-variant]">
                    Parameters used by the Langflow pipeline to scale explanations to your real-life environment.
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-[--color-on-surface] hover:text-[--color-secondary] font-semibold transition-colors self-start sm:self-auto"
                >
                  <span>Update Context</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>

              {/* Context cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Situation */}
                <div className="p-4 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[--color-on-surface-variant] uppercase tracking-wider">
                        Situation
                      </span>
                      <span
                        className={clsx(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
                          situationActive
                            ? "bg-[--color-secondary-container] text-[--color-on-secondary-container]"
                            : "bg-[--color-surface-container] text-[--color-outline]"
                        )}
                      >
                        {situationBadge}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        "text-xl font-semibold mt-1 font-[family-name:--font-headline-sm]",
                        situationActive ? "text-[--color-on-surface]" : "text-[--color-outline] font-normal"
                      )}
                    >
                      {situationVal}
                    </span>
                    <span className="text-xs text-[--color-on-surface-variant]">{situationSub}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[--color-on-surface-variant] text-xs">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>High mental endurance focus</span>
                  </div>
                </div>

                {/* Budget */}
                <div className="p-4 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[--color-on-surface-variant] uppercase tracking-wider">
                        Budget
                      </span>
                      <span className="text-xs text-[--color-outline]">Optional</span>
                    </div>
                    <span className="text-xl text-[--color-outline] mt-1 font-normal font-[family-name:--font-headline-sm]">
                      Not set
                    </span>
                    <span className="text-xs text-[--color-outline]">Cost-effective alternatives default</span>
                  </div>
                  <div className="mt-4">
                    <a
                      href="#"
                      className="text-xs text-[--color-secondary] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Configure</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                </div>

                {/* Food Available */}
                <div className="p-4 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[--color-on-surface-variant] uppercase tracking-wider">
                        Food Available
                      </span>
                      <span className="text-xs text-[--color-outline]">Optional</span>
                    </div>
                    <span className="text-xl text-[--color-outline] mt-1 font-normal font-[family-name:--font-headline-sm]">
                      Not set
                    </span>
                    <span className="text-xs text-[--color-outline]">Campus dining &amp; dorm kitchen</span>
                  </div>
                  <div className="mt-4">
                    <a
                      href="#"
                      className="text-xs text-[--color-secondary] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Add Staples</span>
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </a>
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-4 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[--color-on-surface-variant] uppercase tracking-wider">
                        Preferences
                      </span>
                      <span className="text-xs text-[--color-outline]">Optional</span>
                    </div>
                    <span className="text-xl text-[--color-outline] mt-1 font-normal font-[family-name:--font-headline-sm]">
                      Not set
                    </span>
                    <span className="text-xs text-[--color-outline]">Allergies, vegetarian, halal</span>
                  </div>
                  <div className="mt-4">
                    <a
                      href="#"
                      className="text-xs text-[--color-secondary] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Select</span>
                      <span className="material-symbols-outlined text-[14px]">checklist</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Privacy note */}
              <div className="mt-2 flex items-center gap-1 text-[--color-on-surface-variant]">
                <span className="material-symbols-outlined text-[16px] text-[--color-secondary]">lock</span>
                <span className="text-xs">
                  Information is kept private and strictly used to tailor nutrition explanations.
                </span>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                QUICK ACTIONS
            ══════════════════════════════════════════════════════════════ */}
            <section className="mb-12">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                  Quick Actions
                </h2>
                <p className="text-xs text-[--color-on-surface-variant]">
                  Direct pathways for fast educational queries and comparison tasks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ask a Question */}
                <a
                  href="#assistant-card"
                  className="p-6 bg-[--color-surface-container-lowest] rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-[--color-surface-container] flex items-center justify-center text-[--color-on-surface] group-hover:bg-[--color-primary] group-hover:text-[--color-on-primary] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">help_outline</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[--color-secondary-container]/50 text-[--color-secondary]">
                        Available
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[--color-on-surface] group-hover:text-[--color-secondary] transition-colors font-[family-name:--font-headline-sm]">
                      Ask a Question
                    </h3>
                    <p className="text-xs text-[--color-on-surface-variant] leading-relaxed">
                      Get an explanation based on the available nutrition knowledge.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[--color-on-surface]">
                    <span>Start prompt</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </a>

                {/* Compare Food (planned) */}
                <div className="p-6 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex flex-col justify-between opacity-80">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-[--color-surface-container] flex items-center justify-center text-[--color-on-surface-variant]">
                        <span className="material-symbols-outlined text-[20px]">balance</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[--color-surface-container-high] text-[--color-on-surface-variant]">
                        Planned
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                      Compare Food
                    </h3>
                    <p className="text-xs text-[--color-on-surface-variant] leading-relaxed">
                      Compare food options using information available in the knowledge base.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs text-[--color-on-surface-variant]">
                    <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                    <span>Vector schema indexing</span>
                  </div>
                </div>

                {/* Learn Nutrition */}
                <a
                  href="#knowledge-section"
                  className="p-6 bg-[--color-surface-container-lowest] rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-[--color-surface-container] flex items-center justify-center text-[--color-on-surface] group-hover:bg-[--color-primary] group-hover:text-[--color-on-primary] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[--color-secondary-container]/50 text-[--color-secondary]">
                        Available
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[--color-on-surface] group-hover:text-[--color-secondary] transition-colors font-[family-name:--font-headline-sm]">
                      Learn Nutrition
                    </h3>
                    <p className="text-xs text-[--color-on-surface-variant] leading-relaxed">
                      Explore basic nutrition topics and scientific concepts.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[--color-on-surface]">
                    <span>Explore curriculum</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </a>

                {/* Understand Labels */}
                <a
                  href="#label-topic"
                  className="p-6 bg-[--color-surface-container-lowest] rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-[--color-surface-container] flex items-center justify-center text-[--color-on-surface] group-hover:bg-[--color-primary] group-hover:text-[--color-on-primary] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[--color-secondary-container]/50 text-[--color-secondary]">
                        Available
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[--color-on-surface] group-hover:text-[--color-secondary] transition-colors font-[family-name:--font-headline-sm]">
                      Understand Labels
                    </h3>
                    <p className="text-xs text-[--color-on-surface-variant] leading-relaxed">
                      Learn how to read common nutrition label information.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[--color-on-surface]">
                    <span>Read guide</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </a>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KNOWLEDGE PREVIEW
            ══════════════════════════════════════════════════════════════ */}
            <section id="knowledge-section" className="mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                    Explore Nutrition Knowledge
                  </h2>
                  <p className="text-xs text-[--color-on-surface-variant]">
                    Core scientific modules cataloged for query indexing and student study.
                  </p>
                </div>
                <a
                  href="#"
                  className="text-sm text-[--color-secondary] font-semibold flex items-center gap-1 hover:underline self-start sm:self-auto"
                >
                  <span>View all topics</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {knowledgeTopics.map((topic) => (
                  <div
                    key={topic.id}
                    id={topic.id}
                    className="bg-[--color-surface-container-lowest] rounded-xl p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="h-28 rounded-lg overflow-hidden bg-[--color-surface-container] mb-2 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={topic.imgUrl}
                          alt={topic.imgAlt}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[--color-surface]/90 backdrop-blur text-xs font-semibold text-[--color-on-surface]">
                          {topic.label}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-[--color-on-surface-variant] line-clamp-3">{topic.desc}</p>
                    </div>
                    <div className="mt-4 pt-1">
                      <button className="w-full py-2 rounded-lg bg-[--color-surface-container] text-[--color-on-surface] text-xs font-semibold hover:bg-[--color-surface-container-high] transition-colors">
                        View Topic
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW SMANU WORKS
            ══════════════════════════════════════════════════════════════ */}
            <section className="bg-[--color-surface-container-lowest] rounded-xl p-6 md:p-8 shadow-sm mb-12">
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-1 text-[--color-secondary] text-xs font-semibold uppercase">
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>Transparent Architecture</span>
                </div>
                <h2 className="text-xl font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                  How SMANU Works
                </h2>
                <p className="text-xs text-[--color-on-surface-variant]">
                  SMANU uses a retrieval-based AI workflow to connect your question with relevant nutrition
                  knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    num: "01",
                    icon: "badge",
                    title: "Your Context",
                    desc: "Current situation, dining setting, dietary parameters, and constraints.",
                  },
                  {
                    num: "02",
                    icon: "record_voice_over",
                    title: "Your Question",
                    desc: "Student submits a prompt or curiosity in natural, plain everyday language.",
                  },
                  {
                    num: "03",
                    icon: "dataset",
                    title: "Relevant Knowledge",
                    desc: "Vector semantic retrieval executed via Astra DB & Langflow pipelines.",
                  },
                  {
                    num: "04",
                    icon: "assignment_turned_in",
                    title: "Structured Answer",
                    desc: "Objective, easy-to-understand explanation backed by clear source citations.",
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="flex flex-col gap-1 p-4 rounded-lg bg-[--color-surface-container-low]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[--color-secondary] font-[family-name:--font-headline-md]">
                        {step.num}
                      </span>
                      <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px]">
                        {step.icon}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[--color-on-surface-variant]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                AI TRANSPARENCY CARD
            ══════════════════════════════════════════════════════════════ */}
            <section className="bg-[--color-surface-container-low] rounded-xl p-6 shadow-sm mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[--color-on-surface] font-[family-name:--font-headline-sm]">
                    How your answer is generated
                  </h3>
                  <p className="text-xs text-[--color-on-surface-variant]">
                    A strictly grounded chain that avoids generative hallucination by prioritizing indexed
                    evidence.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[--color-surface-container-lowest] text-[--color-on-surface-variant] text-xs self-start">
                  <span className="material-symbols-outlined text-[--color-secondary] text-[16px]">verified</span>
                  <span>Astra DB RAG Protocol</span>
                </div>
              </div>

              {/* Flow diagram */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 bg-[--color-surface-container-lowest] rounded-xl shadow-sm mb-4">
                {[
                  { n: "1", label: "Your Question", last: false },
                  { n: "2", label: "Knowledge Retrieval", last: false },
                  { n: "3", label: "Relevant Context", last: false },
                  { n: "4", label: "AI Response", last: true },
                ].map((item) => (
                  <div
                    key={item.n}
                    className={clsx(
                      "p-3 rounded-lg flex items-center justify-between",
                      item.last
                        ? "bg-[--color-secondary-container]/20"
                        : "bg-[--color-surface]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          item.last
                            ? "bg-[--color-secondary] text-[--color-on-secondary]"
                            : "bg-[--color-surface-container] text-[--color-on-surface]"
                        )}
                      >
                        {item.n}
                      </span>
                      <span
                        className={clsx(
                          "text-sm text-[--color-on-surface]",
                          item.last && "font-semibold"
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                    {item.last ? (
                      <span className="material-symbols-outlined text-[--color-secondary] text-[18px]">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[--color-on-surface-variant] hidden md:block text-[18px]">
                        arrow_forward
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 text-[--color-on-surface-variant]">
                <span className="material-symbols-outlined text-[18px] text-[--color-secondary]">info</span>
                <span className="text-xs">
                  SMANU is an educational prototype. Responses depend on the available knowledge base.
                </span>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                RESPONSIBLE AI NOTICE
            ══════════════════════════════════════════════════════════════ */}
            <aside className="mb-8 p-4 bg-[--color-surface-container-high] rounded-xl shadow-sm flex items-start gap-3 text-[--color-on-surface-variant]">
              <span className="material-symbols-outlined text-[20px] text-[--color-on-surface] mt-0.5 flex-shrink-0">
                verified_user
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <p className="text-sm text-[--color-on-surface]">
                  <strong className="font-semibold">Responsible AI Notice:</strong> SMANU provides educational
                  nutrition information and is not a replacement for professional medical or nutrition advice.
                </p>
                <a
                  href="#"
                  className="text-xs text-[--color-secondary] hover:underline whitespace-nowrap font-medium flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Read AI Policy</span>
                  <span className="material-symbols-outlined text-[14px]">launch</span>
                </a>
              </div>
            </aside>

          </div>
        </main>
      </div>
    </div>
  );
}
