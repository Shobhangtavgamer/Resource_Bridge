import { Link } from "react-router-dom";
import {
  ArrowRight,
  CameraOff,
  ClipboardCheck,
  HandHeart,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/layout/Container";

interface StepProps {
  icon: LucideIcon;
  phase: string;
  title: string;
  body: string;
  last?: boolean;
}

const DONOR_STEPS: StepProps[] = [
  {
    icon: Package,
    phase: "For donors",
    title: "Create a donation",
    body: "List items with their category, condition and quantity. Add a pickup address and a preferred pickup time.",
  },
  {
    icon: ClipboardCheck,
    phase: "For donors",
    title: "Quality check",
    body: "Our team reviews the listing so that only genuinely useful items reach an NGO.",
  },
  {
    icon: Truck,
    phase: "For donors",
    title: "NGO picks up",
    body: "A verified NGO within your area claims the donation and schedules a doorstep pickup at a time you both agree on.",
  },
  {
    icon: PackageCheck,
    phase: "For donors",
    title: "Tracked distribution",
    body: "Watch your items move from pickup to delivery, completed with reviewed photo proof.",
  },
];

const NGO_STEPS: StepProps[] = [
  {
    icon: ShieldCheck,
    phase: "For NGOs",
    title: "Apply for verification",
    body: "Register with your organisation details and registration number. Our team verifies you once before you can claim items.",
  },
  {
    icon: HandHeart,
    phase: "For NGOs",
    title: "Claim nearby donations",
    body: "Browse quality-checked donations in your service radius and claim the ones you need most.",
  },
  {
    icon: Truck,
    phase: "For NGOs",
    title: "Collect & distribute",
    body: "Schedule pickups, collect items and record distribution with recipient counts.",
  },
  {
    icon: PackageCheck,
    phase: "For NGOs",
    title: "Upload reviewed proof",
    body: "Attach distribution photos without identifying children — admins approve them and donors see the result.",
  },
];

function JourneyColumn({ title, steps, tone }: { title: string; steps: StepProps[]; tone: "donor" | "ngo" }) {
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
      <h3 className="text-lg font-bold tracking-tight text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">
        {tone === "donor"
          ? "What happens after you give."
          : "How your organisation gets on the bridge."}
      </p>
      <ol className="mt-6 space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
              {index < steps.length - 1 && (
                <span aria-hidden className="absolute left-[21px] top-12 h-[calc(100%-3rem)] w-px bg-ink-200" />
              )}
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone === "donor" ? "bg-brand-50 text-brand-600" : "bg-accent-50 text-accent-600"}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-ink-400">
                  {step.phase} · {String(index + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-1 text-base font-semibold text-ink-900">{step.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function HowItWorksPage() {
  useDocumentTitle("How it works");

  return (
    <div>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-transparent">
        <Container className="py-16 text-center sm:py-20">
          <Reveal y={12}>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">How it works</p>
            <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
              A transparent pipeline from your home to a neighbour in need
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-500">
              Every donation passes through the same reviewed, recorded journey. This is how it
              works — for donors and for NGOs.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <JourneyColumn title="For donors" steps={DONOR_STEPS} tone="donor" />
          </Reveal>
          <Reveal delay={120}>
            <JourneyColumn title="For NGOs" steps={NGO_STEPS} tone="ngo" />
          </Reveal>
        </Container>
      </section>

      <section className="bg-ink-900 py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center" as="div">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-brand-400">
              <CameraOff className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              One rule above everything: children are never exposed
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-300">
              Photos that could identify a child are automatically blocked from distribution
              proof unless a recorded, verifiable consent reference exists on file. This is
              enforced by the platform — it can&apos;t be switched off.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={ROUTES.register}>
                <Button size="lg" leftIcon={<Package className="h-5 w-5" />}>
                  Start a donation
                </Button>
              </Link>
              <Link to={ROUTES.ngos}>
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                  Explore NGOs
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}