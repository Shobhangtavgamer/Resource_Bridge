import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCheck,
  Clock3,
  HandHeart,
  Package,
  PackageCheck,
  PlusCircle,
  Truck,
} from "lucide-react";
import { donationsApi } from "@/api/endpoints";
import type { DonationStatus } from "@/api/types";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/store/auth.store";
import { VerificationBanner } from "@/components/ngo/VerificationBanner";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { DonationCard } from "@/components/ui/DonationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Stagger } from "@/components/motion/Stagger";

const CLAIMED = ["ACCEPTED_BY_NGO", "PICKUP_SCHEDULED", "COLLECTED", "RECEIVED_BY_NGO", "DISTRIBUTED"];
const ACTIVE: DonationStatus[] = ["ACCEPTED_BY_NGO", "PICKUP_SCHEDULED", "COLLECTED", "RECEIVED_BY_NGO"];
const DELIVERED = ["DISTRIBUTED", "COMPLETED"];

export function NgoDashboardPage() {
  useDocumentTitle("NGO dashboard");
  const user = useCurrentUser();
  const ngo = user?.ngo;

  const { data, loading, error, refetch } = useAsync(
    (signal) => donationsApi.listForNgo(signal),
    [],
  );
  const { data: open, loading: openLoading, error: openError } = useAsync(
    (signal) => donationsApi.listOpen({}, signal),
    [],
  );

  const donations = data?.donations ?? [];
  const claimed = donations.filter((d) => CLAIMED.includes(d.status));
  const active = claimed.filter((d) => ACTIVE.includes(d.status));
  const delivered = donations.filter((d) => DELIVERED.includes(d.status));
  const recent = [...claimed]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const openCount = open?.donations.length ?? 0;
  const verified = Boolean(ngo?.isVerified && !ngo?.suspendedAt);

  const bannerState = ngo?.suspendedAt
    ? "suspended"
    : verified
      ? "verified"
      : "pending";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="NGO dashboard"
        title={ngo?.orgName ?? "Welcome"}
        description="Manage claims, pickups and distributions from one place."
        actions={
          <Link to={ROUTES.ngo.available}>
            <Button leftIcon={<HandHeart className="h-4 w-4" aria-hidden />}>
              Browse available donations
            </Button>
          </Link>
        }
      />

      <Reveal>
        <VerificationBanner state={bannerState} orgName={ngo?.orgName} />
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={60} delay={40}>
        <StatCard
          label="Available to claim"
          value={openCount}
          loading={openLoading && !openError}
          icon={Package}
          accent="sky"
          hint="Across all cities"
          animate={!openLoading}
        />
        <StatCard
          label="Claimed by you"
          value={claimed.length}
          loading={loading}
          icon={HandHeart}
          accent="brand"
          animate={!loading}
        />
        <StatCard
          label="In progress"
          value={active.length}
          loading={loading}
          icon={Truck}
          accent="accent"
          hint="Pickups and delivery"
          animate={!loading}
        />
        <StatCard
          label="Delivered"
          value={delivered.length}
          loading={loading}
          icon={CheckCheck}
          accent="emerald"
          animate={!loading}
        />
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="recent-claims">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-claims" className="text-base font-semibold text-ink-900">
              Recently managed donations
            </h2>
            <Link
              to={ROUTES.ngo.pickups}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
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
                  perspective="ngo"
                  to={ROUTES.ngo.donation(donation.id)}
                />
              ))}
            </Stagger>
          ) : (
            <EmptyState
              icon={<Package className="h-7 w-7" aria-hidden />}
              title="No claims yet"
              description={
                verified
                  ? "Claim your first donation to start managing pickups and distributions here."
                  : "Your verified status unlocks claiming — browse donations while you wait."
              }
              action={
                <Link to={ROUTES.ngo.available}>
                  <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" aria-hidden />}>
                    Browse available donations
                  </Button>
                </Link>
              }
            />
          )}
        </section>

        <Reveal as="aside" delay={120} className="space-y-5" aria-label="Quick actions">
          <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold text-ink-900">Quick actions</h2>
            <div className="mt-4 space-y-2">
              {[
                { icon: PackageCheck, label: "Schedule upcoming pickups", to: ROUTES.ngo.pickups },
                { icon: Truck, label: "Move items to distribution", to: ROUTES.ngo.distributions },
                { icon: Clock3, label: "View pending deliveries", to: ROUTES.ngo.pickups },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-3.5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-brand-600" aria-hidden />
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-ink-900 p-5 text-white">
            <h2 className="text-base font-semibold">Need more donations?</h2>
            <p className="mt-2 text-sm text-ink-300">
              {verified
                ? "New quality-checked donations appear in your city regularly."
                : "Verification lets you claim donations in your service radius."}
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}