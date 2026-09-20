import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      {children}
    </div>
  );
}

export { Link as InternalLink };