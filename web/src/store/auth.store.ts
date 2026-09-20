import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getRefreshToken,
  clearTokens,
  onAuthExpired,
  refreshAccessToken,
  setAccessToken,
  setRefreshToken,
} from "@/api/client";
import { authApi, usersApi } from "@/api/endpoints";
import type { LoginInput, Me, RegisterInput, Role } from "@/api/types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: Me | null;
  status: AuthStatus;
  initialized: boolean;
  login: (input: LoginInput) => Promise<Me>;
  register: (input: RegisterInput) => Promise<Me>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setUser: (user: Me | null) => void;
  handleSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      initialized: false,

      async login(input) {
        set({ status: "loading" });
        try {
          const session = await authApi.login(input);
          setAccessToken(session.accessToken);
          setRefreshToken(session.refreshToken);
          const { user } = await usersApi.me();
          set({ user, status: "authenticated", initialized: true });
          return user;
        } catch (error) {
          set({ status: "unauthenticated", user: null });
          throw error;
        }
      },

      async register(input) {
        await authApi.register(input);
        return get().login({ email: input.email, password: input.password });
      },

      async logout() {
        const token = getRefreshToken();
        try {
          if (token) await authApi.logout(token);
        } catch {
          /* logging out locally is what matters */
        }
        clearTokens();
        set({ user: null, status: "unauthenticated", initialized: true });
      },

      async bootstrap() {
        if (get().initialized) return;

        if (!getRefreshToken()) {
          set({ status: "unauthenticated", initialized: true });
          return;
        }

        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          set({ user: null, status: "unauthenticated", initialized: true });
          return;
        }

        try {
          const { user } = await usersApi.me();
          set({ user, status: "authenticated", initialized: true });
        } catch {
          clearTokens();
          set({ user: null, status: "unauthenticated", initialized: true });
        }
      },

      async refreshMe() {
        const { user } = await usersApi.me();
        set({ user, status: "authenticated" });
      },

      setUser(user) {
        set({ user, status: user ? "authenticated" : "unauthenticated" });
      },

      handleSessionExpired() {
        set({ user: null, status: "unauthenticated", initialized: true });
      },
    }),
    {
      name: "rb.auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

onAuthExpired(() => {
  useAuthStore.getState().handleSessionExpired();
});

export function useCurrentUser(): Me | null {
  return useAuthStore((state) => state.user);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.status === "authenticated" && Boolean(state.user));
}

export function useRole(): Role | null {
  return useAuthStore((state) => state.user?.role ?? null);
}

export function useHasRole(...roles: Role[]): boolean {
  return useAuthStore((state) => {
    const role = state.user?.role;
    return role ? roles.includes(role) : false;
  });
}
