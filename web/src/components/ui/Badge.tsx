import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "brand" | "accent" | "success" | "danger" | "info" | "neutral";
  dot?: boolean;
}

const tones = {
  default: "bg-ink-100 text-ink-700 ring-ink-200",
  brand: "bg-brand-100 text-brand-800 ring-brand-200",
  accent: "bg-accent-100 text-accent-800 ring-accent-200",
  success: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  danger: "bg-red-100 text-red-800 ring-red-200",
  info: "bg-sky-100 text-sky-800 ring-sky-200",
  neutral: "bg-white text-ink-600 ring-ink-200",
};

const dotColors = {
  default: "bg-ink-500",
  brand: "bg-brand-600",
  accent: "bg-accent-600",
  success: "bg-emerald-600",
  danger: "bg-red-600",
  info: "bg-sky-600",
  neutral: "bg-ink-400",
};

export function Badge({ className, tone = "default", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[tone])} aria-hidden />}
      {children}
    </span>
  );
}