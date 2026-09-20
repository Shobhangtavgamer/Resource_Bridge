import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import { useIsAuthenticated } from "@/store/auth.store";
import { FullPageLoader } from "@/components/ui/Spinner";

export interface ProtectedRouteProps {
  fallback?: ReactElement;
}

/**
 * Gate for authenticated areas. While the auth store is bootstrapping, a
 * loader is shown so the app does not flash the login screen.
 */
export function ProtectedRoute({ fallback }: ProtectedRouteProps) {
  const initialized = useAuthStore((state) => state.initialized);
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!initialized || status === "loading") {
    return fallback ?? <FullPageLoader label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}