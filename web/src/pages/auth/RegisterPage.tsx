import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { HandHeart, HeartHandshake, Mail, Phone, UserRound } from "lucide-react";
import { toApiError } from "@/api/client";
import type { Role } from "@/api/types";
import { ROUTES, roleDashboardRoute } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAuthStore, useIsAuthenticated } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";

type RegisterRole = Extract<Role, "DONOR" | "NGO">;

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  defaultAddress: string;
  city: string;
  state: string;
  pincode: string;
  orgName: string;
  registrationNo: string;
  description: string;
  contactPerson: string;
  serviceRadiusKm: string;
}

const INITIAL: FormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  defaultAddress: "",
  city: "",
  state: "",
  pincode: "",
  orgName: "",
  registrationNo: "",
  description: "",
  contactPerson: "",
  serviceRadiusKm: "",
};

function validateForm(form: FormState, role: RegisterRole): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.fullName.trim()) errors.fullName = "Your full name is required.";
  else if (form.fullName.trim().length < 2) errors.fullName = "Name must be at least 2 characters.";

  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Enter a valid email address.";

  if (!form.password) errors.password = "Set a password.";
  else if (form.password.length < 8) errors.password = "Password must be at least 8 characters.";
  else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
    errors.password = "Use at least one letter and one number.";

  if (form.confirmPassword !== form.password)
    errors.confirmPassword = "Passwords do not match.";

  if (role === "NGO") {
    if (!form.orgName.trim()) errors.orgName = "Organisation name is required.";
    if (!form.registrationNo.trim()) errors.registrationNo = "Registration number is required.";
    if (form.registrationNo.trim().length > 100)
      errors.registrationNo = "Keep it under 100 characters.";
    if (form.serviceRadiusKm) {
      const km = Number(form.serviceRadiusKm);
      if (!Number.isFinite(km) || km < 1 || km > 500)
        errors.serviceRadiusKm = "Enter a radius between 1 and 500 km.";
    }
  }

  return errors;
}

export function RegisterPage() {
  useDocumentTitle("Create an account");
  const navigate = useNavigate();
  const toast = useToast();
  const register = useAuthStore((state) => state.register);
  const isAuthenticated = useIsAuthenticated();

  const [role, setRole] = useState<RegisterRole>("DONOR");
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={roleDashboardRoute(useAuthStore.getState().user?.role)} replace />;
  }

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateForm(form, role);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role,
        defaultAddress: form.defaultAddress.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        orgName: role === "NGO" && form.orgName.trim() ? form.orgName.trim() : undefined,
        registrationNo:
          role === "NGO" && form.registrationNo.trim() ? form.registrationNo.trim() : undefined,
        description: role === "NGO" && form.description.trim() ? form.description.trim() : undefined,
        contactPerson:
          role === "NGO" && form.contactPerson.trim() ? form.contactPerson.trim() : undefined,
        serviceRadiusKm:
          role === "NGO" && form.serviceRadiusKm
            ? Number(form.serviceRadiusKm)
            : undefined,
      });
      toast.success(
        "Account created",
        "Check your inbox to verify your email — you can use the app right away.",
      );
      navigate(roleDashboardRoute(user.role), { replace: true });
    } catch (caught) {
      const error = toApiError(caught);
      if (error.status === 409 || error.code === "EMAIL_TAKEN") {
        setErrors((current) => ({ ...current, email: "This email is already registered." }));
        setFormError(null);
      } else if (error.code === "VALIDATION_ERROR") {
        setFormError(error.message);
      } else {
        setFormError("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Reveal className="flex flex-col items-center" y={12}>
          <Logo />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-ink-500">Join as a donor or register your NGO.</p>
        </Reveal>

        <Reveal delay={80} className="mt-8">
          <SegmentedControl<RegisterRole>
            id="register-role"
            label="I want to join as"
            value={role}
            onChange={setRole}
            options={[
              { value: "DONOR", label: "A donor", icon: HeartHandshake },
              { value: "NGO", label: "An NGO", icon: HandHeart },
            ]}
          />
        </Reveal>

        <Reveal delay={140} className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>
              {role === "DONOR" ? "Donor account" : "NGO registration"}
            </CardTitle>
            <CardDescription>
              {role === "DONOR"
                ? "Everything you need to publish and track donations."
                : "Your NGO will be reviewed by our team before it can claim donations."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  placeholder="Anjali Sharma"
                  required
                  autoComplete="name"
                  leftIcon={<UserRound className="h-4 w-4" aria-hidden />}
                  value={form.fullName}
                  onChange={(event) => setField("fullName")(event.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4" aria-hidden />}
                  value={form.email}
                  onChange={(event) => setField("email")(event.target.value)}
                  error={errors.email}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  leftIcon={<Phone className="h-4 w-4" aria-hidden />}
                  value={form.phone}
                  onChange={(event) => setField("phone")(event.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min. 8 characters"
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) => setField("password")(event.target.value)}
                    error={errors.password}
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    placeholder="Repeat it"
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(event) => setField("confirmPassword")(event.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>
              </div>

              {role === "DONOR" ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="City"
                      placeholder="Mumbai"
                      value={form.city}
                      onChange={(event) => setField("city")(event.target.value)}
                    />
                    <Input
                      label="State"
                      placeholder="Maharashtra"
                      value={form.state}
                      onChange={(event) => setField("state")(event.target.value)}
                    />
                    <Input
                      label="Pincode"
                      inputMode="numeric"
                      placeholder="400001"
                      value={form.pincode}
                      onChange={(event) => setField("pincode")(event.target.value)}
                    />
                  </div>
                  <Input
                    label="Default pickup address (optional)"
                    placeholder="Flat, building, street, area"
                    value={form.defaultAddress}
                    onChange={(event) => setField("defaultAddress")(event.target.value)}
                    hint="We prefill this when you create a donation — you can still change it each time."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Organisation name"
                      placeholder="Hope Children's Trust"
                      required
                      value={form.orgName}
                      onChange={(event) => setField("orgName")(event.target.value)}
                      error={errors.orgName}
                    />
                    <Input
                      label="Registration number"
                      placeholder="e.g. NGO/2016/112233"
                      required
                      value={form.registrationNo}
                      onChange={(event) => setField("registrationNo")(event.target.value)}
                      error={errors.registrationNo}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="Service radius (km)"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={500}
                      placeholder="25"
                      value={form.serviceRadiusKm}
                      onChange={(event) => setField("serviceRadiusKm")(event.target.value)}
                      error={errors.serviceRadiusKm}
                    />
                    <Input
                      label="City"
                      placeholder="Mumbai"
                      value={form.city}
                      onChange={(event) => setField("city")(event.target.value)}
                    />
                    <Input
                      label="State / pincode"
                      placeholder="Maharashtra · 400001"
                      value={form.state}
                      onChange={(event) => setField("state")(event.target.value)}
                    />
                  </div>
                  <Input
                    label="Contact person (optional)"
                    placeholder="Who should donors contact?"
                    value={form.contactPerson}
                    onChange={(event) => setField("contactPerson")(event.target.value)}
                  />
                  <Textarea
                    label="Short description (optional)"
                    placeholder="Who you serve and what you need most…"
                    value={form.description}
                    onChange={(event) => setField("description")(event.target.value)}
                  />
                </div>
              )}

              <Button type="submit" fullWidth size="lg" loading={submitting}>
                {role === "DONOR" ? "Create donor account" : "Register my NGO"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </Reveal>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to={ROUTES.login} className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}