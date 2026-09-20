import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  id?: string;
  className?: string;
  size?: "sm" | "md";
}

/** Small, accessible segmented picker (used for filters and role selection). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  id,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <p id={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </p>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? id : undefined}
        className={cn(
          "inline-flex w-full rounded-xl border border-ink-300 bg-ink-100/60 p-1",
          size === "sm" ? "gap-0.5" : "gap-1",
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg font-semibold transition-all",
                size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
                selected
                  ? "bg-white text-brand-700 shadow-sm ring-1 ring-ink-200"
                  : "text-ink-600 hover:text-ink-900",
              )}
            >
              {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}