import { Link } from "react-router-dom";
import { CalendarClock, MapPin } from "lucide-react";
import type { Donation } from "@/api/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { cn, pluralize } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Avatar } from "./Avatar";
import { CATEGORY_TINTS } from "../illustrations/CategoryIllustration";

export interface DonationCardProps {
  donation: Donation;
  to: string;
  /** Who is viewing the card — changes which side details are shown. */
  perspective?: "donor" | "ngo" | "open";
  className?: string;
}

export function DonationCard({ donation, to, perspective = "open", className }: DonationCardProps) {
  const items = donation.items ?? [];
  const visibleItems = items.slice(0, 3);
  const extraCount = items.length - visibleItems.length;
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const firstCategory = visibleItems[0]?.category;
  const accent = firstCategory ? CATEGORY_TINTS[firstCategory].deep : undefined;

  return (
    <Link
      to={to}
      className={cn(
        "group flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-card transition-all",
        "hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        accent && "border-l-4",
        className,
      )}
      style={accent ? { borderLeftColor: accent } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold tracking-tight text-ink-900">
            {donation.donationCode}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /> {donation.city}
          </p>
        </div>
        <StatusBadge status={donation.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {visibleItems.map((item) => {
          const meta = CATEGORY_META[item.category];
          return (
            <span
              key={item.id}
              title={item.title}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                meta.badge,
              )}
            >
              <meta.icon className="h-3.5 w-3.5" aria-hidden />
              {meta.shortLabel}
              {item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : ""}
            </span>
          );
        })}
        {extraCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 ring-1 ring-inset ring-ink-200">
            +{extraCount} more
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-ink-500">
        <p className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
          {donation.preferredPickupDate
            ? `Preferred pickup: ${formatDate(donation.preferredPickupDate)}`
            : `Listed ${formatDate(donation.createdAt)}`}
        </p>
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
          <span className="line-clamp-2">{donation.pickupAddressLine}</span>
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          {(perspective === "donor" || perspective === "open") && donation.ngo && (
            <>
              <Avatar name={donation.ngo.orgName} size="xs" />
              <span className="truncate text-xs font-medium text-ink-700">
                {donation.ngo.orgName}
              </span>
            </>
          )}
          {perspective === "ngo" && (
            <span className="truncate text-xs text-ink-500">
              {pluralize(itemCount, "item")}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-brand-700 group-hover:underline">
          View details
        </span>
      </div>
    </Link>
  );
}