interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "inbox", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[--color-surface-container] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px] text-[--color-on-surface-variant]">
          {icon}
        </span>
      </div>
      <h3 className="text-base font-semibold text-[--color-on-surface] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[--color-on-surface-variant] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
