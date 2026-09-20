import {
  BookOpen,
  GraduationCap,
  House,
  Shirt,
  ToyBrick,
  type LucideIcon,
} from "lucide-react";
import type { DonationCategory } from "@/api/types";

export interface CategoryMeta {
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  tint: string;
}

export const CATEGORY_META: Record<DonationCategory, CategoryMeta> = {
  CLOTHES: {
    label: "Clothes",
    shortLabel: "Clothes",
    description: "Clean, wearable clothing for children, women and men.",
    icon: Shirt,
    badge: "bg-rose-100 text-rose-800 ring-rose-200",
    tint: "bg-rose-50 text-rose-600",
  },
  BOOKS: {
    label: "Books",
    shortLabel: "Books",
    description: "Textbooks, storybooks and reading material of any age.",
    icon: BookOpen,
    badge: "bg-sky-100 text-sky-800 ring-sky-200",
    tint: "bg-sky-50 text-sky-600",
  },
  TOYS: {
    label: "Toys",
    shortLabel: "Toys",
    description: "Safe, complete toys that still bring joy to a child.",
    icon: ToyBrick,
    badge: "bg-accent-100 text-accent-800 ring-accent-200",
    tint: "bg-accent-50 text-accent-600",
  },
  EDUCATIONAL_MATERIALS: {
    label: "Educational materials",
    shortLabel: "Education",
    description: "Stationery, notebooks, art supplies and learning kits.",
    icon: GraduationCap,
    badge: "bg-violet-100 text-violet-800 ring-violet-200",
    tint: "bg-violet-50 text-violet-600",
  },
  HOUSEHOLD_ITEMS: {
    label: "Household items",
    shortLabel: "Household",
    description: "Utensils, bedding, and other gently used home essentials.",
    icon: House,
    badge: "bg-brand-100 text-brand-800 ring-brand-200",
    tint: "bg-brand-50 text-brand-600",
  },
};

export const CATEGORY_ORDER: DonationCategory[] = [
  "CLOTHES",
  "BOOKS",
  "TOYS",
  "EDUCATIONAL_MATERIALS",
  "HOUSEHOLD_ITEMS",
];
