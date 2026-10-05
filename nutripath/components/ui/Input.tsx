import { clsx } from "clsx";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: string; // material symbol name
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[--color-on-surface-variant] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 text-[--color-on-surface-variant] text-[18px] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-lg border bg-[--color-surface-container-lowest] text-[--color-on-surface] text-sm placeholder:text-[--color-outline] transition-all outline-none",
              "focus:border-[--color-secondary] focus:ring-2 focus:ring-[--color-secondary]/20",
              error
                ? "border-[--color-error]"
                : "border-[--color-outline-variant] hover:border-[--color-outline]",
              icon ? "pl-9 pr-4 py-2.5" : "px-4 py-2.5",
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-xs text-[--color-on-surface-variant]">{hint}</p>
        )}
        {error && <p className="text-xs text-[--color-error]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
