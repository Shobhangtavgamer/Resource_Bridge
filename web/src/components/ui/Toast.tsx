import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantVisuals: Record<ToastVariant, { icon: typeof Info; bar: string; iconClass: string }> = {
  success: { icon: CheckCircle2, bar: "bg-emerald-500", iconClass: "text-emerald-600" },
  error: { icon: AlertTriangle, bar: "bg-red-500", iconClass: "text-red-600" },
  info: { icon: Info, bar: "bg-sky-500", iconClass: "text-sky-600" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [closingIds, setClosingIds] = useState<number[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setClosingIds((current) => (current.includes(id) ? current : [...current, id]));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      setClosingIds((current) => current.filter((closingId) => closingId !== id));
    }, 230);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "info",
        duration: input.duration ?? 4500,
      };
      setToasts((current) => [...current, item]);
      if (item.duration > 0) {
        window.setTimeout(() => dismiss(id), item.duration);
      }
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ title, description, variant: "success" }),
      error: (title, description) => toast({ title, description, variant: "error" }),
      info: (title, description) => toast({ title, description, variant: "info" }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:w-96"
      >
        {toasts.map((toastItem) => {
          const visual = variantVisuals[toastItem.variant];
          const Icon = visual.icon;
          return (
            <div
              key={toastItem.id}
              role={toastItem.variant === "error" ? "alert" : "status"}
              className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-ink-200 bg-white p-4 pl-5 shadow-lift ${
                closingIds.includes(toastItem.id) ? "animate-slide-out-right" : "animate-slide-in-right"
              }`}
            >
              <span
                aria-hidden
                className={cn("absolute inset-y-0 left-0 w-1", visual.bar)}
              />
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", visual.iconClass)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{toastItem.title}</p>
                {toastItem.description && (
                  <p className="mt-0.5 text-sm text-ink-500">{toastItem.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toastItem.id)}
                aria-label="Dismiss notification"
                className="rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}