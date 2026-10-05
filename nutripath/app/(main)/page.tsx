import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const knowledgeTopics = [
  {
    id: "nutrition-basics",
    label: "Fundamentals",
    title: "Nutrition Basics",
    desc: "Macronutrients, micronutrients, and daily energy balance.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4_xhMZUHUsrtu4J49rfK1lD8Diw53z6_mhgPCwAapfsD3ZhlTS1RMd1XcjwVtFCGSOhnPmUuqRKxuubtmgjLGTB23-5xEzq3VIod1XoMfGgWtGJw4pDT3RBzM12U9pwgfJ9Od1IH8MfPYr0PGcMleo-NfDWFmyRJ4ywvReJ7ShPqmkLN-uMNs-YjZYfuwP8MqLl43BvhURGq03ll7vpcC3B4QopR18RKrUJzzJQlFDqjb-7j8mpq2bg",
  },
  {
    id: "hydration",
    label: "Wellness",
    title: "Hydration",
    desc: "Daily fluids, electrolytes, and focus benefits.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDokmBnYHi2Ic_u0ydRXzupJ05RGD8K803wEpfrftCAq55TemP-8aOlYem89VMfp0meWUt6LvLyDiCqUOvbuBkdg_oo1f_WHcSmWeJR96zS2tnAQbTeGQZXKlgqVBcR6C2KTg5NIyzRKlemEA2rcKqeuLVgkUvtSNbIcWp4BgH_4inZLsWTvou2GJ1deiD0R9Ua3kojuk0BmaYM1ZD_Ge6HK9KehQSbi_iwGN_oT_AB-_Tm4UdgNLG4XQ",
  },
  {
    id: "food-choices",
    label: "Lifestyle",
    title: "Food Choices",
    desc: "Building plates with accessible campus cafeteria staples.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1Q-3EdSXm0YUU3KJkqJxZeCBYFLp9eB1qnJqCfdxkh2iGmMoPKiYlAJhm9pn3KSCTmz2DaGPcuPbkzHuiuF9U3qc8PqLfAJtpAxyXY7lecDnvoMhwT5yMaUAYO8YxtOs6ok6g7vZeSES0WXR-t_2T4dSndacJ96SjrGUb7wbNzRcoYheVGKJDKmUnkkRX6ao0SjLn7JP_dmH5we8AmY4e0R31Cl7Sm1H07IjN_wsTj2cB65zcyjuuMA",
  },
  {
    id: "food-labels",
    label: "Practical Skills",
    title: "Food Labels",
    desc: "Serving sizes, daily values %, and hidden sugars.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCa75cS2cUFHSvjEpeUbYIrdzjXFnJ9Rj30VFm_N6pvFUrdtbd625gNfN9-ExuO5DblAE-dTZ6ZPHugg0YMKYbLaqi_ttkTmhg5Hx4HZc1KmXmE7-c1YEOBaAO49Zy_K7zPAnP_L5rwhbkx4vsfvssRSS-TusOOFSp4wujUyVlOcbvDDpNM4S-rGq-DZzhmba4dajYusXG-Z3rIa3gueKXx8qYFXzoV4vbU4VTsYHm66zm7W-X10LGGNQ",
  },
  {
    id: "student-meals",
    label: "Quick Recipes",
    title: "Student Meals",
    desc: "Nutritious combinations using dormitory supplies.",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCjtvvpr25li5JQiJxBFy0Q3GEF-xWEKaIYDI4IYkPLsD83d3_-Cn7irz3rFHnDynC37GKEEWx3_8Z7IvZLlNonPHewZ4pGzeeOFmwN2gr-P8gzdi8siD0ADsS_eNdWJzwnlytSw2_VBQMGOYxy0W6VJO3zKp6bB0ujbZY7_Spd1qwGyPuUms6FRcebMpTxSKWCuB9gzu1Fbk_0iAzpXYOov_skDjSpgRIE7l0vwZU62FtcRvGUfJqBfQ",
  },
];

