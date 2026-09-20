import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Truck } from "lucide-react";
import { donationsApi } from "@/api/endpoints";
import type { Donation } from "@/api/types";
import { toApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { DonationSummary } from "@/components/ngo/DonationSummary";

type PendingGroup =
  | "ACCEPTED_BY_NGO"
  | "PICKUP_SCHEDULED"
  | "COLLECTED";

const GROUPS: { key: PendingGroup; title: string; empty: string }[] = [
  {
    key: "ACCEPTED_BY_NGO",
    title: "Need a pickup slot",
    empty: "No donations waiting for a pickup slot.",
  },
  {
    key: "PICKUP_SCHEDULED",
    title: "Pickup scheduled",
    empty: "No scheduled pickups.",
  },
  {
    key: "COLLECTED",
    title: "Collected — needs confirmation",
    empty: "Nothing collected and pending confirmation.",
  },
];

export function NgoPickupsPage() {
  useDocumentTitle("Pickups");
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [slotValue, setSlotValue] = useState<Record<string, string>>({});

  const { data, loading, error, refetch } = useAsync(
    (signal) => donationsApi.listForNgo(signal),
    [],
  );

  const donations = data?.donations ?? [];
  const grouped = (key: PendingGroup) =>
    donations.filter((d) => d.status === key);

  const schedule = async (donation: Donation) => {
    const raw = slotValue[donation.id];
    if (!raw) {
      toast.error("Pick a date & time", "Choose a pickup slot first.");
      return;
    }
    const scheduledAt = new Date(raw).toISOString();
    setBusyId(donation.id);
    try {
      await donationsApi.schedulePickup(donation.id, { scheduledAt });
      toast.success("Pickup scheduled", `${donation.donationCode} now has a pickup slot.`);
      refetch();
    } catch (caught) {
      toast.error("Couldn't schedule pickups", toApiError(caught).message);
    } finally {
      setBusyId(null);
    }
  };

  const run = async (donation: Donation, action: "collect" | "received") => {
    setBusyId(donation.id);
    try {
      if (action === "collect") {
        await donationsApi.collect(donation.id);
        toast.success("Marked as collected", "Confirm receipt to record items as delivered to you.");
      } else {
        await donationsApi.changeStatus(donation.id, "RECEIVED_BY_NGO");
        toast.success("Items received", "You can now record the distribution.");
      }
      refetch();
    } catch (caught) {
      toast.error("Couldn't update pickup", toApiError(caught).message);
    } finally {
      setBusyId(null);
    }
  };

  const hasAny = donations.some((d) => GROUPS.some((g) => g.key === d.status));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pickups"
        title="Manage pickups"
        description="Schedule slots, confirm collection and confirm receipt of donated items."
      />

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load pickups" onRetry={refetch} />
      ) : !hasAny ? (
        <EmptyState
          icon={<Truck className="h-7 w-7" aria-hidden />}
          title="No pickups to manage"
          description="Claim an available donation to schedule its pickup here."
        />
      ) : (
        <div className="space-y-8">
          {GROUPS.map((group) => {
            const items = grouped(group.key);
            if (items.length === 0) return null;
            return (
              <section key={group.key} aria-labelledby={group.key}>
                <h2 id={group.key} className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-900">
                  {group.key === "ACCEPTED_BY_NGO" ? (
                    <ClipboardCheck className="h-5 w-5 text-brand-600" aria-hidden />
                  ) : group.key === "PICKUP_SCHEDULED" ? (
                    <Truck className="h-5 w-5 text-violet-600" aria-hidden />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" aria-hidden />
                  )}
                  {group.title}
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                    {items.length}
                  </span>
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {items.map((donation) => (
                    <div key={donation.id}>
                      <DonationSummary donation={donation} />
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {donation.status === "ACCEPTED_BY_NGO" && (
                          <>
                            <Input
                              type="datetime-local"
                              aria-label={`Pickup slot for ${donation.donationCode}`}
                              className="w-auto"
                              value={slotValue[donation.id] ?? ""}
                              onChange={(event) =>
                                setSlotValue((current) => ({
                                  ...current,
                                  [donation.id]: event.target.value,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              leftIcon={<Truck className="h-4 w-4" aria-hidden />}
                              loading={busyId === donation.id}
                              disabled={busyId !== null}
                              onClick={() => schedule(donation)}
                            >
                              Schedule pickup
                            </Button>
                          </>
                        )}
                        {donation.status === "PICKUP_SCHEDULED" && (
                          <Button
                            size="sm"
                            leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
                            loading={busyId === donation.id}
                            disabled={busyId !== null}
                            onClick={() => run(donation, "collect")}
                          >
                            Mark as collected
                          </Button>
                        )}
                        {donation.status === "COLLECTED" && (
                          <Button
                            size="sm"
                            leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
                            loading={busyId === donation.id}
                            disabled={busyId !== null}
                            onClick={() => run(donation, "received")}
                          >
                            Confirm items received
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}