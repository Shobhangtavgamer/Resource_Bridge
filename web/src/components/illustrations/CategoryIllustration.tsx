import type { DonationCategory } from "@/api/types";

export const CATEGORY_TINTS: Record<
  DonationCategory,
  { bg: string; main: string; mid: string; deep: string }
> = {
  CLOTHES: { bg: "#ffe4e6", main: "#fb7185", mid: "#f43f5e", deep: "#be123c" },
  BOOKS: { bg: "#e0f2fe", main: "#7dd3fc", mid: "#0ea5e9", deep: "#0369a1" },
  TOYS: { bg: "#fef3c7", main: "#fcd34d", mid: "#f59e0b", deep: "#b45309" },
  EDUCATIONAL_MATERIALS: { bg: "#ede9fe", main: "#c4b5fd", mid: "#8b5cf6", deep: "#6d28d9" },
  HOUSEHOLD_ITEMS: { bg: "#d6f5e3", main: "#86efac", mid: "#22c55e", deep: "#128157" },
};

const CATEGORY_IMAGES: Record<DonationCategory, string> = {
  CLOTHES: "/clothes.avif",
  BOOKS: "/books.jpg",
  TOYS: "/toys.jpg",
  EDUCATIONAL_MATERIALS: "/stationery items.jpg",
  HOUSEHOLD_ITEMS: "/householditems.jpg",
};

const ARIA_LABELS: Record<DonationCategory, string> = {
  CLOTHES: "Photo of clothes donation",
  BOOKS: "Photo of books donation",
  TOYS: "Photo of toys donation",
  EDUCATIONAL_MATERIALS: "Photo of educational materials donation",
  HOUSEHOLD_ITEMS: "Photo of household items donation",
};

export function CategoryIllustration({
  category,
  className,
}: {
  category: DonationCategory;
  className?: string;
}) {
  const imageSrc = CATEGORY_IMAGES[category];
  const ariaLabel = ARIA_LABELS[category];

  return (
    <img
      src={imageSrc}
      alt={ariaLabel}
      className={`rounded-xl w-full h-48 object-cover ${className || ""}`}
      loading="lazy"
    />
  );
}