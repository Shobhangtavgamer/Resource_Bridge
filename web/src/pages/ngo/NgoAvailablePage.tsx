import { useMemo, useState } from "react";
import { HandHeart, MapPin } from "lucide-react";
import { donationsApi } from "@/api/endpoints";
import type { DonationCategory } from "@/api/types";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { toApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/store/auth.store";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { VerificationBanner } from "@/components/ngo/VerificationBanner";

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  ...CATEGORY_ORDER.map((key) => ({ value: key, label: CATEGORY_META[key].label })),
];

export function NgoAvailablePage() {
  useDocumentTitle("Available donations");
  const toast = useToast();
  const user = useCurrentUser();
  const ngo = user?.ngo;
  const verified = Boolean(ngo?.isVerified && !ngo?.suspendedAt);

  const [category, setCategory] = useState("");
  const [claiming, setClaiming] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAsync(
    (signal) => donationsApi.listOpen({}, signal),
    [],
  );

  const donations = useMemo(() => {
    const base = data?.donations ?? [];
    if (!category) return base;
    return base.filter((d) => (d.items ?? []).some((item) => item.category === category));
  }, [data, category]);

  const handleClaim = async (id: string) => {
    setClaiming(id);
    try {
      await donationsApi.claim(id);
      toast.success("Donation claimed", "Schedule the pickup to keep things moving.");
      refetch();
    } catch (caught) {
      toast.error("Couldn't claim donation", toApiError(caught).message);
    } finally {
      setClaiming(null);
    }
  };

  const bannerState = ngo?.suspendedAt ? "suspended" : verified ? "verified" : "pending";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Donations"
        title="Available to claim"
        description="Quality-checked donations waiting for a verified NGO in your area."
        actions={<Badge tone="neutral" dot className="hidden sm:inline-flex">{donations.length} listed</Badge>}
      />

      <VerificationBanner state={bannerState} orgName={ngo?.orgName} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-xs">
          <Select
            label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={CATEGORY_OPTIONS}
          />
        </div>
        <p className="text-sm text-ink-500">
          {donations.length} open donation{donations.length === 1 ? "" : "s"}
          {category ? " matching this category" : ""}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load donations" onRetry={refetch} />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-7 w-7" aria-hidden />}
          title={category ? "No donations in this category" : "Nothing available right now"}
          description={
            category
              ? "Try another category — new donations are added as donors publish them."
              : "New donations appear here the moment a donor publishes them."
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {donations.map((donation) => {
            const categories = [
              ...new Set((donation.items ?? []).map((item) => item.category as DonationCategory)),
            ];
            return (
              <article
                key={donation.id}
                className="flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold tracking-tight text-ink-900">
                      {donation.donationCode}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                      <MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                      Pickup in {donation.city || "a nearby city"}
                      {donation.donor?.city ? ` · donor near ${donation.donor.city}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-ink-400">{formatRelative(donation.createdAt)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {categories.map((key) => {
                    const meta = CATEGORY_META[key];
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-ink-200"
                      >
                        <meta.icon className="h-3.5 w-3.5" aria-hidden />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-4 flex-1 space-y-1 text-xs text-ink-500">
                  <p>
                    {(donation.items ?? []).reduce((sum, item) => sum + item.quantity, 0)} item
                    {(donation.items ?? []).reduce((sum, item) => sum + item.quantity, 0) === 1 ? "" : "s"} total
                  </p>
                  {donation.preferredPickupDate && (
                    <p>Donor prefers pickup by {formatShortDate(donation.preferredPickupDate)}</p>
                  )}
                </div>

                <div className="mt-4 border-t border-ink-100 pt-3">
                  <Button
                    fullWidth
                    size="sm"
                    leftIcon={<HandHeart className="h-4 w-4" aria-hidden />}
                    disabled={!verified}
                    loading={claiming === donation.id}
                    onClick={() => handleClaim(donation.id)}
                  >
                    {verified ? "Claim this donation" : "Verification required"}
                  </Button>
                  {!verified && (
                    <p className="mt-2 text-center text-xs text-ink-400">
                      Claiming unlocks once your NGO is verified.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}