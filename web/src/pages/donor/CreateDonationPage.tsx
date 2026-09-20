import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, MapPin, Package, PlusCircle, Trash2 } from "lucide-react";
import { donationsApi } from "@/api/endpoints";
import type { DonationCategory, DonationItemInput, ItemCondition } from "@/api/types";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { CONDITION_META } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useCurrentUser } from "@/store/auth.store";
import { toApiError } from "@/api/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { Option } from "@/components/ui/Select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

interface DraftItem {
  id: number;
  category: DonationCategory;
  title: string;
  condition: ItemCondition;
  quantity: string;
  ageGroup: string;
  description: string;
}

interface FieldErrors {
  city?: string;
  pickupAddressLine?: string;
  pickupPincode?: string;
  preferredPickupDate?: string;
  notes?: string;
  items?: string;
  item?: Record<number, { title?: string; quantity?: string }>;
}

const categoryOptions: Option[] = CATEGORY_ORDER.map((value) => ({
  value,
  label: CATEGORY_META[value].label,
}));

const conditionOptions: Option[] = (Object.keys(CONDITION_META) as ItemCondition[]).map(
  (value) => ({ value, label: CONDITION_META[value].label }),
);

let nextItemId = 1;

function blankItem(): DraftItem {
  return {
    id: nextItemId++,
    category: "CLOTHES",
    title: "",
    condition: "GOOD",
    quantity: "1",
    ageGroup: "",
    description: "",
  };
}

