import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="Your Activity"
        title="History"
        subtitle="A record of your past nutrition questions and SMANU responses."
        action={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[--color-surface-container] text-[--color-on-surface-variant] text-xs font-medium">
            <span className="material-symbols-outlined text-[16px]">lock_clock</span>
            Coming in next phase
          </div>
        }
      />

      {/* Info banner */}
      <Card variant="low" className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[--color-secondary] text-[20px] flex-shrink-0 mt-0.5">
          info
        </span>
        <p className="text-xs text-[--color-on-surface-variant]">
          Your question history will be saved and displayed here once you start using Ask SMANU.
          Session history will be available in Phase 2 when authentication is connected.
        </p>
      </Card>

      {/* Empty state */}
      <Card>
        <EmptyState
          icon="receipt_long"
          title="No history yet"
          description="Questions you ask SMANU will appear here. Start by asking your first nutrition question."
          action={
            <Link
              href="/ask-smanu"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[--color-secondary] text-[--color-on-secondary] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Ask SMANU
            </Link>
          }
        />
      </Card>

      {/* What will be here */}
      <Card variant="low">
        <p className="text-xs font-semibold uppercase tracking-wider text-[--color-on-surface-variant] mb-4">
          What you&apos;ll see here
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "history", title: "Past Questions", desc: "All questions you have submitted to SMANU." },
            { icon: "article", title: "AI Responses", desc: "Structured answers with source citations." },
            { icon: "bookmark", title: "Saved Answers", desc: "Bookmark responses to review later." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-1.5 p-3 rounded-lg bg-[--color-surface-container-lowest]">
              <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px]">
                {item.icon}
              </span>
              <p className="text-sm font-semibold text-[--color-on-surface]">{item.title}</p>
              <p className="text-xs text-[--color-on-surface-variant]">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
