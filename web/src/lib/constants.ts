import type {
  DonationStatus,
  ItemCondition,
  ProofType,
  Role,
} from "@/api/types";

export interface StatusMeta {
  label: string;
  badge: string;
  dot: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  DONOR: "Donor",
  NGO: "NGO",
  ADMIN: "Administrator",
};

export const DONATION_STATUS_ORDER: DonationStatus[] = [
  "CREATED",
  "PENDING_VERIFICATION",
  "AVAILABLE",
  "ACCEPTED_BY_NGO",
  "PICKUP_SCHEDULED",
  "COLLECTED",
  "RECEIVED_BY_NGO",
  "DISTRIBUTED",
  "COMPLETED",
];

export const STATUS_META: Record<DonationStatus, StatusMeta> = {
  CREATED: {
    label: "Created",
    badge: "bg-ink-100 text-ink-700 ring-ink-200",
    dot: "bg-ink-400",
  },
  PENDING_VERIFICATION: {
    label: "Pending verification",
    badge: "bg-accent-100 text-accent-800 ring-accent-200",
    dot: "bg-accent-500",
  },
  AVAILABLE: {
    label: "Available",
    badge: "bg-sky-100 text-sky-800 ring-sky-200",
    dot: "bg-sky-500",
  },
  ACCEPTED_BY_NGO: {
    label: "Accepted by NGO",
    badge: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  PICKUP_SCHEDULED: {
    label: "Pickup scheduled",
    badge: "bg-violet-100 text-violet-800 ring-violet-200",
    dot: "bg-violet-500",
  },
  COLLECTED: {
    label: "Collected",
    badge: "bg-cyan-100 text-cyan-800 ring-cyan-200",
    dot: "bg-cyan-500",
  },
  RECEIVED_BY_NGO: {
    label: "Received by NGO",
    badge: "bg-teal-100 text-teal-800 ring-teal-200",
    dot: "bg-teal-500",
  },
  DISTRIBUTED: {
    label: "Distributed",
    badge: "bg-brand-100 text-brand-800 ring-brand-200",
    dot: "bg-brand-500",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const CONDITION_META: Record<ItemCondition, { label: string; badge: string }> = {
  NEW: { label: "New", badge: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  LIKE_NEW: { label: "Like new", badge: "bg-brand-100 text-brand-800 ring-brand-200" },
  GOOD: { label: "Good", badge: "bg-sky-100 text-sky-800 ring-sky-200" },
  FAIR: { label: "Fair", badge: "bg-ink-100 text-ink-700 ring-ink-200" },
};

export const PROOF_TYPE_LABELS: Record<ProofType, string> = {
  DONATION_ITEM: "Donated items",
  PICKUP: "Pickup",
  DISTRIBUTION: "Distribution",
  NGO_VERIFICATION: "NGO verification",
  CONSENT_BASED: "Consent-based",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  STATUS_UPDATE: "Status update",
  MATCH: "Match",
  PICKUP: "Pickup",
  REVIEW: "Review",
  SYSTEM: "System",
};
