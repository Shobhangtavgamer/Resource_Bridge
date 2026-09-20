import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({
  className,
  label = "Loading…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-2 text-ink-500", className)}
    >
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden />
      <span className="text-sm">{label}</span>
    </span>
  );
}

export function FullPageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-50">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" aria-hidden />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}