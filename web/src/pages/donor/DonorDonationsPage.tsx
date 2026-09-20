import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, PlusCircle } from "lucide-react";
import { donationsApi } from "@/api/endpoints";
import type { DonationStatus } from "@/api/types";
import { DONATION_STATUS_ORDER, STATUS_META } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { Option } from "@/components/ui/Select";
import { DonationCard } from "@/components/ui/DonationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Stagger } from "@/components/motion/Stagger";
import { PageHeader } from "@/components/layout/PageHeader";

export function DonorDonationsPage() {
  useDocumentTitle("My donations");
  const [status, setStatus] = useState<DonationStatus | "">("");

  const { data, loading, error, refetch } = useAsync(
    (signal) => donationsApi.listMine(signal),
    [],
  );

  const donationCountByStatus = new Map<DonationStatus, number>();
  for (const donation of data?.donations ?? []) {
    donationCountByStatus.set(donation.status, (donationCountByStatus.get(donation.status) ?? 0) + 1);
  }

  const donations = (data?.donations ?? []).filter(
    (donation) => !status || donation.status === status,
  );

  const statusOptions: Option[] = [
    { value: "", label: "All statuses" },
    ...DONATION_STATUS_ORDER.map((value) => ({
      value,
      label: `${STATUS_META[value].label}${(donationCountByStatus.get(value) ?? 0) > 0 ? ` (${donationCountByStatus.get(value)})` : ""}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Donor"
        title="My donations"
        description="Every listing you've created, with its live status."
        actions={
          <Link to={ROUTES.donor.newDonation}>
            <Button leftIcon={<PlusCircle className="h-4 w-4" aria-hidden />}>
              Create donation
            </Button>
          </Link>
        }
      />

      <div className="max-w-xs">
        <Select
          label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value as DonationStatus | "")}
          options={statusOptions}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading donations">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load your donations" onRetry={refetch} />
      ) : donations.length > 0 ? (
        <Stagger className="grid gap-4 sm:grid-cols-2" stagger={60} delay={20}>
          {donations.map((donation) => (
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
          title={status ? `No donations with this status` : "No donations yet"}
          description={
            status
              ? "Try a different status filter."
              : "Publish your first donation and it will appear here."
          }
          action={
            !status ? (
              <Link to={ROUTES.donor.newDonation}>
                <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" aria-hidden />}>
                  Create donation
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}