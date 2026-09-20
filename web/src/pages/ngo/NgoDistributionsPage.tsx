import { useState } from "react";
import { HandHeart, PlusCircle, UsersRound } from "lucide-react";
import { donationsApi, distributionApi } from "@/api/endpoints";
import type { Donation } from "@/api/types";
import { toApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { DonationSummary } from "@/components/ngo/DonationSummary";
import { formatDate } from "@/lib/format";

const RECIPIENT_OPTIONS = [
  { value: "", label: "General distribution" },
  { value: "children", label: "Children" },
  { value: "students", label: "Students" },
  { value: "families", label: "Families" },
  { value: "elderly", label: "Elderly" },
  { value: "people_with_disabilities", label: "People with disabilities" },
  { value: "refugees", label: "Refugees / displaced" },
  { value: "other", label: "Other" },
];

const WORKING = ["RECEIVED_BY_NGO", "DISTRIBUTED", "COMPLETED"];

interface DistributionCardProps {
  donation: Donation;
  refreshKey: number;
  onRecord: (donation: Donation) => void;
}

function DistributionCard({ donation, refreshKey, onRecord }: DistributionCardProps) {
  const { data, loading } = useAsync(
    (signal) => distributionApi.list(donation.id, signal),
    [donation.id, refreshKey],
  );
  const records = data?.distributions ?? [];
  const reached = records.reduce((sum, record) => sum + record.recipientCount, 0);

  return (
    <div>
      <DonationSummary donation={donation} showActions />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500" role="status">
          {loading ? (
            <span className="text-ink-400">Loading records…</span>
          ) : (
            <>
              <Badge tone="neutral">
                {records.length} record{records.length === 1 ? "" : "s"}
              </Badge>
              {reached > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <UsersRound className="h-3.5 w-3.5" aria-hidden />
                  {reached} recipients reached
                </span>
              )}
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<PlusCircle className="h-4 w-4" aria-hidden />}
          onClick={() => onRecord(donation)}
        >
          Record distribution
        </Button>
      </div>
      {records.length > 0 && (
        <ul className="mt-2 space-y-1 px-1 text-xs text-ink-500">
          {records.map((record) => (
            <li key={record.id} className="flex items-center justify-between gap-2">
              <span>
                {record.recipientCount} recipients
                {record.recipientCategory ? ` · ${record.recipientCategory.replaceAll("_", " ")}` : ""}
                {record.region ? ` · ${record.region}` : ""}
              </span>
              <span className="text-ink-400">{formatDate(record.distributedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NgoDistributionsPage() {
  useDocumentTitle("Distributions");
  const toast = useToast();
  const [recording, setRecording] = useState<Donation | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [count, setCount] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAsync(
    (signal) => donationsApi.listForNgo(signal),
    [],
  );

  const donations = (data?.donations ?? []).filter((d) => WORKING.includes(d.status));

  const openRecord = (donation: Donation) => {
    setRecording(donation);
    setCount("");
    setCategory("");
    setRegion("");
    setNotes("");
    setErrorText(null);
  };

  const submit = async () => {
    if (!recording) return;
    const recipientCount = Number.parseInt(count, 10);
    if (!count || Number.isNaN(recipientCount) || recipientCount < 1) {
      setErrorText("Enter the number of recipients reached.");
      return;
    }
    setErrorText(null);
    setBusy(true);
    try {
      await distributionApi.record(recording.id, {
        recipientCount,
        ...(category ? { recipientCategory: category } : {}),
        ...(region.trim() ? { region: region.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      toast.success("Distribution recorded", `${recipientCount} recipients reached.`);
      setRecording(null);
      setRefreshKey((key) => key + 1);
    } catch (caught) {
      setErrorText(toApiError(caught).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Impact"
        title="Record distributions"
        description="Log how many people each donation reached — this powers the public impact stats."
      />

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load distributions" onRetry={refetch} />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="h-7 w-7" aria-hidden />}
          title="Nothing to distribute yet"
          description="Once items are received, you can log the distribution here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {donations.map((donation) => (
            <DistributionCard
              key={donation.id}
              donation={donation}
              refreshKey={refreshKey}
              onRecord={openRecord}
            />
          ))}
        </div>
      )}

      <Modal
        open={recording !== null}
        onClose={() => !busy && setRecording(null)}
        title={recording ? `Record distribution · ${recording.donationCode}` : "Record distribution"}
        description="Be honest about reach — this number is shown publicly as impact."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRecording(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy} leftIcon={<HandHeart className="h-4 w-4" aria-hidden />}>
              Save distribution
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {errorText && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorText}
            </div>
          )}
          <Input
            label="Number of recipients reached"
            type="number"
            min={1}
            required
            value={count}
            onChange={(event) => setCount(event.target.value)}
            hint="Whole number of individuals who received items."
          />
          <Select
            label="Recipient group"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={RECIPIENT_OPTIONS}
          />
          <Input
            label="Region / community"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="e.g. Ward 12, North Camp"
          />
          <Input
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything the reviewers should know."
          />
        </div>
      </Modal>
    </div>
  );
}