import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Building2 } from "lucide-react";
import { usersApi } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { PasswordCard } from "@/components/profile/PasswordCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { VerificationBanner } from "@/components/ngo/VerificationBanner";

interface NgoForm {
  orgName: string;
  description: string;
  contactPerson: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  serviceRadiusKm: string;
}

export function NgoProfilePage() {
  useDocumentTitle("NGO profile");
  const toast = useToast();

  const { data, error, refetch } = useAsync((signal) => usersApi.me(signal), []);
  const user = data?.user ?? null;
  const ngo = user?.ngo;

  const [form, setForm] = useState<NgoForm>({
    orgName: "",
    description: "",
    contactPerson: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    serviceRadiusKm: "25",
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ngo && !loaded) {
      setForm({
        orgName: ngo.orgName,
        description: ngo.description ?? "",
        contactPerson: ngo.contactPerson ?? "",
        address: ngo.address ?? "",
        city: ngo.city ?? "",
        state: ngo.state ?? "",
        pincode: ngo.pincode ?? "",
        serviceRadiusKm: String(ngo.serviceRadiusKm ?? 25),
      });
      setLoaded(true);
    }
  }, [ngo, loaded]);

  const setField = (field: keyof NgoForm) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const radius = Number.parseInt(form.serviceRadiusKm, 10);
    try {
      await usersApi.updateNgoProfile({
        orgName: form.orgName.trim(),
        description: form.description.trim() || undefined,
        contactPerson: form.contactPerson.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        serviceRadiusKm: Number.isNaN(radius) ? undefined : radius,
      });
      toast.success("NGO profile saved");
      refetch();
    } catch (caught) {
      toast.error("Couldn't save profile", toApiError(caught).message);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <ErrorState error={error} title="Couldn't load your profile" onRetry={refetch} />;
  }

  const bannerState = ngo?.suspendedAt ? "suspended" : ngo?.isVerified ? "verified" : "pending";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="NGO profile"
        title="Your organisation"
        description="These details are shown to donors and admins."
      />

      {!ngo ? (
        <Card>
          <CardContent className="text-sm text-ink-500">
            Loading profile…
          </CardContent>
        </Card>
      ) : (
        <>
          <VerificationBanner state={bannerState} orgName={ngo.orgName} />
          {ngo.verifiedAt && (
            <p className="text-xs text-ink-500">
              Verified on {new Date(ngo.verifiedAt).toLocaleDateString()}
              {ngo.certFileUrl ? (
                <> ·{" "}
                  <a
                    href={ngo.certFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-700 underline underline-offset-2"
                  >
                    view registration certificate
                  </a>
                </>
              ) : null}
            </p>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-600" aria-hidden />
                <CardTitle>Organisation details</CardTitle>
              </div>
              <CardDescription>
                {user?.email}{" "}
                {ngo.registrationNo ? (
                  <Badge tone="neutral" className="ml-2">Reg. {ngo.registrationNo}</Badge>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loaded ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <Input
                    label="Organisation name"
                    required
                    value={form.orgName}
                    onChange={(event) => setField("orgName")(event.target.value)}
                  />
                  <Textarea
                    label="About your work"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setField("description")(event.target.value)}
                    hint="What communities do you serve? Donors and admins read this."
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Contact person"
                      value={form.contactPerson}
                      onChange={(event) => setField("contactPerson")(event.target.value)}
                    />
                    <Input
                      label="Service radius (km)"
                      type="number"
                      min={1}
                      value={form.serviceRadiusKm}
                      onChange={(event) => setField("serviceRadiusKm")(event.target.value)}
                    />
                  </div>
                  <Input
                    label="Registered address"
                    value={form.address}
                    onChange={(event) => setField("address")(event.target.value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="City"
                      value={form.city}
                      onChange={(event) => setField("city")(event.target.value)}
                    />
                    <Input
                      label="State"
                      value={form.state}
                      onChange={(event) => setField("state")(event.target.value)}
                    />
                    <Input
                      label="Pincode"
                      value={form.pincode}
                      onChange={(event) => setField("pincode")(event.target.value)}
                    />
                  </div>
                  <CardFooter className="justify-end px-0 pb-0">
                    <Button type="submit" loading={saving}>
                      Save changes
                    </Button>
                  </CardFooter>
                </form>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <PasswordCard />
    </div>
  );
}