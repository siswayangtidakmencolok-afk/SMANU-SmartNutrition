import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

const settingSections = [
  {
    title: "Appearance",
    icon: "palette",
    items: [
      { label: "Theme", value: "System default", status: "Coming soon" },
      { label: "Language", value: "English", status: "Coming soon" },
      { label: "Font size", value: "Medium", status: "Coming soon" },
    ],
  },
  {
    title: "Notifications",
    icon: "notifications",
    items: [
      { label: "Study reminders", value: "Off", status: "Coming soon" },
      { label: "Knowledge base updates", value: "Off", status: "Coming soon" },
    ],
  },
  {
    title: "Privacy & Data",
    icon: "lock",
    items: [
      { label: "Context storage", value: "Session only", status: "Coming soon" },
      { label: "Usage analytics", value: "Off", status: "Coming soon" },
      { label: "Export my data", value: "—", status: "Coming soon" },
    ],
  },
  {
    title: "Account",
    icon: "account_circle",
    items: [
      { label: "Profile", value: "Student User", status: "Coming soon" },
      { label: "Authentication", value: "Not connected", status: "Phase 2" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="Preferences"
        title="Settings"
        subtitle="Manage your SMANU preferences and account options."
      />

      <Card variant="low" className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[--color-secondary] text-[20px] flex-shrink-0 mt-0.5">
          info
        </span>
        <p className="text-xs text-[--color-on-surface-variant]">
          Settings configuration will be available in a future release. Options shown below reflect
          the planned feature set.
        </p>
      </Card>

      <div className="flex flex-col gap-4">
        {settingSections.map((section) => (
          <Card key={section.title}>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px]">
                {section.icon}
              </span>
              <h2 className="text-sm font-semibold text-[--color-on-surface]">{section.title}</h2>
            </div>
            <div className="flex flex-col divide-y divide-[--color-outline-variant]/50">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-[--color-on-surface]">{item.label}</span>
                    <span className="text-xs text-[--color-on-surface-variant]">{item.value}</span>
                  </div>
                  <Badge variant={item.status === "Phase 2" ? "info" : "neutral"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
