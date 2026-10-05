"use client";

import { clsx } from "clsx";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, disabled, className, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-secondary] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            // variants
            "bg-[--color-primary] text-[--color-on-primary] hover:opacity-90 shadow-sm":
              variant === "primary",
            "bg-[--color-secondary] text-[--color-on-secondary] hover:opacity-90 shadow-sm":
              variant === "secondary",
            "bg-transparent text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]":
              variant === "ghost",
            "border border-[--color-outline-variant] bg-[--color-surface-container-lowest] text-[--color-on-surface] hover:bg-[--color-surface-container-low]":
              variant === "outline",
            "bg-[--color-error] text-[--color-on-error] hover:opacity-90":
              variant === "danger",
            // sizes
            "text-xs px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2.5": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <span className="material-symbols-outlined text-[16px] animate-spin">
            progress_activity
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
