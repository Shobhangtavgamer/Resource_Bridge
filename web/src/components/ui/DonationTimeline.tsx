import type { DonationStatusHistoryEntry } from "@/api/types";
import { ROLE_LABELS } from "@/lib/constants";
import { STATUS_META } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export interface DonationTimelineProps {
  history: DonationStatusHistoryEntry[];
  className?: string;
}

export function DonationTimeline({ history, className }: DonationTimelineProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No status history recorded yet for this donation.
      </p>
    );
  }

  return (
    <ol className={cn("space-y-0", className)}>
      {sorted.map((entry, index) => {
        const isLast = index === sorted.length - 1;
        const meta = entry.toStatus ? STATUS_META[entry.toStatus] : STATUS_META.CREATED;
        return (
          <Reveal as="li" key={entry.id} delay={index * 80} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px bg-ink-200"
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                meta.dot,
                isLast && "scale-110 shadow-sm ring-2 ring-brand-100",
              )}
            >
              {isLast && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-sm font-semibold text-ink-900">
                  {entry.toStatus ? meta.label : "Unknown"}
                </p>
                {entry.fromStatus && (
                  <p className="text-xs text-ink-400">
                    from {STATUS_META[entry.fromStatus].label}
                  </p>
                )}
                {isLast && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    Current
                  </span>
                )}
              </div>
              {entry.comment && (
                <p className="mt-1 text-sm text-ink-500">{entry.comment}</p>
              )}
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-400">
                {ROLE_LABELS[entry.actorRole]} · {formatDateTime(entry.createdAt)}
              </p>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}