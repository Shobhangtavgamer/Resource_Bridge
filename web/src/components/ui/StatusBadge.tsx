import type { DonationStatus } from "@/api/types";
import { STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

export interface StatusBadgeProps {
  status: DonationStatus;
  className?: string;
  withDot?: boolean;
}

export function StatusBadge({ status, className, withDot = true }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <Badge tone="neutral" className={cn(meta.badge, className)} dot={withDot}>
      {meta.label}
    </Badge>
  );
}

/** Icon-friendly tint used on surface icons (e.g. timeline nodes). */
export function statusDotClass(status: DonationStatus): string {
  return STATUS_META[status].dot;
}