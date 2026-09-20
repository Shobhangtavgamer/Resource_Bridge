import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  HandHeart,
  ShieldAlert,
  Users,
} from "lucide-react";
import { adminApi } from "@/api/endpoints";
import { DONATION_STATUS_ORDER, STATUS_META } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Stagger } from "@/components/motion/Stagger";

export function AdminDashboardPage() {
  useDocumentTitle("Admin dashboard");

  const { data: stats, loading, error, refetch } = useAsync(
    (signal) => adminApi.stats(signal),
    [],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin console"
        title="Platform overview"
        description="Real-time health of the Resource Bridge network."
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={60} delay={40}>
        <StatCard
          label="Total donations"
          value={stats?.totalDonations ?? 0}
          loading={loading && !error}
          icon={Boxes}
          accent="brand"
          animate={!loading}
        />
        <StatCard
          label="Registered donors"
          value={stats?.totalDonors ?? 0}
          loading={loading && !error}
          icon={HandHeart}
          accent="sky"
          animate={!loading}
        />
        <StatCard
          label="NGOs"
          value={stats?.totalNgos ?? 0}
          loading={loading && !error}
          icon={Users}
          accent="indigo"
          hint={`${stats?.verifiedNgos ?? 0} verified`}
          animate={!loading}
        />
        <StatCard
          label="Pending work"
          value={(stats?.pendingReviews ?? 0) + (stats?.pendingNgoVerifications ?? 0)}
          loading={loading && !error}
          icon={ShieldAlert}
          accent="accent"
          hint="Proof and NGO verification"
          animate={!loading}
        />
      </Stagger>

      {loading && !error ? (
        <div className="flex h-40 items-center justify-center text-sm text-ink-400">
          Loading status breakdown…
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load platform stats" onRetry={refetch} />
      ) : stats ? (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
          <section aria-labelledby="by-status" className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 id="by-status" className="text-base font-semibold text-ink-900">
                Donations by status
              </h2>
              <BadgeCheck className="h-5 w-5 text-brand-600" aria-hidden />
            </div>
            <div className="mt-5 space-y-3">
              {DONATION_STATUS_ORDER.map((status) => {
                const count = stats.byStatus?.[status] ?? 0;
                const max = Math.max(
                  1,
                  ...DONATION_STATUS_ORDER.map((s) => stats.byStatus?.[s] ?? 0),
                );
                return (
                  <div key={status} className="flex items-center gap-3 text-sm">
                    <span className="w-44 shrink-0 truncate font-medium text-ink-700">
                      {STATUS_META[status].label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={`h-full rounded-full ${STATUS_META[status].dot}`}
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-ink-900">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          </Reveal>

          <aside className="space-y-4" aria-label="Admin shortcuts">
            <Reveal delay={80}>
            <Link
              to={ROUTES.admin.reviews}
              className="flex items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 transition-colors hover:bg-brand-100/70"
            >
              <span>
                <p className="text-sm font-semibold text-brand-900">Pending reviews</p>
                <p className="text-xs text-brand-700">
                  {stats.pendingReviews} proof(s) · {stats.pendingNgoVerifications} NGO(s)
                </p>
              </span>
              <ArrowRight className="h-4 w-4 text-brand-600" aria-hidden />
            </Link>
            </Reveal>
            <Reveal delay={140}>
            <Link
              to={ROUTES.admin.ngos}
              className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
            >
              <span>
                <p className="text-sm font-semibold text-ink-900">NGO verification</p>
                <p className="text-xs text-ink-500">{stats.verifiedNgos} of {stats.totalNgos} verified</p>
              </span>
              <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden />
            </Link>
            </Reveal>
            <Reveal delay={200}>
            <Link
              to={ROUTES.admin.users}
              className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
            >
              <span>
                <p className="text-sm font-semibold text-ink-900">All users</p>
                <p className="text-xs text-ink-500">Accounts &amp; suspension</p>
              </span>
              <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden />
            </Link>
            </Reveal>
          </aside>
        </div>
      ) : (
        <EmptyState
          icon={<Boxes className="h-7 w-7" aria-hidden />}
          title="No data yet"
          description="Stats appear as donations, NGOs and donors join the network."
        />
      )}
    </div>
  );
}