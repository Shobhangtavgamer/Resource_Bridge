import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CategoryIllustration } from "@/components/illustrations/CategoryIllustration";

export function CategoriesPage() {
  useDocumentTitle("Donation categories");

  return (
    <div>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-transparent">
        <Container className="py-16 text-center sm:py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Donation categories
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold text-ink-900 text-balance sm:text-4xl">
            What communities ask for most
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-500">
            Clean, working, safe items in these categories are always needed. If in doubt, list
            it anyway — our team checks every donation.
          </p>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_ORDER.map((category, index) => {
              const meta = CATEGORY_META[category];
              return (
                <Reveal
                  key={category}
                  delay={index * 70}
                  className="group flex flex-col rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
                >
                  <div className="overflow-hidden rounded-xl">
                    <CategoryIllustration
                      category={category}
                      className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                    <h2 className="font-display text-lg font-semibold text-ink-900">{meta.label}</h2>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">{meta.description}</p>
                    <div className="mt-4 border-t border-ink-100 pt-4">
                      <p className="text-xs font-medium text-ink-400">
                        We accept items in <span className="text-ink-700">new, like-new, good or fair</span>{" "}
                        condition.
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            <Reveal
              delay={350}
              className="flex flex-col justify-center rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                <HeartHandshake className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">Something else in mind?</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                List it anyway. Our verification team will decide whether it reaches an NGO or
                gets redirected to a more suitable category.
              </p>
              <div className="mt-5">
                <Link to={ROUTES.register}>
                  <Button
                    fullWidth
                    className="bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-100"
                    rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
                  >
                    Start donating
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  );
}