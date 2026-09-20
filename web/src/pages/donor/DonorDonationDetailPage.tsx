import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, MapPin, Package, ShieldCheck, Trash2 } from "lucide-react";
import { donationsApi } from "@/api/endpoints";
import type { DonationStatus } from "@/api/types";
import { CATEGORY_META } from "@/lib/categories";
import { CONDITION_META, STATUS_META } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { formatDate, formatDateTime } from "@/lib/format";
import { pluralize } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { toApiError } from "@/api/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DonationTimeline } from "@/components/ui/DonationTimeline";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";

const CAN_DELETE_STATUSES: DonationStatus[] = ["CREATED", "PENDING_VERIFICATION", "AVAILABLE"];

export function DonorDonationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, error, refetch } = useAsync(
    (signal) => (id ? donationsApi.getOne(id, signal) : Promise.reject(new Error("Missing id"))),
    [id],
  );

  const donation = data?.donation ?? null;
  useDocumentTitle(donation ? `Donation ${donation.donationCode}` : "Donation");

  const transitionLabel: Partial<Record<DonationStatus, string>> = {
    PENDING_VERIFICATION: "Submit for verification",
    CREATED: "Unlist donation",
    AVAILABLE: "Make available",
  };

  const handleTransition = async (to: DonationStatus) => {
    if (!donation) return;
    setBusy(to);
    try {
      await donationsApi.changeStatus(donation.id, to);
      toast.success(
        transitionLabel[to] ?? "Status updated",
        `Donation is now: ${STATUS_META[to].label}.`,
      );
      refetch();
    } catch (caught) {
      toast.error("Couldn't update status", toApiError(caught).message);
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!donation) return;
    setBusy("delete");
    try {
      await donationsApi.remove(donation.id);
      toast.success("Donation removed", `${donation.donationCode} was removed.`);
      navigate(ROUTES.donor.donations);
    } catch (caught) {
      toast.error("Couldn't remove donation", toApiError(caught).message);
      setBusy(null);
      setConfirmDelete(false);
    }
  };

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Couldn't load this donation"
        onRetry={refetch}
        action={
          <Link to={ROUTES.donor.donations}>
            <Button variant="outline" size="sm">
              Back to my donations
            </Button>
          </Link>
        }
      />
    );
  }

  if (!donation) return null;

  const canDelete = CAN_DELETE_STATUSES.includes(donation.status);
  const transitions = (donation.nextTransitions ?? []).filter(
    (to) => to === "PENDING_VERIFICATION" || to === "CREATED",
  );
  const itemCount = (donation.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
  const totalDistributed = (donation.distributions ?? []).reduce(
    (sum, record) => sum + record.recipientCount,
    0,
  );
  const hasDistributions = (donation.distributions ?? []).length > 0;

  return (
    <Container className="py-6 sm:py-8">
      <Link
        to={ROUTES.donor.donations}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        My donations
      </Link>

      <PageHeader
        eyebrow="Donation"
        title={donation.donationCode}
        description={`Listed on ${formatDate(donation.createdAt)}`}
        actions={<StatusBadge status={donation.status} />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-600" aria-hidden />
                <CardTitle>Items ({itemCount} total)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(donation.items ?? []).map((item) => {
                const category = CATEGORY_META[item.category];
                return (
                  <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-3.5">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${category.tint}`}>
                      <category.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">
                        {item.title}
                        <span className="ml-2 text-xs font-medium text-ink-400">
                          ×{item.quantity}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {category.label} · {CONDITION_META[item.condition].label}
                        {item.ageGroup ? ` · ${item.ageGroup}` : ""}
                      </p>
                    </div>
                    {item.description && (
                      <p className="w-full text-xs text-ink-400 sm:w-auto sm:flex-1 sm:text-right">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {hasDistributions ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden />
                  <CardTitle>Distribution records</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(donation.distributions ?? []).map((record) => (
                  <div key={record.id} className="rounded-xl border border-ink-100 p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">
                        {record.recipientCount} recipients
                      </p>
                      <Badge tone={record.proofAvailable ? "success" : "neutral"}>
                        {record.proofAvailable ? "Proof approved" : "No approved proof"}
                      </Badge>
                      <span className="ml-auto text-xs text-ink-400">
                        {formatDate(record.distributedAt)}
                      </span>
                    </div>
                    {(record.recipientCategory || record.region) && (
                      <p className="mt-1 text-xs text-ink-500">
                        {[record.recipientCategory, record.region].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {record.notes && <p className="mt-1 text-xs text-ink-400">{record.notes}</p>}
                    {(record.proofs ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(record.proofs ?? []).map((proof) => (
                          <a
                            key={proof.id}
                            href={proof.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                          >
                            View distribution photo
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <EmptyState
                compact
                icon={<ShieldCheck className="h-7 w-7" aria-hidden />}
                title="Not yet distributed"
                description="Once an NGO delivers these items, the distribution record and reviewed proof will appear here."
              />
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pickup & location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-start gap-2 text-ink-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                <span>
                  {donation.pickupAddressLine}
                  {donation.city ? `, ${donation.city}` : ""}
                  {donation.pickupPincode ? ` — ${donation.pickupPincode}` : ""}
                </span>
              </p>
              <p className="flex items-center gap-2 text-ink-600">
                <CalendarClock className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                {donation.preferredPickupDate
                  ? `Preferred: ${formatDateTime(donation.preferredPickupDate)}`
                  : "No preferred pickup time set"}
              </p>
              {donation.ngo && (
                <p className="rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800">
                  {donation.status === "AVAILABLE"
                    ? "Waiting for a verified NGO to claim this donation."
                    : `Currently with: ${donation.ngo.orgName}`}
                </p>
              )}
              {donation.pickup && donation.pickup.scheduledAt && (
                <p className="rounded-xl bg-ink-50 px-3 py-2.5 text-sm text-ink-600">
                  Pickup scheduled for{" "}
                  <span className="font-semibold text-ink-900">
                    {formatDateTime(donation.pickup.scheduledAt)}
                  </span>
                  {donation.pickup.assignedTo ? ` · ${donation.pickup.assignedTo}` : ""}
                </p>
              )}
              {donation.notes && (
                <p className="rounded-xl bg-ink-50 px-3 py-2.5 text-sm text-ink-500">
                  <span className="font-medium text-ink-700">Notes:</span> {donation.notes}
                </p>
              )}
            </CardContent>
          </Card>

          {transitions.length > 0 || canDelete ? (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {transitions.map((to) => (
                  <Button
                    key={to}
                    fullWidth
                    variant={to === "PENDING_VERIFICATION" ? "primary" : "outline"}
                    loading={busy === to}
                    disabled={busy !== null}
                    onClick={() => handleTransition(to)}
                  >
                    {transitionLabel[to]}
                  </Button>
                ))}
                {canDelete && (
                  <Button
                    fullWidth
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    loading={busy === "delete"}
                    disabled={busy !== null}
                    onClick={() => setConfirmDelete(true)}
                    leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
                  >
                    Remove donation
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : null}

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

          <p className="text-xs leading-relaxed text-ink-400">
            {pluralize(itemCount, "item")}
            {totalDistributed > 0 ? ` · ${totalDistributed} recipients reached` : ""}
          </p>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Remove this donation?"
        description={`${donation.donationCode} and all its items will be permanently removed. This can't be undone.`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
              disabled={busy === "delete"}
            >
              Keep it
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={busy === "delete"}>
              Remove donation
            </Button>
          </>
        }
      >
        <p className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-600">
          Once removed, this donation and its items are gone from every public view. Any
          scheduled pickup is cancelled too.
        </p>
      </Modal>
    </Container>
  );
}