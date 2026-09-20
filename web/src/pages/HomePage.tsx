import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CameraOff,
  CheckCircle2,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  MapPin,
  Package,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { donationsApi, ngoApi } from "@/api/endpoints";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAsync } from "@/hooks/useAsync";
import { useCountUp } from "@/hooks/useCountUp";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Container } from "@/components/layout/Container";
import { CategoryIllustration } from "@/components/illustrations/CategoryIllustration";

/* --------------------------- landing building blocks --------------------------- */

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}

function SectionHeading({ eyebrow, title, description, align = "center" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink-900 text-balance sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-ink-500">{description}</p>}
    </div>
  );
}

/* ----------------------------------- hero ----------------------------------- */

const HERO_STEPS: { label: string; dot: string }[] = [
  { label: "Created", dot: "bg-ink-400" },
  { label: "Verified", dot: "bg-accent-500" },
  { label: "Available", dot: "bg-sky-500" },
  { label: "Picked up", dot: "bg-violet-500" },
  { label: "Distributed", dot: "bg-brand-500" },
  { label: "Done", dot: "bg-emerald-500" },
];

function HeroPanel() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/50 via-accent-100/40 to-sky-200/50 blur-2xl" />
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-lift sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Package className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Children's winter clothes</p>
                <p className="text-xs text-ink-400">5 items · Mumbai</p>
              </div>
            </div>
            <Badge tone="info" dot>
              Available
            </Badge>
          </div>

          <div className="my-5 flex items-center gap-1">
            {HERO_STEPS.map((step, index) => (
              <span key={step.label} className="flex flex-1 flex-col items-start gap-1.5">
                <span className="relative flex w-full items-center">
                  <span className={cn("z-10 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white", step.dot)} />
                  {index < HERO_STEPS.length - 1 && (
                    <span className="mx-1 h-0.5 flex-1 rounded bg-ink-200" />
                  )}
                </span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {HERO_STEPS.slice(0, 4).map((step) => (
              <span key={step.label} className="flex items-center gap-1 text-[11px] font-medium text-ink-500">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {step.label}
              </span>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-ink-100 bg-ink-50 p-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink-800">
                  Distribution proof reviewed & approved
                </p>
                <p className="mt-0.5 text-[11px] text-ink-400">
                  Child photos never shown without verifiable consent
                </p>
              </div>
              <BadgeCheck className="ml-auto h-5 w-5 shrink-0 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 shadow-card">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <HeartHandshake className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-800">1,200+</p>
              <p className="text-[11px] text-ink-400">items matched</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 shadow-card">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Truck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-800">End-to-end</p>
              <p className="text-[11px] text-ink-400">tracked journeys</p>
            </div>
          </div>
        </div>
      </div>

      <span className="absolute -left-4 top-6 hidden animate-float rounded-2xl border border-brand-200 bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-lift sm:inline-flex sm:items-center sm:gap-1.5">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Community-verified
      </span>
    </div>
  );
}

/* -------------------------------- how it works ------------------------------- */

const STEPS: { icon: LucideIcon; step: string; title: string; body: string }[] = [
  {
    icon: Package,
    step: "01",
    title: "List what you have",
    body: "Tell us the items, category and condition. Pick a pickup time that works for you — it takes under five minutes.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "We verify the donation",
    body: "Our team reviews every listing so needy communities receive genuinely useful, quality-checked items.",
  },
  {
    icon: HandHeart,
    step: "03",
    title: "An NGO claims & collects",
    body: "Verified NGOs in your area claim the donation and schedule a pickup at your doorstep.",
  },
  {
    icon: PackageCheck,
    step: "04",
    title: "Track it to the finish line",
    body: "Follow every step — pickup, delivery and distribution — backed up by reviewed photo proof.",
  },
];

/* ------------------------------ transparency ------------------------------ */

const TRANSPARENCY_POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ClipboardList,
    title: "A visible status journey",
    body: "Every donation moves through named, reviewable steps. Donors can see exactly where their items are at all times.",
  },
  {
    icon: CameraOff,
    title: "Privacy that is never optional",
    body: "Photos that could identify a child are blocked automatically unless a verifiable consent reference exists.",
  },
  {
    icon: Award,
    title: "Proof reviewed by admins",
    body: "Distribution photos are reviewed by our team before a donation is considered complete.",
  },
];

/* --------------------------------- reasons --------------------------------- */

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BadgeCheck,
    title: "Only verified NGOs",
    body: "Every NGO passes a manual verification before it can claim a single item.",
  },
  {
    icon: MapPin,
    title: "Nearby, not far away",
    body: "Donations are routed to NGOs within their service radius, cutting fuel and logistics waste.",
  },
  {
    icon: HeartHandshake,
    title: "Giving with integrity",
    body: "No cash changes hands. What you give is exactly what someone receives.",
  },
  {
    icon: Truck,
    title: "Doorstep convenience",
    body: "NGOs collect from your home on a schedule you choose — no drop-offs, no hassle.",
  },
];

