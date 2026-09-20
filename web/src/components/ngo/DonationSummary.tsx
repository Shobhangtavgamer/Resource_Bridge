import { CalendarClock, MapPin } from "lucide-react";
import type { Donation } from "@/api/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatDate, formatDateTime } from "@/lib/format";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { StatusBadge } from "@/components/ui/StatusBadge";

export interface DonationSummaryProps {
  donation: Donation;
  showActions?: boolean;
}

/** Compact summary of a donation used inside NGO management lists. */
export function DonationSummary({ donation, showActions = false }: DonationSummaryProps) {
  const items = donation.items ?? [];

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-semibold tracking-tight text-ink-900">
              {donation.donationCode}
            </p>
            <StatusBadge status={donation.status} withDot={false} />
          </div>
          <p className="mt-1 text-xs text-ink-500">
            {donation.donor?.city ? `Donor in ${donation.donor.city}` : "Donor location not shared"}
            {donation.ngo ? ` · ${donation.ngo.orgName}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {items.map((item) => {
          const meta = CATEGORY_META[item.category];
          return (
            <span
              key={item.id}
              title={item.title}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
            >
              <meta.icon className="h-3.5 w-3.5" aria-hidden />
              {meta.shortLabel}
              {item.quantity > 1 ? ` ×${item.quantity}` : ""}
            </span>
          );
        })}
        {items.length === 0 && <span className="text-xs text-ink-400">No items listed</span>}
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-ink-500">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
          {donation.pickupAddressLine}
          {donation.city ? `, ${donation.city}` : ""}
        </p>
        {donation.preferredPickupDate && (
          <p className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
            Donor prefers {formatDateTime(donation.preferredPickupDate)}
          </p>
        )}
        {donation.pickup?.scheduledAt && (
          <p className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
            Pickup scheduled {formatDate(donation.pickup.scheduledAt)}
          </p>
        )}
      </div>

      {showActions && (
        <div className="mt-4 border-t border-ink-100 pt-3 text-right">
          <Link
            to={ROUTES.ngo.donation(donation.id)}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Open donation →
          </Link>
        </div>
      )}
    </div>
  );
}