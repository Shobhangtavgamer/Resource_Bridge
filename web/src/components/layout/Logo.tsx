import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <circle cx="25" cy="8" r="3" className="fill-accent-400" />
      <path
        d="M4 22 Q16 6 28 22"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <path
        d="M4 22 V27 M28 22 V27 M4 22 H28"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  to = "/",
  className,
  wordmarkClassName,
}: {
  to?: string;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("inline-flex items-center gap-2 text-brand-700", className)}
      aria-label="Resource Bridge home"
    >
      <LogoMark />
      <span className={cn("font-fraunces text-lg font-semibold text-ink-900", wordmarkClassName)}>
        Resource<span className="text-brand-600">Bridge</span>
      </span>
    </Link>
  );
}