import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { ngoApi } from "@/api/endpoints";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { useAsync } from "@/hooks/useAsync";
import { NgoCard } from "@/components/ui/NgoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Container } from "@/components/layout/Container";

function capitalize(value: string): string {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1).toLowerCase() : "";
}

export function NgoDirectoryPage() {
  useDocumentTitle("Find an NGO");
  const [city, setCity] = useState("");

  const { data, loading, error, refetch } = useAsync(
    (signal) => ngoApi.list(city ? { city } : {}, signal),
    [city],
  );

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const ngo of data?.ngos ?? []) if (ngo.city) set.add(ngo.city);
    return [...set].sort();
  }, [data]);

  const hasResults = Boolean(city) && (data?.ngos.length ?? 0) > 0;

  return (
    <div>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-transparent">
        <Container className="py-16 sm:py-20">
          <Reveal y={12} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Find an NGO</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
              Verified NGOs on the bridge
            </h1>
            <p className="mt-4 text-base text-ink-500">
              Every organisation below has been verified by our team and is ready to receive
              quality-checked donations in its service area.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <Input
                label="Filter by city"
                leftIcon={<Search className="h-4 w-4" aria-hidden />}
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                hint="Leave empty to see every verified NGO."
                autoComplete="off"
              />
            </div>
            {!city && cities.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-ink-400">Cities:</span>
                {cities.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCity(name)}
                    className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    <MapPin className="h-3 w-3" aria-hidden />
                    {capitalize(name)}
                  </button>
                ))}
              </div>
            )}
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              error={error}
              title="Couldn't load NGOs"
              onRetry={refetch}
              action={
                <Link to={ROUTES.register}>
                  <Button variant="outline" size="sm">
                    Register your NGO instead
                  </Button>
                </Link>
              }
            />
          ) : data && data.ngos.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-ink-500" role="status">
                {data.ngos.length} verified{" "}
                {capitalize(city) ? `NGO${data.ngos.length === 1 ? "" : "s"} in ${capitalize(city)}` : `NGO${data.ngos.length === 1 ? "" : "s"}`}
              </p>
              <Stagger
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                stagger={80}
                delay={40}
              >
                {data.ngos.map((ngo) => (
                  <NgoCard key={ngo.id} ngo={ngo} className="h-full" />
                ))}
              </Stagger>
            </>
          ) : (
            <EmptyState
              icon={<Search className="h-7 w-7" aria-hidden />}
              title={hasResults ? "No verified NGOs here yet" : "No NGOs to show"}
              description={
                hasResults
                  ? `We couldn't find a verified NGO in ${capitalize(city)}. Try another city or check back soon — new NGOs join every week.`
                  : "New organisations are being verified all the time. Check back soon."
              }
              action={
                <Link to={ROUTES.register}>
                  <Button size="sm">Register your NGO</Button>
                </Link>
              }
            />
          )}
        </Container>
      </section>
    </div>
  );
}