/* ----------------------------------- page ----------------------------------- */

interface StringBuilderProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

function StatBuilder({ label, value, icon: Icon }: StringBuilderProps) {
  const { ref, value: displayValue } = useCountUp(typeof value === "number" ? value : 0);
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-ink-200 bg-white px-6 py-5 text-center shadow-card sm:flex-row sm:gap-3 sm:text-left">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p
          ref={ref}
          className="font-display text-2xl font-semibold tabular-nums text-ink-900"
        >
          {displayValue}
        </p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </div>
  );
}

export function HomePage() {
  useDocumentTitle();

  const { data: stats, loading } = useAsync(async (signal) => {
    const [{ ngos }, open] = await Promise.all([
      ngoApi.list({}, signal),
      donationsApi.listOpen({}, signal),
    ]);
    const cities = new Set<string>();
    for (const ngo of ngos) if (ngo.city) cities.add(ngo.city);
    return {
      verifiedNgos: ngos.length,
      openDonations: open.donations.length,
      coveredCities: cities.size,
    };
  }, []);

  const showStats = !(stats === null && !loading);

  return (
    <div className="overflow-hidden">
      {/* ------------------------------- hero ------------------------------- */}
      <section className="grain relative isolate">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-brand-50 via-brand-50/40 to-transparent" />
        <Container className="grid items-center gap-12 pb-16 pt-16 sm:pt-20 lg:grid-cols-2 lg:gap-10 lg:pb-24 lg:pt-24">
          <Reveal className="max-w-2xl">
            <Badge tone="brand" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Give what you have, where it&apos;s needed
            </Badge>
            <h1 className="font-display text-5xl font-semibold leading-[1.04] text-ink-900 text-balance sm:text-6xl xl:text-7xl">
              Unused resources become useful — for
              <span className="text-brand-600"> someone who needs them</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              Resource Bridge connects your spare clothes, books and household items to verified
              NGOs. Every donation is tracked, every distribution is proved, and the children
              receiving them are never exposed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to={ROUTES.register}>
                <Button size="lg" className="w-full sm:w-auto" leftIcon={<HeartHandshake className="h-5 w-5" />}>
                  Donate now
                </Button>
              </Link>
              <Link to={ROUTES.ngos}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Find an NGO
                </Button>
              </Link>
              <Link to={ROUTES.howItWorks} className="text-center text-sm font-semibold text-brand-700 underline-offset-4 hover:underline sm:text-left">
                Learn how it works
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden />
                Free to give
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden />
                Scheduled doorstep pickup
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden />
                Photo proof of distribution
              </li>
            </ul>
          </Reveal>

          <Reveal delay={150}>
            <HeroPanel />
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------ live stats ------------------------------ */}
      {showStats && (
        <section className="border-y border-ink-200 bg-white/70">
          <Container className="py-8 sm:py-10">
            <div className="grid gap-4 sm:grid-cols-3">
              {loading ? (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-[74px] animate-pulse rounded-2xl bg-ink-100" />
                  ))}
                </>
              ) : (
                <>
                  <Reveal>
                    <StatBuilder
                      icon={HeartHandshake}
                      label="Verified NGOs on the bridge"
                      value={stats?.verifiedNgos ?? 0}
                    />
                  </Reveal>
                  <Reveal delay={90}>
                    <StatBuilder
                      icon={Package}
                      label="Donations currently listed"
                      value={stats?.openDonations ?? 0}
                    />
                  </Reveal>
                  <Reveal delay={180}>
                    <StatBuilder
                      icon={MapPin}
                      label="Cities being connected"
                      value={stats?.coveredCities ?? 0}
                    />
                  </Reveal>
                </>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ---------------------------- how it works ---------------------------- */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="How Resource Bridge works"
            title="Four steps from your home to someone who needs it"
            description="A simple, transparent pipeline designed around one idea: nothing given should ever be wasted."
          />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal
                  as="li"
                  key={step.step}
                  delay={index * 90}
                  className="relative rounded-2xl border border-ink-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="absolute right-5 top-5 font-display text-3xl font-semibold text-ink-100" aria-hidden>
                    {step.step}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-300 lg:block" aria-hidden />
                  )}
                </Reveal>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ---------------------------- categories ---------------------------- */}
      <section className="grain bg-ink-900 py-16 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal className="max-w-2xl">
              <SectionHeading
                align="left"
                eyebrow="Donation categories"
                title="What can you give today?"
                description="These are the categories communities ask for most. If it's clean, working and safe, it can help."
              />
            </Reveal>
            <Reveal delay={100}>
              <Link to={ROUTES.register}>
                <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                  Start donating
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_ORDER.map((category, index) => {
              const meta = CATEGORY_META[category];
              return (
                <Reveal
                  key={category}
                  delay={index * 70}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-lift"
                >
                  <div className="overflow-hidden rounded-xl">
                    <CategoryIllustration
                      category={category}
                      className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-white">{meta.label}</h3>
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] font-medium text-ink-300">
                      {meta.shortLabel}
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-300 line-clamp-2">
                    {meta.description}
                  </p>
                </Reveal>
              );
            })}

            <Reveal
              delay={350}
              className="flex flex-col items-start justify-center gap-4 rounded-2xl border border-dashed border-brand-400/50 bg-brand-950/30 p-5 transition-all duration-300 hover:bg-brand-950/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Something else in mind?</h3>
                <p className="mt-1 text-sm text-ink-300">
                  List it anyway — our verification team will route it to the community that needs it most.
                </p>
              </div>
              <Link to={ROUTES.register} className="shrink-0">
                <Button className="bg-white text-brand-800 hover:bg-ink-100" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
                  Start donating
                </Button>
              </Link>
            </Reveal>
          </div>

          <p className="mt-8 text-center text-sm text-ink-400">
            Not sure? List it — our team reviews every donation for what is most needed.
          </p>
        </Container>
      </section>

      {/* ----------------------------- transparency ----------------------------- */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Radical transparency"
                title="You can watch your donation reach someone"
                description="No black boxes. When you give through Resource Bridge, every milestone is recorded and visible to you."
              />
              <ul className="mt-8 space-y-5">
                {TRANSPARENCY_POINTS.map((point, pointIndex) => {
                  const Icon = point.icon;
                  return (
                    <Reveal as="li" key={point.title} delay={pointIndex * 70}>
                      <div className="flex gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-ink-900">{point.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-ink-500">{point.body}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </ul>
            </Reveal>
            <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400">
                A donation&apos;s journey
              </p>
              <div className="mt-6 flex gap-1.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, stepIndex) => (
                  <span
                    key={stepIndex}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      stepIndex < 4 ? "bg-brand-500" : "bg-ink-200",
                    )}
                  />
                ))}
              </div>
              <ol className="mt-5 space-y-0">
                {[
                  { status: "Created", detail: "You listed 3 items", tone: "bg-ink-400" },
                  { status: "Verified", detail: "Quality check passed", tone: "bg-accent-500" },
                  { status: "Available", detail: "Seen by 12 NGOs", tone: "bg-sky-500" },
                  { status: "Picked up", detail: "Collected from home", tone: "bg-violet-500" },
                  { status: "Distributed", detail: "Shared with 8 families", tone: "bg-brand-500" },
                ].map((entry, index) => (
                  <Reveal as="li" key={entry.status} delay={index * 80} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < 4 && (
                      <span aria-hidden className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-ink-200" />
                    )}
                    <span aria-hidden className={cn("relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-ink-50", entry.tone)} />
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold text-ink-900">{entry.status}</p>
                      <p className="text-xs text-ink-400">{entry.detail}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
              <div className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
                <span className="font-semibold">Delivered side by side:</span>{" "}
                <span className="text-brand-700">reviewed distribution proof — never a child&apos;s face without consent.</span>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* --------------------------------- reasons --------------------------------- */}
      <section className="bg-brand-50/60 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Why Resource Bridge"
            title="A bridge built on trust, not on faith"
            description="We designed every detail so that both donors and NGOs can give without doubt."
          />
          <Stagger
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={70}
            delay={80}
          >
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <div key={reason.title} className="h-full rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink-900">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{reason.body}</p>
                </div>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* ----------------------------- NGO participation ----------------------------- */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grain relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-14 sm:px-12 sm:py-16">
            <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <Reveal y={12}>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-400">
                  For NGOs
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-white text-balance sm:text-3xl">
                  Join the bridge as a verified NGO
                </h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-300">
                  Claim quality-checked donations within your service radius, schedule pickups,
                  and record distributions with proof — all in one place.
                </p>
                <Stagger as="ul" className="mt-6 space-y-3 text-sm text-ink-200" stagger={70} delay={80}>
                  {[
                    "Get verified once by our team, then receive donations automatically",
                    "Set your service area and receive matched listings first",
                    "Upload distribution proof that donors and admins can review",
                  ].map((benefit) => (
                    <span key={benefit} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-400" aria-hidden />
                      {benefit}
                    </span>
                  ))}
                </Stagger>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={ROUTES.register}>
                    <Button size="lg" className="w-full bg-white text-ink-900 hover:bg-ink-100 sm:w-auto">
                      Register your NGO
                    </Button>
                  </Link>
                  <Link to={ROUTES.howItWorks}>
                    <Button size="lg" variant="ghost" className="w-full text-white hover:bg-white/10 sm:w-auto">
                      See how NGOs participate
                    </Button>
                  </Link>
                </div>
              </Reveal>
              <Stagger className="flex items-center justify-center" stagger={90} delay={120}>
                <div className="grid w-full max-w-sm grid-cols-2 gap-4" aria-hidden>
                  {[
                    { icon: BadgeCheck, label: "Verified once" },
                    { icon: MapPin, label: "Local radius" },
                    { icon: Truck, label: "Scheduled pickups" },
                    { icon: BookOpen, label: "Tracked records" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
                      <Icon className="mx-auto h-6 w-6 text-brand-400" aria-hidden />
                      <p className="mt-3 text-xs font-medium text-white">{label}</p>
                    </div>
                  ))}
                </div>
              </Stagger>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------- final CTA -------------------------------- */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <Reveal className="grain rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-accent-50 px-6 py-14 text-center sm:px-12">
            <Sparkles className="mx-auto h-8 w-8 text-brand-600" aria-hidden />
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-semibold text-ink-900 text-balance sm:text-3xl">
              Somewhere right now, a wardrobe is waiting to become a warm winter for someone
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-ink-500">
              Start with one donation. The bridge handles everything else.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={ROUTES.register}>
                <Button size="lg" leftIcon={<HeartHandshake className="h-5 w-5" />}>
                  Donate now
                </Button>
              </Link>
              <Link to={ROUTES.ngos}>
                <Button size="lg" variant="outline">
                  Explore NGOs
                </Button>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}