import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { isApiError, toApiError } from "@/api/client";
import { ROUTES, roleDashboardRoute } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAuthStore, useIsAuthenticated } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  useDocumentTitle("Sign in");
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useIsAuthenticated();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={roleDashboardRoute(useAuthStore.getState().user?.role)} replace />;
  }

  const validate = (): boolean => {
    const next: typeof fieldErrors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      toast.success("Welcome back", `Signed in as ${user.fullName}`);
      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from && from !== ROUTES.login ? from : roleDashboardRoute(user.role), {
        replace: true,
      });
    } catch (caught) {
      const error = toApiError(caught);
      if (isApiError(error)) {
        const message = error.message || "Invalid email or password.";
        if (error.status === 401) {
          setFormError(message);
        } else {
          setFormError(message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <Reveal className="flex flex-col items-center" y={12}>
          <Logo />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Sign in to keep giving, or manage your donations.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Resource Bridge</CardTitle>
            <CardDescription>Use the email address you registered with.</CardDescription>
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

              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                leftIcon={<Mail className="h-4 w-4" aria-hidden />}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fieldErrors.email}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                required
                leftIcon={<Lock className="h-4 w-4" aria-hidden />}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={fieldErrors.password}
                aria-invalid={Boolean(fieldErrors.password)}
              />

              <Button type="submit" fullWidth size="lg" loading={submitting}>
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
        </Reveal>

        <p className="mt-6 text-center text-sm text-ink-500">
          New to Resource Bridge?{" "}
          <Link to={ROUTES.register} className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-ink-400">
          Trouble signing in?{" "}
          <Link to={ROUTES.howItWorks} className={cn("underline underline-offset-2 hover:text-ink-600")}>
            See how the platform works
          </Link>
        </p>
      </div>
    </Container>
  );
}