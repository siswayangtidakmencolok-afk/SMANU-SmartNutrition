interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6">
      <div className="flex flex-col gap-1 min-w-0">
        {badge && (
          <span className="text-[11px] text-[--color-secondary] font-semibold uppercase tracking-wider">
            {badge}
          </span>
        )}
        <h1 className="text-xl sm:text-2xl leading-tight font-semibold text-[--color-on-surface] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[--color-on-surface-variant] leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="self-start sm:self-auto shrink-0">{action}</div>}
    </div>
  );
}
