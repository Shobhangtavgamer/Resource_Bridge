import type { LucideIcon } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useCountUp } from "@/hooks/useCountUp";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
  accent?: "brand" | "accent" | "ink" | "sky" | "emerald" | "indigo";
  /** Count from 0 up to the numeric value when it scrolls into view. */
  animate?: boolean;
}

const accents = {
  brand: "bg-brand-50 text-brand-600",
  accent: "bg-accent-50 text-accent-600",
  ink: "bg-ink-100 text-ink-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export function StatCard({ label, value, icon: Icon, hint, loading, accent = "brand", animate = false }: StatCardProps) {
  const { ref: countRef, value: displayValue } = useCountUp(
    typeof value === "number" && animate ? value : 0,
  );

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p
              ref={countRef}
              className="mt-1 font-display text-3xl font-semibold text-ink-900"
            >
              {animate && typeof value === "number" ? displayValue : value}
            </p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
        </div>
        {Icon && !loading && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}