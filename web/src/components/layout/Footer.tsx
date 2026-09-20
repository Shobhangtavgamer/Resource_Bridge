import { Link } from "react-router-dom";
import { HeartHandshake, Mail, MapPin, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { Container } from "./Container";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="grain border-t border-ink-200 bg-white">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-500">
              A trusted bridge between people who give and verified NGOs that deliver —
              from wardrobes and bookshelves to the communities that need them.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-ink-500">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                Every NGO is verified before it can receive donations.
              </li>
              <li className="flex items-start gap-2">
                <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                Photo privacy for children is enforced, never disabled.
              </li>
            </ul>
          </div>

          <nav aria-label="Explore">
            <h3 className="text-sm font-semibold text-ink-900">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.howItWorks}>How it works</Link></li>
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.categories}>Donation categories</Link></li>
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.ngos}>Find an NGO</Link></li>
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.about}>About us</Link></li>
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.contact}>Contact & help</Link></li>
            </ul>
          </nav>

          <nav aria-label="Get involved">
            <h3 className="text-sm font-semibold text-ink-900">Get involved</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.register}>Donate items</Link></li>
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.register}>Register your NGO</Link></li>
              <li><Link className="transition-colors hover:text-brand-700" to={ROUTES.login}>Sign in</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-ink-900">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                hello@resourcebridge.local
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                Mumbai, Maharashtra, India
              </li>
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-ink-400">
              Always respect the privacy of children. Never photograph identifiable
              children receiving donations without recorded, verifiable consent.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Resource Bridge. All rights reserved.</p>
          <p className="font-display italic text-ink-500">Give what you have, where it's needed.</p>
        </div>
      </Container>
    </footer>
  );
}