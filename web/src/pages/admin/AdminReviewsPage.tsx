import { useState } from "react";
import { Check, ImageOff, ScrollText, X } from "lucide-react";
import { adminApi, donationsApi, proofApi } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { CATEGORY_META } from "@/lib/categories";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { FadeInImage } from "@/components/motion/FadeInImage";
import { PageHeader } from "@/components/layout/PageHeader";

export function AdminReviewsPage() {
  useDocumentTitle("Review queue");
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAsync(
    (signal) => adminApi.reviewQueue(signal),
    [],
  );

  const pendingDonations = data?.pendingDonations ?? [];
  const pendingProofs = data?.pendingProofs ?? [];

  const approveDonation = async (id: string) => {
    setBusy(id);
    try {
      await donationsApi.changeStatus(id, "AVAILABLE");
      toast.success("Donation approved", "It's now visible to verified NGOs.");
      refetch();
    } catch (caught) {
      toast.error("Couldn't approve", toApiError(caught).message);
    } finally {
      setBusy(null);
    }
  };

  const rejectDonation = async (id: string) => {
    setBusy(id);
    try {
      await donationsApi.changeStatus(id, "CREATED", "Rejected during content review");
      toast.success("Donation sent back", "The donor can edit and resubmit it.");
      refetch();
    } catch (caught) {
      toast.error("Couldn't update donation", toApiError(caught).message);
    } finally {
      setBusy(null);
    }
  };

  const reviewProof = async (id: string, decision: "APPROVED" | "REJECTED") => {
    setBusy(id);
    try {
      await proofApi.review(id, decision);
      toast.success(
        decision === "APPROVED" ? "Proof approved" : "Proof rejected",
        decision === "APPROVED" ? "It now counts as verified." : "The uploader can try again.",
      );
      refetch();
    } catch (caught) {
      toast.error("Couldn't review proof", toApiError(caught).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Review queue"
        description="Content that needs a human decision before it becomes public."
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load the review queue" onRetry={refetch} />
      ) : pendingDonations.length === 0 && pendingProofs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-7 w-7" aria-hidden />}
          title="Queue is clear"
          description="Nothing is waiting for your review right now."
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="donation-reviews">
            <h2 id="donation-reviews" className="mb-4 text-base font-semibold text-ink-900">
              Donation submissions{" "}
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                {pendingDonations.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pendingDonations.map((donation) => (
                <article key={donation.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-ink-900">{donation.donationCode}</p>
                    <Badge tone="accent" dot>{donation.status.replaceAll("_", " ")}</Badge>
                    <span className="ml-auto text-xs text-ink-400">
                      {new Date(donation.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(donation.items ?? []).map((item) => {
                      const meta = CATEGORY_META[item.category];
                      return (
                        <span key={item.id} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-ink-200">
                          <meta.icon className="h-3.5 w-3.5" aria-hidden />
                          {meta.shortLabel} ×{item.quantity}
                        </span>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    Pickup: {donation.pickupAddressLine}, {donation.city}
                    {donation.notes ? ` · “${donation.notes}”` : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      leftIcon={<Check className="h-4 w-4" aria-hidden />}
                      loading={busy === donation.id}
                      disabled={busy !== null}
                      onClick={() => approveDonation(donation.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      loading={busy === `reject-${donation.id}`}
                      disabled={busy !== null}
                      onClick={() => rejectDonation(donation.id)}
                    >
                      Send back
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="proof-reviews">
            <h2 id="proof-reviews" className="mb-4 text-base font-semibold text-ink-900">
              Photo evidence{" "}
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                {pendingProofs.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pendingProofs.map((proof) => (
                <article key={proof.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">
                        {proof.type.replaceAll("_", " ").toLowerCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {proof.donation
                          ? `For ${proof.donation.donationCode}`
                          : "Unlinked"} · uploaded {new Date(proof.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge tone="accent" dot>Pending</Badge>
                  </div>
                  {proof.fileUrl ? (
                    <a href={proof.fileUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-xl">
                      <FadeInImage
                        src={proof.fileUrl}
                        alt="Uploaded evidence"
                        className="h-40 w-full rounded-xl object-cover ring-1 ring-ink-200"
                      />
                    </a>
                  ) : (
                    <p className="mt-3 flex items-center gap-2 text-xs text-ink-400">
                      <ImageOff className="h-4 w-4" aria-hidden /> No preview
                    </p>
                  )}
                  {proof.isIdentifying && (
                    <p className="mt-2 text-xs text-red-600">
                      Identifying photo — verify explicit consent was captured.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      leftIcon={<Check className="h-4 w-4" aria-hidden />}
                      loading={busy === proof.id}
                      disabled={busy !== null}
                      onClick={() => reviewProof(proof.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      leftIcon={<X className="h-4 w-4" aria-hidden />}
                      loading={busy === `reject-${proof.id}`}
                      disabled={busy !== null}
                      onClick={() => reviewProof(proof.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}