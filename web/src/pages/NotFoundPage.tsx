import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/layout/Container";

export function NotFoundPage() {
  return (
    <Container className="py-20 sm:py-28">
      <Reveal className="mx-auto flex max-w-lg flex-col items-center text-center" as="div">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
          <Compass className="h-8 w-8" aria-hidden />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get
          you back on the bridge.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to={ROUTES.home}>
            <Button>Go to home</Button>
          </Link>
          <Link to={ROUTES.ngos}>
            <Button variant="outline">Explore NGOs</Button>
          </Link>
        </div>
      </Reveal>
    </Container>
  );
}