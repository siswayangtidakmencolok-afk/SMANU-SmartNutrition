interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div className="flex flex-col gap-1">
        {badge && (
          <span className="text-xs text-[--color-secondary] font-semibold uppercase tracking-wider">
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-[2rem] leading-tight font-semibold text-[--color-on-surface] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[--color-on-surface-variant]">{subtitle}</p>
        )}
      </div>
      {action && <div className="self-start sm:self-auto">{action}</div>}
    </div>
  );
}