export function CreateDonationPage() {
  useDocumentTitle("Create a donation");
  const navigate = useNavigate();
  const toast = useToast();
  const user = useCurrentUser();

  const [city, setCity] = useState(user?.donor?.city ?? "");
  const [pickupAddressLine, setPickupAddressLine] = useState(user?.donor?.defaultAddress ?? "");
  const [pickupPincode, setPickupPincode] = useState(user?.donor?.pincode ?? "");
  const [preferredPickupDate, setPreferredPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>(() => [blankItem()]);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (id: number, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    if (errors.item?.[id]) {
      setErrors((current) => {
        const item = current.item ? { ...current.item } : {};
        delete item[id];
        return { ...current, item };
      });
    }
  };

  const removeItem = (id: number) => {
    setItems((current) =>
      current.length > 1 ? current.filter((item) => item.id !== id) : current,
    );
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!city.trim()) next.city = "City is required.";
    if (!pickupAddressLine.trim() || pickupAddressLine.trim().length < 5)
      next.pickupAddressLine = "Enter a full pickup address (min. 5 characters).";
    if (pickupPincode && pickupPincode.length > 10)
      next.pickupPincode = "Keep the pincode under 10 characters.";
    if (preferredPickupDate && Number.isNaN(new Date(preferredPickupDate).getTime()))
      next.preferredPickupDate = "Choose a valid pickup time.";

    if (items.length === 0) {
      next.items = "Add at least one item.";
    } else {
      const itemErrors: NonNullable<FieldErrors["item"]> = {};
      for (const item of items) {
        if (!item.title.trim()) itemErrors[item.id] = { ...itemErrors[item.id], title: "Give the item a short name." };
        else if (item.title.trim().length < 2) itemErrors[item.id] = { ...itemErrors[item.id], title: "Name must be at least 2 characters." };
        if (item.quantity) {
          const qty = Number(item.quantity);
          if (!Number.isInteger(qty) || qty < 1 || qty > 999)
            itemErrors[item.id] = { ...itemErrors[item.id], quantity: "Quantity must be 1–999." };
        }
      }
      if (Object.keys(itemErrors).length > 0) next.item = itemErrors;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Check the form", "Some fields need your attention.");
      return;
    }

    const payloadItems: DonationItemInput[] = items.map((item) => ({
      category: item.category,
      title: item.title.trim(),
      condition: item.condition,
      quantity: item.quantity ? Number(item.quantity) : 1,
      ageGroup: item.ageGroup.trim() || undefined,
      description: item.description.trim() || undefined,
    }));

    const payload = {
      city: city.trim(),
      pickupAddressLine: pickupAddressLine.trim(),
      pickupPincode: pickupPincode.trim() || undefined,
      preferredPickupDate: preferredPickupDate
        ? new Date(preferredPickupDate).toISOString()
        : undefined,
      notes: notes.trim() || undefined,
      items: payloadItems,
    };

    setSubmitting(true);
    try {
      const { donation } = await donationsApi.create(payload);
      toast.success(
        "Donation created",
        `${donation.donationCode} is ready — our team will verify it shortly.`,
      );
      navigate(ROUTES.donor.donation(donation.id));
    } catch (caught) {
      const error = toApiError(caught);
      toast.error("Couldn't create the donation", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Donor"
        title="Create a donation"
        description="Tell us what you're giving and where to collect it from. You can add up to 50 items per donation."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-600" aria-hidden />
              <CardTitle>Pickup details</CardTitle>
            </div>
            <CardDescription>Where should the NGO collect the items from?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="City"
                placeholder="Mumbai"
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                error={errors.city}
              />
              <Input
                label="Pincode"
                inputMode="numeric"
                placeholder="400001"
                value={pickupPincode}
                onChange={(event) => setPickupPincode(event.target.value)}
                error={errors.pickupPincode}
              />
              <Input
                label="Preferred pickup time (optional)"
                type="datetime-local"
                value={preferredPickupDate}
                onChange={(event) => setPreferredPickupDate(event.target.value)}
                error={errors.preferredPickupDate}
                leftIcon={<CalendarClock className="h-4 w-4" aria-hidden />}
              />
            </div>
            <Input
              label="Pickup address"
              placeholder="Flat, building, street, area, landmark"
              required
              value={pickupAddressLine}
              onChange={(event) => setPickupAddressLine(event.target.value)}
              error={errors.pickupAddressLine}
              hint="The claiming NGO will arrive here at your preferred time."
            />
            <Textarea
              label="Notes for the NGO (optional)"
              placeholder="e.g. Items are on the ground floor, ring the bell twice…"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-600" aria-hidden />
              <CardTitle>Items</CardTitle>
            </div>
            <CardDescription>
              Describe each item. Be honest about condition — our verification team will check.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {errors.items && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {errors.items}
              </p>
            )}
            {items.map((item, index) => {
              const itemErrors = errors.item?.[item.id];
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl border border-ink-200 bg-ink-50/40 p-4",
                    itemErrors && "border-red-300",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-700">Item {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
                    <Select
                      label="Category"
                      value={item.category}
                      onChange={(event) =>
                        updateItem(item.id, { category: event.target.value as DonationCategory })
                      }
                      options={categoryOptions}
                    />
                    <Select
                      label="Condition"
                      value={item.condition}
                      onChange={(event) =>
                        updateItem(item.id, { condition: event.target.value as ItemCondition })
                      }
                      options={conditionOptions}
                    />
                    <Input
                      label="Quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={999}
                      value={item.quantity}
                      onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
                      error={itemErrors?.quantity}
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Item name *"
                      placeholder="e.g. Blue winter pullover, size 8 years"
                      value={item.title}
                      onChange={(event) => updateItem(item.id, { title: event.target.value })}
                      error={itemErrors?.title}
                    />
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Age group (optional)"
                      placeholder="e.g. 6–12 years"
                      value={item.ageGroup}
                      onChange={(event) => updateItem(item.id, { ageGroup: event.target.value })}
                    />
                    <Input
                      label="Short description (optional)"
                      placeholder="Warm fabric, small tear at the cuff"
                      value={item.description}
                      onChange={(event) => updateItem(item.id, { description: event.target.value })}
                    />
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              leftIcon={<PlusCircle className="h-4 w-4" aria-hidden />}
              onClick={() => setItems((current) => (current.length < 50 ? [...current, blankItem()] : current))}
            >
              Add another item
            </Button>
          </CardContent>
          <CardFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(ROUTES.donor.root)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} leftIcon={<Package className="h-4 w-4" aria-hidden />}>
              Publish donation
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}