import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ApiError } from "@/api/client";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  error?: ApiError | unknown;
  onRetry?: () => void;
  action?: ReactNode;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  code,
  error,
  onRetry,
  action,
  compact = false,
}: ErrorStateProps) {
  const apiError = error instanceof Error && "status" in error ? (error as ApiError) : null;
  const resolvedMessage =
    message ??
    apiError?.message ??
    "We couldn't load this right now. Try again in a moment.";
  const resolvedCode = code ?? apiError?.code;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-16",
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      {resolvedCode && (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-400">
          {resolvedCode}
        </p>
      )}
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{resolvedMessage}</p>
      {(onRetry || action) && (
        <div className="mt-5 flex items-center gap-3">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}