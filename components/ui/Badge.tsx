import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "neutral" | "warning" | "error" | "info";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-[--color-secondary-container] text-[--color-on-secondary-container]":
            variant === "success",
          "bg-[--color-surface-container-high] text-[--color-on-surface-variant]":
            variant === "neutral",
          "bg-amber-100 text-amber-800": variant === "warning",
          "bg-[--color-error-container] text-[--color-on-error-container]": variant === "error",
          "bg-[--color-tertiary-fixed] text-[--color-on-tertiary-fixed-variant]": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
