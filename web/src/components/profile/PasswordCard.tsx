import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { authApi } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function PasswordCard() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const next: PasswordErrors = {};
    if (!currentPassword) next.currentPassword = "Enter your current password.";
    if (!newPassword) next.newPassword = "Enter a new password.";
    else if (newPassword.length < 8) next.newPassword = "At least 8 characters.";
    if (confirmPassword !== newPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password changed", "Use your new password next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (caught) {
      const error = toApiError(caught);
      if (error.status === 400 || error.code === "INVALID_CREDENTIALS") {
        setFormError(error.message || "Your current password looks incorrect.");
      } else {
        setFormError(error.message || "Couldn't change password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brand-600" aria-hidden />
          <CardTitle>Change password</CardTitle>
        </div>
        <CardDescription>Keep your account secure with a strong, unique password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          error={errors.currentPassword}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            error={errors.newPassword}
            hint="At least 8 characters."
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={errors.confirmPassword}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" onClick={handleSubmit} loading={submitting}>
          Update password
        </Button>
      </CardFooter>
    </Card>
  );
}