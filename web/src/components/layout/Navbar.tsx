import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  UserRound,
  X,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAuthStore, useCurrentUser, useRole } from "@/store/auth.store";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Container } from "./Container";
import { Logo } from "./Logo";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const PUBLIC_NAV: NavItem[] = [
  { to: ROUTES.howItWorks, label: "How it works" },
  { to: ROUTES.categories, label: "Categories" },
  { to: ROUTES.ngos, label: "Find NGOs" },
  { to: ROUTES.about, label: "About" },
  { to: ROUTES.contact, label: "Contact" },
];

const DONOR_NAV: NavItem[] = [
  { to: ROUTES.donor.root, label: "Dashboard", end: true },
  { to: ROUTES.donor.donations, label: "My donations" },
  { to: ROUTES.donor.newDonation, label: "Create donation" },
];

const NGO_NAV: NavItem[] = [
  { to: ROUTES.ngo.root, label: "Dashboard", end: true },
  { to: ROUTES.ngo.available, label: "Available donations" },
  { to: ROUTES.ngo.pickups, label: "Pickups" },
  { to: ROUTES.ngo.distributions, label: "Distributions" },
];

const ADMIN_NAV: NavItem[] = [
  { to: ROUTES.admin.root, label: "Dashboard", end: true },
  { to: ROUTES.admin.users, label: "Users" },
  { to: ROUTES.admin.ngos, label: "NGOs" },
  { to: ROUTES.admin.reviews, label: "Proof reviews" },
];

function navForRole(role: string | null): NavItem[] {
  switch (role) {
    case "DONOR":
      return DONOR_NAV;
    case "NGO":
      return NGO_NAV;
    case "ADMIN":
      return ADMIN_NAV;
    default:
      return PUBLIC_NAV;
  }
}

export function Navbar() {
  const role = useRole();
  const user = useCurrentUser();
  const isAuthenticated = Boolean(role);
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const mobileMenu = useDisclosure();
  const userMenu = useDisclosure();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const items = navForRole(role);

  // Close mobile menu on navigation
  useEffect(() => {
    mobileMenu.close();
  }, [location.pathname, mobileMenu]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu.isOpen) return undefined;
    const onClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) userMenu.close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") userMenu.close();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenu.isOpen, userMenu]);

  const handleLogout = async () => {
    userMenu.close();
    await logout();
    navigate(ROUTES.home);
  };

  const profileRoute =
    role === "DONOR"
      ? ROUTES.donor.profile
      : role === "NGO"
        ? ROUTES.ngo.profile
        : ROUTES.contact;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "rounded-lg px-3 py-2 font-ops text-sm font-medium tracking-wide transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <NavLink
                  to={ROUTES.notifications}
                  aria-label="Notifications"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                >
                  <Bell className="h-5 w-5" aria-hidden />
                </NavLink>
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={userMenu.toggle}
                    aria-expanded={userMenu.isOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-ink-100"
                  >
                    <Avatar
                      name={user?.fullName}
                      src={user?.ngo?.certFileUrl}
                      size="sm"
                      className="bg-brand-600 ring-white"
                    />
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-ink-400 transition-transform",
                        userMenu.isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {userMenu.isOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift animate-scale-in"
                    >
                      <MenuLink to={roleRoot(role)} icon={LayoutDashboard} label="Dashboard" onClick={userMenu.close} />
                      <MenuLink to={profileRoute} icon={UserRound} label="Profile & settings" onClick={userMenu.close} />
                      <MenuLink to={ROUTES.notifications} icon={Bell} label="Notifications" onClick={userMenu.close} />
                      <div className="my-1.5 h-px bg-ink-100" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" aria-hidden />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to={ROUTES.login}>
                  <Button variant="ghost" className="font-ops tracking-wide">Sign in</Button>
                </Link>
                <Link to={ROUTES.register}>
                  <Button leftIcon={<PlusCircle className="h-4 w-4" />} className="font-ops tracking-wide">Get started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={mobileMenu.toggle}
            aria-expanded={mobileMenu.isOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenu.isOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 lg:hidden"
          >
            {mobileMenu.isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {mobileMenu.isOpen && (
        <div
          id="mobile-nav"
          className="border-t border-ink-200 bg-white lg:hidden animate-fade-in"
        >
          <Container className="py-3">
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={mobileMenu.close}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-lg px-3 py-2.5 font-ops text-sm font-medium tracking-wide",
                          isActive
                            ? "bg-brand-50 text-brand-700"
                            : "text-ink-700 hover:bg-ink-100",
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-3 space-y-2 border-t border-ink-100 pt-3">
              {isAuthenticated ? (
                <>
                  <Link to={profileRoute} onClick={mobileMenu.close}>
                    <Button variant="outline" fullWidth leftIcon={<UserRound className="h-4 w-4" />}>
                      Profile & settings
                    </Button>
                  </Link>
                  <Link to={ROUTES.notifications} onClick={mobileMenu.close}>
                    <Button variant="outline" fullWidth leftIcon={<Bell className="h-4 w-4" />}>
                      Notifications
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    fullWidth
                    leftIcon={<LogOut className="h-4 w-4" />}
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.login} onClick={mobileMenu.close}>
                    <Button variant="outline" fullWidth className="font-ops tracking-wide">
                      Sign in
                    </Button>
                  </Link>
                  <Link to={ROUTES.register} onClick={mobileMenu.close}>
                    <Button fullWidth leftIcon={<PlusCircle className="h-4 w-4" />} className="font-ops tracking-wide">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

function roleRoot(role: string | null): string {
  switch (role) {
    case "DONOR":
      return ROUTES.donor.root;
    case "NGO":
      return ROUTES.ngo.root;
    case "ADMIN":
      return ROUTES.admin.root;
    default:
      return ROUTES.home;
  }
}

interface MenuLinkProps {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  onClick: () => void;
}

function MenuLink({ to, icon: Icon, label, onClick }: MenuLinkProps) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
    >
      <Icon className="h-4 w-4 text-ink-400" aria-hidden />
      {label}
    </Link>
  );
}