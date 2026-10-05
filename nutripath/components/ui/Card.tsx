import { clsx } from "clsx";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "low" | "filled";
  padding?: "sm" | "md" | "lg" | "none";
}

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl shadow-sm",
        {
          "bg-[--color-surface-container-lowest]": variant === "default",
          "bg-[--color-surface-container-low]": variant === "low",
          "bg-[--color-surface-container]": variant === "filled",
          "p-3": padding === "sm",
          "p-4": padding === "md",
          "p-6 md:p-8": padding === "lg",
          "p-0": padding === "none",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
