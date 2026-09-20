import type { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "@/api/types";
import { ROUTES } from "@/lib/routes";
import { useAuthStore, useHasRole } from "@/store/auth.store";
import { FullPageLoader } from "@/components/ui/Spinner";

export interface RoleRouteProps {
  roles: Role[];
  fallback?: ReactElement;
}

const DASHBOARD_BY_ROLE: Record<Role, string> = {
  DONOR: ROUTES.donor.root,
  NGO: ROUTES.ngo.root,
  ADMIN: ROUTES.admin.root,
};

/**
 * Gate for role-scoped areas. Requires authentication first, then enforces a
 * role. As a courtesy, an already-authenticated user who lacks the role is
 * redirected to their own dashboard instead of the login page.
 */
export function RoleRoute({ roles, fallback }: RoleRouteProps) {
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const allowed = useHasRole(...roles);

  if (!initialized) {
    return fallback ?? <FullPageLoader label="Checking your session…" />;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!allowed) {
    return <Navigate to={DASHBOARD_BY_ROLE[user.role]} replace />;
  }

  return <Outlet />;
}