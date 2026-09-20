import { Link } from "react-router-dom";
import { Award, MapPin, Navigation } from "lucide-react";
import type { Ngo } from "@/api/types";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

export interface NgoCardProps {
  ngo: Ngo;
  to?: string;
  distanceKm?: number;
  className?: string;
}

export function NgoCard({ ngo, to, distanceKm, className }: NgoCardProps) {
  const location = [ngo.city, ngo.state].filter(Boolean).join(", ");
  const interactive = Boolean(to);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-card",
        interactive &&
          "cursor-pointer transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={ngo.orgName} src={ngo.certFileUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn("truncate text-base font-semibold text-ink-900", interactive && "group-hover:text-brand-700")}>
              {ngo.orgName}
            </h3>
            {ngo.isVerified && (
              <Badge tone="brand" className="shrink-0">
                <Award className="h-3 w-3" aria-hidden />
                Verified
              </Badge>
            )}
          </div>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /> {location}
            </p>
          )}
        </div>
        {distanceKm !== undefined && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            {distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      {ngo.description && (
        <p className="mt-3 line-clamp-2 text-sm text-ink-500">{ngo.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
        <p className="text-xs text-ink-500">
          <span className="font-medium text-ink-700">{ngo.serviceRadiusKm} km</span> service
          radius
        </p>
        {to ? (
          <Link to={to} className="text-xs font-semibold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            View profile
          </Link>
        ) : (
          <Badge tone="success" dot>
            Accepting donations
          </Badge>
        )}
      </div>
    </div>
  );
}