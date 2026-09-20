import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CameraOff,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  HandHeart,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Container } from "@/components/layout/Container";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const MISSION: Feature[] = [
  {
    icon: Package,
    title: "From crowded storerooms",
    body: "Wardrobes, bookshelves and cupboards hold usable items people no longer need. Left to gather dust, they eventually become waste.",
  },
  {
    icon: HandHeart,
    title: "To structured giving",
    body: "Resource Bridge converts that surplus into listed, quality-checked donations that verified NGOs can claim and deliver where they are needed.",
  },
  {
    icon: Eye,
    title: "With proof every step",
    body: "Donors never lose sight of their items. Every hand-off is recorded and every distribution is backed by reviewed photo proof.",
  },
];

const PROBLEMS: Feature[] = [
  {
    icon: Search,
    title: "Givers can't find real recipients",
    body: "People want to give, but many don't know which organisations truly deliver, so useful items never leave the house.",
  },
  {
    icon: ShieldCheck,
    title: "Recipients can't be sure",
    body: "With no verification in place, it's hard for donors to trust where their items end up — and easy for bad actors to take advantage.",
  },
  {
    icon: Eye,
    title: "No visibility after the hand-off",
    body: "Once a donation leaves the doorstep, donors typically never hear about it again. There is no record, no confirmation, no closure.",
  },
  {
    icon: CameraOff,
    title: "Children exposed in 'thank-you' photos",
    body: "Distribution photos are often shared publicly without consent, putting the safety of children and families at risk.",
  },
];

const STEPS: Feature[] = [
  {
    icon: Package,
    title: "List a donation",
    body: "Add items with category, condition and quantity, plus a pickup address and preferred time.",
  },
  {
    icon: ClipboardCheck,
    title: "Quality check",
    body: "The listing is reviewed so that only genuinely useful items are made available to NGOs.",
  },
  {
    icon: Truck,
    title: "NGO pickup",
    body: "A verified NGO claims the donation and collects it at an agreed, scheduled time.",
  },
  {
    icon: PackageCheck,
    title: "Tracked distribution",
    body: "The NGO distributes the items and records the outcome with reviewed proof.",
  },
];

const LIFE_CYCLE = [
  "Pending verification",
  "Available",
  "Pickup scheduled",
  "Picked up",
  "Received by NGO",
  "Distributed",
];

const VERIFICATION: Feature[] = [
  {
    icon: FileCheck2,
    title: "Organisation documents",
    body: "NGOs register with their official name, registration number and supporting documents.",
  },
  {
    icon: BadgeCheck,
    title: "Admin review",
    body: "The platform team checks every application before the organisation can interact with donations.",
  },
  {
    icon: ShieldCheck,
    title: "Verified badge",
    body: "Approved NGOs carry a Verified badge shown across the platform and to donors at a glance.",
  },
];

const SAFETY: Feature[] = [
  {
    icon: CameraOff,
    title: "Children are never exposed",
    body: "Photos that could identify a child are rejected from distribution proof unless a recorded, verifiable consent reference exists on file.",
  },
  {
    icon: ShieldCheck,
    title: "Enforced, not optional",
    body: "The child-safety rule is enforced by the platform itself — it can't be switched off by any user or role.",
  },
  {
    icon: CheckCircle2,
    title: "Proof is reviewed",
    body: "Distribution evidence is checked by administrators before it is shown to donors, keeping everything accurate and respectful.",
  },
];

function Heading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
      {body && <p className="mt-3 text-base leading-relaxed text-ink-500">{body}</p>}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }: Feature) {
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-card">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}

export function AboutPage() {
  useDocumentTitle("About us");

  return (
    <div>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-transparent">
        <Container className="py-16 text-center sm:py-20">
          <Reveal y={12}>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">About us</p>
            <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
              A trusted bridge between giving and need
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-500">
              Resource Bridge connects donors with verified NGOs so that usable items reach the
              people who need them — recorded, reviewed and respected at every step.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Heading
            eyebrow="What is Resource Bridge"
            title="Giving that is easy, verifiable and accountable"
          />
          <Stagger className="mt-10 grid gap-6 md:grid-cols-3" stagger={80} delay={80}>
            {MISSION.map((feature) => (
              <div key={feature.title} className="h-full">
                <FeatureCard {...feature} />
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="bg-ink-50/60 py-12 sm:py-16">
        <Container>
          <Heading
            eyebrow="The problem we solve"
            title="Useful items, stuck on the wrong side of the bridge"
            body="Four gaps stop good donations from reaching people who need them."
          />
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={70} delay={80}>
            {PROBLEMS.map((problem) => (
              <div key={problem.title} className="h-full">
                <FeatureCard {...problem} />
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Heading
            eyebrow="How the platform works"
            title="One pipeline, from your home to a neighbour in need"
          />
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={70} delay={80}>
            {STEPS.map((step) => (
              <div key={step.title} className="h-full">
                <FeatureCard {...step} />
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="bg-ink-50/60 py-12 sm:py-16">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <Reveal>
              <HeaderDot label="Transparency" />
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                Every donation is tracked from listing to delivered
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-500">
                A donation moves through a recorded lifecycle, and donors can follow it at any
                time. Nothing disappears after the hand-off.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Real-time status history for every donation",
                  "Distribution recorded with recipient counts",
                  "Photo proof reviewed by admins before donors see it",
                  "The receiving NGO's identity is visible, not anonymous",
                ].map((item, index) => (
                  <Reveal as="li" key={item} delay={index * 70} className="flex items-start gap-2.5 text-sm text-ink-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    {item}
                  </Reveal>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120} className="rounded-3xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400">
                Donation lifecycle
              </p>
              <ol className="mt-5 space-y-4">
                {LIFE_CYCLE.map((stage, index) => (
                  <li key={stage} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-ink-800">{stage}</span>
                    {index === 0 && <Badge tone="info">Reviewed</Badge>}
                    {index === 1 && <Badge tone="success">Claimable by verified NGOs</Badge>}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Heading
            eyebrow="Verified NGOs"
            title="Only real organisations get on the bridge"
            body="Verification happens before an NGO can claim a single item. Every approved organisation is accountable to the platform."
          />
          <Stagger className="mt-10 grid gap-6 md:grid-cols-3" stagger={80} delay={80}>
            {VERIFICATION.map((step) => (
              <div key={step.title} className="h-full">
                <FeatureCard {...step} />
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="bg-ink-900 py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-brand-400">
              <ShieldCheck className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Privacy and child safety are non-negotiable
            </h2>
          </Reveal>
          <Stagger className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3" stagger={90} delay={100}>
            {SAFETY.map((item) => (
              <div key={item.title} className="h-full rounded-3xl border border-white/10 bg-white/5 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand-400">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{item.body}</p>
              </div>
            ))}
          </Stagger>
          <Reveal delay={120} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={ROUTES.howItWorks}>
              <Button size="lg" variant="secondary">
                See how it works
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link to={ROUTES.register}>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                Start giving today
              </Button>
            </Link>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}

function HeaderDot({ label }: { label: string }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{label}</p>;
}