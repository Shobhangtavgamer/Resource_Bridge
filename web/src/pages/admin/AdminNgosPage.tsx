import { useMemo, useState } from "react";
import { BadgeCheck, Building2, XCircle } from "lucide-react";
import { adminApi } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";

export function AdminNgosPage() {
  useDocumentTitle("NGO verification");
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<{ id: string; orgName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, loading, error, refetch } = useAsync((signal) => adminApi.ngos({}, signal), []);

  const ngos = useMemo(() => {
    const base = data?.ngos ?? [];
    return [...base].sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [data]);

  const verify = async (id: string) => {
    setBusyId(id);
    try {
      await adminApi.verifyNgo(id);
      toast.success("NGO verified", "This NGO can now claim and distribute donations.");
      refetch();
    } catch (caught) {
      toast.error("Couldn't verify", toApiError(caught).message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await adminApi.rejectNgo(rejecting.id, rejectReason.trim() || undefined);
      toast.success("NGO rejected", `${rejecting.orgName} was not verified.`);
      setRejecting(null);
      setRejectReason("");
      refetch();
    } catch (caught) {
      toast.error("Couldn't reject", toApiError(caught).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="NGO verification"
        description="Review and approve registered NGOs. Only verified NGOs can claim donations."
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Couldn't load NGOs" onRetry={refetch} />
      ) : ngos.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-7 w-7" aria-hidden />}
          title="No NGOs registered yet"
        />
      ) : (
        <ul className="space-y-3">
          {ngos.map((ngo) => (
            <li key={ngo.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-900">
                    {ngo.orgName}
                    {ngo.isVerified ? (
                      <Badge tone="success" dot>Verified</Badge>
                    ) : ngo.suspendedAt ? (
                      <Badge tone="danger" dot>Suspended</Badge>
                    ) : (
                      <Badge tone="accent" dot>Pending</Badge>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {ngo.registrationNo} · {[ngo.city, ngo.state].filter(Boolean).join(", ") || "Location not set"}
                    · ~{ngo.serviceRadiusKm} km radius
                  </p>
                  {ngo.user && (
                    <p className="mt-0.5 text-xs text-ink-400">
                      {ngo.user.fullName} · {ngo.user.email}
                    </p>
                  )}
                  {ngo.description && (
                    <p className="mt-2 max-w-2xl text-sm text-ink-600">{ngo.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {ngo.certFileUrl && (
                    <a
                      href={ngo.certFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                    >
                      View certificate
                    </a>
                  )}
                  {!ngo.isVerified && !ngo.suspendedAt && (
                    <>
                      <Button
                        size="sm"
                        leftIcon={<BadgeCheck className="h-4 w-4" aria-hidden />}
                        loading={busyId === ngo.id}
                        disabled={busyId !== null}
                        onClick={() => verify(ngo.id)}
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        leftIcon={<XCircle className="h-4 w-4" aria-hidden />}
                        disabled={busyId !== null}
                        onClick={() => setRejecting({ id: ngo.id, orgName: ngo.orgName })}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        title={rejecting ? `Reject ${rejecting.orgName}?` : "Reject NGO"}
        description="The NGO won't be able to claim or distribute donations."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(null)} disabled={busyId !== null}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject} loading={busyId !== null}>
              Reject NGO
            </Button>
          </>
        }
      >
        <Textarea
          rows={3}
          placeholder="Optional reason (not shared with the NGO yet)"
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
        />
      </Modal>
    </div>
  );
}