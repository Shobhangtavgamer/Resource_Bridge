import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { UserRound } from "lucide-react";
import { usersApi } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { PasswordCard } from "@/components/profile/PasswordCard";
import { PageHeader } from "@/components/layout/PageHeader";

interface DonorForm {
  fullName: string;
  phone: string;
  defaultAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export function DonorProfilePage() {
  useDocumentTitle("Profile");
  const toast = useToast();

  const { data, loading, error, refetch } = useAsync((signal) => usersApi.me(signal), []);
  const user = data?.user ?? null;

  const [form, setForm] = useState<DonorForm>({
    fullName: "",
    phone: "",
    defaultAddress: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !loaded) {
      setForm({
        fullName: user.fullName,
        phone: user.phone ?? "",
        defaultAddress: user.donor?.defaultAddress ?? "",
        city: user.donor?.city ?? "",
        state: user.donor?.state ?? "",
        pincode: user.donor?.pincode ?? "",
      });
      setLoaded(true);
    }
  }, [user, loaded]);

  const setField = (field: keyof DonorForm) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await usersApi.updateMe({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        defaultAddress: form.defaultAddress.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
      });
      toast.success("Profile saved");
      refetch();
    } catch (caught) {
      const error = toApiError(caught);
      toast.error("Couldn't save profile", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <ErrorState error={error} title="Couldn't load your profile" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Your account"
        description="Personal details are prefilled when you create a donation."
      />

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-10 w-full" />
            <Skeleton className="mt-4 h-10 w-full" />
            <Skeleton className="mt-4 h-10 w-full" />
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-brand-600" aria-hidden />
              <CardTitle>Personal details</CardTitle>
            </div>
            <CardDescription>
              {user?.email}
              {user?.emailVerifiedAt ? (
                <Badge tone="success" dot className="ml-2">Email verified</Badge>
              ) : (
                <Badge tone="accent" dot className="ml-2">Email not verified yet</Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  required
                  value={form.fullName}
                  onChange={(event) => setField("fullName")(event.target.value)}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setField("phone")(event.target.value)}
                />
              </div>
              <Input
                label="Default pickup address"
                value={form.defaultAddress}
                onChange={(event) => setField("defaultAddress")(event.target.value)}
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
          </CardContent>
        </Card>
      )}

      <PasswordCard />
    </div>
  );
}