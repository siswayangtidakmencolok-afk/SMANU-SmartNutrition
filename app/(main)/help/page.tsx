import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const faqs = [
  {
    q: "What is SMANU?",
    a: "SMANU (SmartNutrition) is an educational AI assistant that helps students understand nutrition through context-aware, evidence-based explanations. It is not a medical service.",
  },
  {
    q: "Can I use SMANU for medical decisions?",
    a: "No. SMANU is strictly for educational purposes. For medical conditions, dietary therapy, or health concerns, always consult a qualified healthcare professional or registered dietitian.",
  },
  {
    q: "How does SMANU generate answers?",
    a: "SMANU uses a Retrieval-Augmented Generation (RAG) approach. It retrieves relevant information from a curated nutrition knowledge base and uses that to generate grounded, cited responses — not generic AI guessing.",
  },
  {
    q: "Is my data stored?",
    a: "Context you enter (situation, foods, budget, preferences) is stored only for your current session and is never shared. No personal health data is collected.",
  },
  {
    q: "Why does SMANU say 'Coming soon' for some features?",
    a: "SMANU is currently in Phase 1 (UI Foundation). Features like full RAG responses, authentication, and history require backend integration planned for Phase 2.",
  },
  {
    q: "What are the limitations of SMANU?",
    a: "SMANU is limited to its nutrition knowledge base. It cannot diagnose health conditions, does not have access to your medical history, and may not cover every dietary scenario. Responses should be treated as educational starting points.",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="Help Center"
        title="Help & Responsible AI"
        subtitle="Guidance on using SMANU safely and understanding its limitations."
      />

      {/* Responsible AI notice */}
      <div className="rounded-xl border border-[--color-outline-variant] bg-[--color-primary-container] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[--color-on-primary] text-[20px]">
            verified_user
          </span>
          <h2 className="text-sm font-bold text-[--color-on-primary]">Responsible AI Policy</h2>
        </div>
        <ul className="flex flex-col gap-2">
          {[
            "SMANU is an educational tool, not a medical service.",
            "Responses are grounded in a curated knowledge base, not free-form AI generation.",
            "No personal health data, medical history, or identification is collected.",
            "Always consult a healthcare professional for medical decisions.",
            "SMANU does not guarantee the completeness or suitability of any nutritional advice for your specific health condition.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[--color-on-primary]">
              <span className="material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5 opacity-80">
                check_circle
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-sm font-semibold text-[--color-on-surface] mb-3 uppercase tracking-wider">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <p className="text-sm font-semibold text-[--color-on-surface] mb-1.5">{faq.q}</p>
              <p className="text-sm text-[--color-on-surface-variant] leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact / support */}
      <Card variant="low" className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[--color-secondary] text-[20px] flex-shrink-0 mt-0.5">
          support
        </span>
        <div>
          <p className="text-sm font-semibold text-[--color-on-surface]">Need more help?</p>
          <p className="text-xs text-[--color-on-surface-variant] mt-0.5">
            This is a prototype application. For questions or feedback about SMANU, refer to the
            project documentation or contact the development team.
          </p>
          <Link
            href="/about"
            className="text-xs text-[--color-secondary] font-medium hover:underline mt-2 inline-flex items-center gap-1"
          >
            Learn more about SMANU
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