const quickActions = [
  {
    href: "/ask-smanu",
    icon: "help_outline",
    title: "Ask a Question",
    desc: "Get an explanation based on the available nutrition knowledge.",
    cta: "Start prompt",
    status: "Available",
    available: true,
  },
  {
    href: null,
    icon: "balance",
    title: "Compare Food",
    desc: "Compare food options using information available in the knowledge base.",
    cta: "Vector schema indexing",
    status: "Planned",
    available: false,
  },
  {
    href: "/nutrition-knowledge",
    icon: "school",
    title: "Learn Nutrition",
    desc: "Explore basic nutrition topics and scientific concepts.",
    cta: "Explore curriculum",
    status: "Available",
    available: true,
  },
  {
    href: "/nutrition-knowledge",
    icon: "qr_code_scanner",
    title: "Understand Labels",
    desc: "Learn how to read common nutrition label information.",
    cta: "Read guide",
    status: "Available",
    available: true,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[--color-secondary] font-semibold uppercase tracking-wider">
              SMANU Student Hub
            </span>
            <span className="w-1 h-1 rounded-full bg-[--color-outline-variant]" />
            <span className="text-xs text-[--color-on-surface-variant]">Term 2 Active</span>
          </div>
          <h1 className="text-2xl sm:text-[2rem] leading-tight font-semibold text-[--color-on-surface] tracking-tight">
            Good morning, Student.
          </h1>
          <p className="text-sm text-[--color-on-surface-variant]">
            Let&apos;s make your nutrition questions easier to understand.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/ask-smanu"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[--color-primary] text-[--color-on-primary] text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px] text-[--color-secondary-container]">
              psychology
            </span>
            Ask SMANU
          </Link>
          <Link
            href="/nutrition-knowledge"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm font-medium shadow-sm hover:bg-[--color-surface-container-high] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[--color-on-surface-variant]">
              menu_book
            </span>
            Explore Knowledge
          </Link>
        </div>
      </div>

      {/* ── AI Assistant teaser card ───────────────────────────────────────── */}
      <Card padding="lg" className="relative overflow-hidden">
        <div className="flex flex-col gap-4 max-w-3xl relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[--color-secondary-container]/30 flex items-center justify-center text-[--color-secondary]">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[--color-on-surface]">
                  How can SMANU help?
                </h2>
                <p className="text-xs text-[--color-on-surface-variant]">
                  Ask questions grounded in academic nutrition science, tailored to your context.
                </p>
              </div>
            </div>
            <Badge variant="success">Astra DB Vector RAG</Badge>
          </div>

          {/* Input teaser — links to full Ask SMANU page */}
          <Link
            href="/ask-smanu"
            className="flex items-center gap-3 px-4 py-3 bg-[--color-surface-container-low] rounded-xl hover:bg-[--color-surface-container] transition-colors group"
          >
            <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px]">
              search
            </span>
            <span className="text-sm text-[--color-outline] flex-1">
              Ask a nutrition question…
            </span>
            <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[18px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>

          {/* Suggested prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[--color-on-surface-variant] font-medium">Suggested:</span>
            {["What is protein?", "How do I read a food label?", "Simple balanced lunch ideas"].map(
              (p) => (
                <Link
                  key={p}
                  href={`/ask-smanu?q=${encodeURIComponent(p)}`}
                  className="px-3 py-1.5 rounded-full bg-[--color-surface-container] hover:bg-[--color-surface-container-high] text-[--color-on-surface] text-xs transition-colors"
                >
                  {p}
                </Link>
              )
            )}
          </div>
        </div>
      </Card>

      {/* ── Your Context ──────────────────────────────────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-semibold text-[--color-on-surface]">Your Context</h2>
              <span
                className="material-symbols-outlined text-[16px] text-[--color-on-surface-variant]"
                title="Context influences personalized explanations"
              >
                tune
              </span>
            </div>
            <p className="text-xs text-[--color-on-surface-variant]">
              Parameters used to scale explanations to your real-life environment.
            </p>
          </div>
          <Link
            href="/my-context"
            className="inline-flex items-center gap-1 text-sm text-[--color-on-surface] hover:text-[--color-secondary] font-semibold transition-colors self-start"
          >
            Update Context
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Situation",
              val: "Not set",
              sub: "Set your current situation",
              icon: "schedule",
              note: "Affects explanation depth",
              href: "/my-context",
            },
            {
              label: "Budget",
              val: "Not set",
              sub: "Cost-effective alternatives default",
              icon: "payments",
              note: "Configure",
              href: "/my-context",
            },
            {
              label: "Food Available",
              val: "Not set",
              sub: "Campus dining & dorm kitchen",
              icon: "restaurant",
              note: "Add staples",
              href: "/my-context",
            },
            {
              label: "Preferences",
              val: "Not set",
              sub: "Allergies, vegetarian, halal",
              icon: "checklist",
              note: "Select preferences",
              href: "/my-context",
            },
          ].map((ctx) => (
            <Card key={ctx.label} className="flex flex-col justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[--color-on-surface-variant] uppercase tracking-wider font-medium">
                    {ctx.label}
                  </span>
                  <Badge variant="neutral">Optional</Badge>
                </div>
                <span className="text-lg text-[--color-outline] font-normal mt-1">{ctx.val}</span>
                <span className="text-xs text-[--color-outline]">{ctx.sub}</span>
              </div>
              <div className="mt-4">
                <Link
                  href={ctx.href}
                  className="text-xs text-[--color-secondary] font-medium hover:underline flex items-center gap-1"
                >
                  {ctx.note}
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[--color-on-surface-variant]">
          <span className="material-symbols-outlined text-[16px] text-[--color-secondary]">lock</span>
          <span className="text-xs">
            Information is kept private and strictly used to tailor nutrition explanations.
          </span>
        </div>
      </section>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[--color-on-surface]">Quick Actions</h2>
          <p className="text-xs text-[--color-on-surface-variant]">
            Direct pathways for fast educational queries and comparison tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const inner = (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        action.available
                          ? "bg-[--color-surface-container] text-[--color-on-surface] group-hover:bg-[--color-primary] group-hover:text-[--color-on-primary]"
                          : "bg-[--color-surface-container] text-[--color-on-surface-variant]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                    </div>
                    <Badge variant={action.available ? "success" : "neutral"}>
                      {action.status}
                    </Badge>
                  </div>
                  <h3
                    className={`text-base font-semibold transition-colors ${
                      action.available
                        ? "text-[--color-on-surface] group-hover:text-[--color-secondary]"
                        : "text-[--color-on-surface]"
                    }`}
                  >
                    {action.title}
                  </h3>
                  <p className="text-xs text-[--color-on-surface-variant] leading-relaxed">
                    {action.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[--color-on-surface-variant]">
                  {action.available ? (
                    <>
                      <span className="text-[--color-on-surface]">{action.cta}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform text-[--color-on-surface]">
                        arrow_forward
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                      <span>{action.cta}</span>
                    </>
                  )}
                </div>
              </>
            );

            return action.href ? (
              <Link
                key={action.title}
                href={action.href}
                className="p-6 bg-[--color-surface-container-lowest] rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={action.title}
                className="p-6 bg-[--color-surface-container-lowest] rounded-xl shadow-sm flex flex-col justify-between opacity-75"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Knowledge Preview ─────────────────────────────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[--color-on-surface]">
              Explore Nutrition Knowledge
            </h2>
            <p className="text-xs text-[--color-on-surface-variant]">
              Core scientific modules cataloged for query indexing and student study.
            </p>
          </div>
          <Link
            href="/nutrition-knowledge"
            className="text-sm text-[--color-secondary] font-semibold flex items-center gap-1 hover:underline self-start"
          >
            View all topics
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {knowledgeTopics.map((topic) => (
            <Link
              key={topic.id}
              href="/nutrition-knowledge"
              className="bg-[--color-surface-container-lowest] rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col gap-1">
                <div className="h-28 rounded-lg overflow-hidden bg-[--color-surface-container] mb-2 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={topic.imgUrl}
                    alt={topic.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[--color-surface]/90 backdrop-blur text-xs font-semibold text-[--color-on-surface]">
                    {topic.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[--color-on-surface] group-hover:text-[--color-secondary] transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-[--color-on-surface-variant] line-clamp-3">{topic.desc}</p>
              </div>
              <div className="mt-3">
                <span className="w-full inline-flex justify-center py-1.5 rounded-lg bg-[--color-surface-container] text-[--color-on-surface] text-xs font-semibold hover:bg-[--color-surface-container-high] transition-colors">
                  View Topic
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How SMANU Works ───────────────────────────────────────────────── */}
      <Card padding="lg">
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-1.5 text-[--color-secondary] text-xs font-semibold uppercase">
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            Transparent Architecture
          </div>
          <h2 className="text-lg font-semibold text-[--color-on-surface]">How SMANU Works</h2>
          <p className="text-xs text-[--color-on-surface-variant]">
            A retrieval-based AI workflow that connects your question with relevant nutrition knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: "01", icon: "badge", title: "Your Context", desc: "Situation, dining setting, dietary parameters, and constraints." },
            { num: "02", icon: "record_voice_over", title: "Your Question", desc: "Student submits a prompt in natural, plain everyday language." },
            { num: "03", icon: "dataset", title: "Relevant Knowledge", desc: "Vector semantic retrieval via Astra DB & Langflow pipelines." },
            { num: "04", icon: "assignment_turned_in", title: "Structured Answer", desc: "Objective explanation backed by clear source citations." },
          ].map((step) => (
            <div key={step.num} className="flex flex-col gap-2 p-4 rounded-lg bg-[--color-surface-container-low]">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[--color-secondary]">{step.num}</span>
                <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px]">
                  {step.icon}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[--color-on-surface]">{step.title}</h3>
              <p className="text-xs text-[--color-on-surface-variant]">{step.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Responsible AI notice ─────────────────────────────────────────── */}
      <aside className="p-4 bg-[--color-surface-container-high] rounded-xl flex items-start gap-3">
        <span className="material-symbols-outlined text-[20px] text-[--color-on-surface] mt-0.5 flex-shrink-0">
          verified_user
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <p className="text-sm text-[--color-on-surface]">
            <strong className="font-semibold">Responsible AI Notice:</strong> SMANU provides
            educational nutrition information and is not a replacement for professional medical or
            nutrition advice.
          </p>
          <Link
            href="/help"
            className="text-xs text-[--color-secondary] hover:underline whitespace-nowrap font-medium flex items-center gap-1 self-start"
          >
            Read AI Policy
            <span className="material-symbols-outlined text-[14px]">launch</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
