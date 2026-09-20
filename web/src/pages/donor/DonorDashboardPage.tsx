import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Package,
  PlusCircle,
  Bell,
  Clock3,
} from "lucide-react";
import { donationsApi } from "@/api/endpoints";
import type { DonationStatus } from "@/api/types";
import { STATUS_META } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { DonationCard } from "@/components/ui/DonationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Stagger } from "@/components/motion/Stagger";

const IN_REVIEW: DonationStatus[] = ["CREATED", "PENDING_VERIFICATION"];
const ACTIVE: DonationStatus[] = [
  "AVAILABLE",
  "ACCEPTED_BY_NGO",
  "PICKUP_SCHEDULED",
  "COLLECTED",
  "RECEIVED_BY_NGO",
  "DISTRIBUTED",
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DonorDashboardPage() {
  useDocumentTitle("Donor dashboard");
  const user = useCurrentUser();

  const { data, loading, error, refetch } = useAsync(
    (signal) => donationsApi.listMine(signal),
    [],
  );

  const donations = data?.donations ?? [];

  const inReview = donations.filter((d) => IN_REVIEW.includes(d.status));
  const active = donations.filter((d) => ACTIVE.includes(d.status));
  const completed = donations.filter((d) => d.status === "COMPLETED");
  const recent = [...donations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const statusesWithCounts: { status: DonationStatus; count: number }[] = [];
  for (const status of IN_REVIEW.concat(ACTIVE).concat(["COMPLETED"])) {
    const count = donations.filter((d) => d.status === status).length;
    if (count > 0) statusesWithCounts.push({ status, count });
  }

  const firstName = user?.fullName?.split(/\s+/)[0] ?? "there";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${greeting()}, ${firstName}`}
        title="Your donations at a glance"
        description="See where every item you've given is, and start something new when you're ready."
        actions={
          <Link to={ROUTES.donor.newDonation}>
            <Button leftIcon={<PlusCircle className="h-4 w-4" aria-hidden />}>
              Create donation
            </Button>
          </Link>
        }
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={60} delay={40}>
        <StatCard
          label="Total donations"
          value={donations.length}
          icon={Package}
          loading={loading}
          accent="ink"
          hint="Everything you've listed"
          animate={!loading}
        />
        <StatCard
          label="In review"
          value={inReview.length}
          icon={Clock3}
          loading={loading}
          accent="accent"
          hint="Draft or awaiting verification"
          animate={!loading}
        />
        <StatCard
          label="Active"
          value={active.length}
          icon={HeartHandshake}
          loading={loading}
          accent="brand"
          hint="On the way to distribution"
          animate={!loading}
        />
        <StatCard
          label="Completed"
          value={completed.length}
          icon={CheckCircle2}
          loading={loading}
          accent="emerald"
          hint="Delivered with proof"
          animate={!loading}
        />
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="recent-donations">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-donations" className="text-base font-semibold text-ink-900">
              Recent donations
            </h2>
            <Link
              to={ROUTES.donor.donations}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState error={error} title="Couldn't load your donations" onRetry={refetch} />
          ) : recent.length > 0 ? (
            <Stagger className="grid gap-4 sm:grid-cols-2" stagger={60} delay={40}>
              {recent.map((donation) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
                  perspective="donor"
                  to={ROUTES.donor.donation(donation.id)}
                />
              ))}
            </Stagger>
          ) : (
            <EmptyState
              icon={<Package className="h-7 w-7" aria-hidden />}
              title="No donations yet"
              description="When you publish your first donation, it will show up here with its live status."
              action={
                <Link to={ROUTES.donor.newDonation}>
                  <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" aria-hidden />}>
                    Create your first donation
                  </Button>
                </Link>
              }
            />
          )}
        </section>

        <section aria-labelledby="status-summary" className="space-y-6">
          <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 id="status-summary" className="text-base font-semibold text-ink-900">
              Where things stand
            </h2>
            {loading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-8 animate-pulse rounded-lg bg-ink-100" />
                ))}
              </div>
            ) : statusesWithCounts.length > 0 ? (
              <ul className="mt-4 space-y-2.5">
                {statusesWithCounts.map(({ status, count }) => {
                  const meta = STATUS_META[status];
                  return (
                    <li key={status} className="flex items-center gap-3">
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} aria-hidden />
                      <span className="flex-1 text-sm text-ink-700">{meta.label}</span>
                      <span className="text-sm font-semibold tabular-nums text-ink-900">{count}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-500">Nothing to report yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <div className="flex items-center gap-2 text-base font-semibold text-brand-900">
              <Bell className="h-5 w-5" aria-hidden />
              Need a reminder to give?
            </div>
            <p className="mt-2 text-sm text-brand-800">
              Your notifications keep you updated on pickups, deliveries and distribution proof.
            </p>
            <Link to={ROUTES.notifications} className="mt-4 inline-block">
              <Button variant="outline" size="sm" className="border-brand-300 bg-white">
                Open notifications
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}