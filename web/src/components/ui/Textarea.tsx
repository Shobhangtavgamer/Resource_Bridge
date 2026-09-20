import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, hint, error, required, id, ...props }, ref) {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const describedBy =
      [hint ? `${textareaId}-hint` : "", error ? `${textareaId}-error` : ""]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-xl border border-ink-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400",
            "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25",
            "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500",
            "min-h-24 resize-y",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/25",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${textareaId}-error`} className="mt-1.5 flex items-center gap-1 text-xs text-red-600 animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-ink-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);