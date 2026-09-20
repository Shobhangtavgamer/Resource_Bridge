import type { LucideIcon } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAuthStore, useCurrentUser } from "@/store/auth.store";
import { Container } from "./Container";
import { Avatar } from "@/components/ui/Avatar";
import { PageTransition } from "@/components/motion/PageTransition";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface DashboardLayoutProps {
  nav: DashboardNavItem[];
  breadcrumb?: string;
}

export function DashboardLayout({ nav, breadcrumb }: DashboardLayoutProps) {
  const user = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home);
  };

  return (
    <Container className="py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Dashboard">
          <nav className="sticky top-24 space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px]" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <Avatar name={user?.fullName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {user?.fullName}
                </p>
                <p className="truncate text-xs text-ink-400">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          {breadcrumb && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-400">
              {breadcrumb}
            </p>
          )}
          <PageTransition>
            <Outlet />
          </PageTransition>

          <nav
            aria-label="Dashboard (mobile)"
            className="no-scrollbar mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
          >
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "border border-ink-200 bg-white text-ink-600",
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </nav>
        </div>
      </div>
    </Container>
  );
}