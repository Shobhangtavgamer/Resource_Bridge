import { AlertTriangle, BadgeCheck, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationState = "verified" | "pending" | "suspended";

export interface VerificationBannerProps {
  state: VerificationState;
  orgName?: string | null;
  className?: string;
}

const CONFIG: Record<
  VerificationState,
  { title: string; body: string; className: string; icon: typeof BadgeCheck }
> = {
  verified: {
    title: "Your NGO is verified",
    body: "You can claim donations, schedule pickups and record distributions.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: BadgeCheck,
  },
  pending: {
    title: "Verification pending",
    body: "While you wait, you can browse available donations. Claiming and distribution unlock once an admin verifies your NGO.",
    className: "border-accent-200 bg-accent-50 text-accent-900",
    icon: Clock3,
  },
  suspended: {
    title: "This NGO account is suspended",
    body: "Actions are blocked on our side too — contact support to resolve this.",
    className: "border-red-200 bg-red-50 text-red-900",
    icon: AlertTriangle,
  },
};

export function VerificationBanner({ state, orgName, className }: VerificationBannerProps) {
  const config = CONFIG[state];
  const Icon = config.icon;
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3.5", config.className, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        <p className="text-sm font-semibold">
          {config.title}
          {orgName ? ` — ${orgName}` : ""}
        </p>
        <p className="mt-0.5 text-sm opacity-90">{config.body}</p>
      </div>
    </div>
  );
}