import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  HandHeart,
  ImagePlus,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  UsersRound,
} from "lucide-react";
import { donationsApi, distributionApi, proofApi } from "@/api/endpoints";
import type { DonationStatus } from "@/api/types";
import { CATEGORY_META } from "@/lib/categories";
import { CONDITION_META } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { formatDate, formatDateTime } from "@/lib/format";
import { pluralize } from "@/lib/utils";
import { toApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/store/auth.store";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DonationTimeline } from "@/components/ui/DonationTimeline";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";

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

export function NgoDonationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const user = useCurrentUser();
  const myNgoId = user?.ngo?.id;
  const verified = Boolean(user?.ngo?.isVerified && !user?.ngo?.suspendedAt);

  const { data, error, refetch } = useAsync(
    (signal) => (id ? donationsApi.getOne(id, signal) : Promise.reject(new Error("Missing id"))),
    [id],
  );
  const donation = data?.donation ?? null;
  useDocumentTitle(donation ? `Donation ${donation.donationCode}` : "Donation");

  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [slotValue, setSlotValue] = useState("");
  const [recordOpen, setRecordOpen] = useState(false);
  const [count, setCount] = useState("");
  const [recipientCategory, setRecipientCategory] = useState("");
  const [region, setRegion] = useState("");
  const [distributionError, setDistributionError] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Couldn't load this donation"
        onRetry={refetch}
        action={
          <Link to={ROUTES.ngo.pickups}>
            <Button variant="outline" size="sm">Back to my pickups</Button>
          </Link>
        }
      />
    );
  }
  if (!donation) return null;

  const isMine = Boolean(myNgoId && donation.ngo?.id === myNgoId);
  const items = donation.items ?? [];
  const itemQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const distributions = donation.distributions ?? [];
  const reached = distributions.reduce((sum, record) => sum + record.recipientCount, 0);
  const distributionProofs = (donation.proofs ?? []).filter(
    (proof) => proof.type === "DISTRIBUTION",
  );

  const runStatus = async (to: DonationStatus, action: string, success: string) => {
    setBusyAction(action);
    try {
      await donationsApi.changeStatus(donation.id, to);
      toast.success(success);
      refetch();
    } catch (caught) {
      toast.error("Couldn't update status", toApiError(caught).message);
    } finally {
      setBusyAction(null);
    }
  };

  const claim = async () => {
    setBusyAction("claim");
    try {
      await donationsApi.claim(donation.id);
      toast.success("Donation claimed", "Schedule the pickup to proceed.");
      refetch();
    } catch (caught) {
      toast.error("Couldn't claim donation", toApiError(caught).message);
    } finally {
      setBusyAction(null);
    }
  };

  const unclaim = async () => {
    setBusyAction("unclaim");
    try {
      await donationsApi.unclaim(donation.id);
      toast.success("Claim cancelled", "The donation is available for other NGOs again.");
      refetch();
    } catch (caught) {
      toast.error("Couldn't cancel claim", toApiError(caught).message);
    } finally {
      setBusyAction(null);
    }
  };

  const schedule = async () => {
    if (!slotValue) {
      toast.error("Pick a date & time", "Choose a pickup slot first.");
      return;
    }
    setBusyAction("schedule");
    try {
      await donationsApi.schedulePickup(donation.id, {
        scheduledAt: new Date(slotValue).toISOString(),
      });
      toast.success("Pickup scheduled", "The donor will be notified.");
      refetch();
    } catch (caught) {
      toast.error("Couldn't schedule pickups", toApiError(caught).message);
    } finally {
      setBusyAction(null);
    }
  };

  const submitDistribution = async () => {
    const recipientCount = Number.parseInt(count, 10);
    if (!count || Number.isNaN(recipientCount) || recipientCount < 1) {
      setDistributionError("Enter the number of recipients reached.");
      return;
    }
    setDistributionError(null);
    setBusy(true);
    try {
      await distributionApi.record(donation.id, {
        recipientCount,
        ...(recipientCategory ? { recipientCategory } : {}),
        ...(region.trim() ? { region: region.trim() } : {}),
      });
      toast.success("Distribution recorded", `${recipientCount} recipients reached.`);
      setRecordOpen(false);
      refetch();
    } catch (caught) {
      setDistributionError(toApiError(caught).message);
    } finally {
      setBusy(false);
    }
  };

  const attachProof = async () => {
    if (!proofFile) return;
    setUploadingProof(true);
    try {
      await proofApi.upload({
        type: "DISTRIBUTION",
        donationId: donation.id,
        file: proofFile,
        isIdentifying: false,
      });
      toast.success("Photo uploaded", "It's queued for an admin review.");
      setProofFile(null);
      refetch();
    } catch (caught) {
      toast.error("Couldn't upload photo", toApiError(caught).message);
    } finally {
      setUploadingProof(false);
    }
  };

  return (
    <Container className="py-6 sm:py-8">
      <Link
        to={ROUTES.ngo.pickups}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        My pickups
      </Link>

      <PageHeader
        eyebrow="Donation"
        title={donation.donationCode}
        description={`${pluralize(itemQuantity, "item")} · listed ${formatDate(donation.createdAt)}`}
        actions={<StatusBadge status={donation.status} />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-600" aria-hidden />
                <CardTitle>Items ({itemQuantity} total)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const category = CATEGORY_META[item.category];
                return (
                  <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-3.5">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${category.tint}`}>
                      <category.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">
                        {item.title}
                        <span className="ml-2 text-xs font-medium text-ink-400">×{item.quantity}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {category.label} · {CONDITION_META[item.condition].label}
                        {item.ageGroup ? ` · ${item.ageGroup}` : ""}
                      </p>
                    </div>
                    {item.description && (
                      <p className="w-full text-xs text-ink-400 sm:w-auto sm:flex-1 sm:text-right">{item.description}</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden />
                <CardTitle>Recipients reached</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {distributions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-400">
                  No distribution recorded yet — record one when the items are given out.
                </p>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-sm font-medium text-ink-700">
                    <UsersRound className="h-4 w-4 text-brand-600" aria-hidden />
                    {reached} recipients reached in total
                  </p>
                  {distributions.map((record) => (
                    <div key={record.id} className="rounded-xl border border-ink-100 p-3.5 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink-900">{record.recipientCount} recipients</span>
                        <Badge tone={record.proofAvailable ? "success" : "neutral"}>
                          {record.proofAvailable ? "Proof approved" : "No approved proof"}
                        </Badge>
                        <span className="ml-auto text-xs text-ink-400">{formatDate(record.distributedAt)}</span>
                      </div>
                      {(record.recipientCategory || record.region) && (
                        <p className="mt-1 text-xs text-ink-500">
                          {[record.recipientCategory, record.region].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location & pickup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-ink-600">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                <span>
                  {donation.pickupAddressLine}
                  {donation.city ? `, ${donation.city}` : ""}
                  {donation.pickupPincode ? ` — ${donation.pickupPincode}` : ""}
                </span>
              </p>
              {donation.preferredPickupDate && (
                <p className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                  Donor prefers {formatDateTime(donation.preferredPickupDate)}
                </p>
              )}
              {donation.pickup?.scheduledAt && (
                <p className="rounded-xl bg-ink-50 px-3 py-2.5 text-ink-600">
                  Pickup scheduled{" "}
                  <span className="font-semibold text-ink-900">{formatDateTime(donation.pickup.scheduledAt)}</span>
                  {donation.pickup.assignedTo ? ` · ${donation.pickup.assignedTo}` : ""}
                </p>
              )}
              {donation.ngo && (
                <p className="rounded-xl bg-brand-50 px-3 py-2.5 font-medium text-brand-800">
                  {donation.status === "AVAILABLE"
                    ? "Waiting for a verified NGO to claim this donation."
                    : `Claimed by ${donation.ngo.orgName}`}
                </p>
              )}
            </CardContent>
          </Card>

          {!isMine && donation.status === "AVAILABLE" ? (
            <Card>
              <CardContent className="space-y-3">
                <p className="text-sm text-ink-500">
                  This donation is available. Claim it to start the pickup process.
                </p>
                <Button
                  fullWidth
                  leftIcon={<HandHeart className="h-4 w-4" aria-hidden />}
                  disabled={!verified}
                  loading={busyAction === "claim"}
                  onClick={claim}
                >
                  {verified ? "Claim this donation" : "NGO verification required"}
                </Button>
              </CardContent>
            </Card>
          ) : isMine ? (
            <Card>
              <CardHeader>
                <CardTitle>Next step</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {donation.status === "ACCEPTED_BY_NGO" && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-500">Pick a slot for the donor to hand over the items.</p>
                    <Input
                      type="datetime-local"
                      label="Pickup slot"
                      value={slotValue}
                      onChange={(event) => setSlotValue(event.target.value)}
                    />
                    <Button
                      fullWidth
                      leftIcon={<Truck className="h-4 w-4" aria-hidden />}
                      loading={busyAction === "schedule"}
                      disabled={busyAction !== null}
                      onClick={schedule}
                    >
                      Schedule pickup
                    </Button>
                    <Button
                      fullWidth
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      loading={busyAction === "unclaim"}
                      disabled={busyAction !== null}
                      onClick={unclaim}
                    >
                      Cancel my claim
                    </Button>
                  </div>
                )}
                {donation.status === "PICKUP_SCHEDULED" && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-500">Collected the items? Confirm to proceed.</p>
                    <Button
                      fullWidth
                      leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
                      loading={busyAction === "collect"}
                      disabled={busyAction !== null}
                      onClick={async () => {
                        try {
                          await donationsApi.collect(donation.id);
                          toast.success("Marked as collected", "Now confirm that you received the items.");
                          refetch();
                        } catch (caught) {
                          toast.error("Couldn't collect", toApiError(caught).message);
                        }
                      }}
                    >
                      Mark as collected
                    </Button>
                  </div>
                )}
                {donation.status === "COLLECTED" && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-500">Confirm the items arrived with your NGO.</p>
                    <Button
                      fullWidth
                      leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
                      loading={busyAction === "received"}
                      disabled={busyAction !== null}
                      onClick={() => runStatus("RECEIVED_BY_NGO", "received", "Items received — ready to distribute.")}
                    >
                      Confirm items received
                    </Button>
                  </div>
                )}
                {(donation.status === "RECEIVED_BY_NGO" || donation.status === "DISTRIBUTED") && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-500">Record how many people received these items.</p>
                    <Button
                      fullWidth
                      leftIcon={<UsersRound className="h-4 w-4" aria-hidden />}
                      loading={busyAction === "distribute-open"}
                      disabled={busyAction !== null}
                      onClick={() => setRecordOpen(true)}
                    >
                      Record distribution
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Distribution proof</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {distributionProofs.length > 0 && (
                <ul className="space-y-1.5 text-xs text-ink-500">
                  {distributionProofs.map((proof) => (
                    <li key={proof.id} className="flex items-center justify-between gap-2">
                      <a href={proof.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-700 underline underline-offset-2">
                        View uploaded photo
                      </a>
                      <Badge
                        tone={proof.reviewStatus === "APPROVED" ? "success" : proof.reviewStatus === "REJECTED" ? "danger" : "neutral"}
                      >
                        {proof.reviewStatus.toLowerCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              {isMine && (donation.status === "RECEIVED_BY_NGO" || donation.status === "DISTRIBUTED") && (
                <div className="space-y-3">
                  <ImageUploader
                    label="Attach a distribution photo"
                    hint="Non-identifying photos only — keep faces out of frame."
                    onFileChange={setProofFile}
                  />
                  <Button
                    fullWidth
                    variant="outline"
                    size="sm"
                    leftIcon={<ImagePlus className="h-4 w-4" aria-hidden />}
                    loading={uploadingProof}
                    disabled={!proofFile || uploadingProof}
                    onClick={attachProof}
                  >
                    Upload for review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
              {(donation.statusHistory ?? []).length > 0 ? (
                <DonationTimeline history={donation.statusHistory ?? []} />
              ) : (
                <p className="text-sm text-ink-500">No status changes recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        open={recordOpen}
        onClose={() => !busy && setRecordOpen(false)}
        title="Record distribution"
        description="Be honest about reach — this number is shown publicly as impact."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRecordOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submitDistribution} loading={busy}>
              Save distribution
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {distributionError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {distributionError}
            </div>
          )}
          <Input
            label="Number of recipients reached"
            type="number"
            min={1}
            required
            value={count}
            onChange={(event) => setCount(event.target.value)}
          />
          <Select
            label="Recipient group"
            value={recipientCategory}
            onChange={(event) => setRecipientCategory(event.target.value)}
            options={RECIPIENT_OPTIONS}
          />
          <Input
            label="Region / community"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
        </div>
      </Modal>
    </Container>
  );
}