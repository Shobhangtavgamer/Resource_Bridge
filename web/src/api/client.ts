import type { Session } from "./types";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(/\/+$/, "") || "/api/v1";

const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE_URL ?? "").replace(/\/+$/, "");

const REFRESH_TOKEN_KEY = "rb.refresh_token";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/* ------------------------------ token store ------------------------------ */
/* The access token is kept in memory only (never persisted). The refresh
   token is persisted so a session can survive a page reload; it is rotated
   by the backend on every silent refresh. */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* storage may be unavailable (private mode) — fail silently */
  }
}

export function clearTokens(): void {
  accessToken = null;
  setRefreshToken(null);
}

const authExpiredListeners = new Set<() => void>();

export function onAuthExpired(listener: () => void): () => void {
  authExpiredListeners.add(listener);
  return () => authExpiredListeners.delete(listener);
}

function emitAuthExpired(): void {
  for (const listener of authExpiredListeners) listener();
}

/* ------------------------------ asset URLs ------------------------------ */

export function resolveAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${ASSET_BASE}${path}`;
}

export function buildQuery<T extends object>(
  params: T,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

/* -------------------------------- requests -------------------------------- */

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
  signal?: AbortSignal;
  /** Internal: prevents infinite refresh loops. */
  skipRefresh?: boolean;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers = new Headers();
  if (!options.formData) headers.set("Content-Type", "application/json");
  if (options.auth !== false && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const body: BodyInit | undefined = options.formData
    ? options.formData
    : options.body !== undefined
      ? JSON.stringify(options.body)
      : undefined;

  return fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
    signal: options.signal,
  });
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let code = `HTTP_${response.status}`;
  let message = response.statusText || "Something went wrong. Please try again.";
  let details: unknown;

  try {
    const data = (await response.json()) as {
      error?: { code?: string; message?: string; details?: unknown };
    };
    if (data?.error) {
      code = data.error.code ?? code;
      message = data.error.message ?? message;
      details = data.error.details;
    }
  } catch {
    /* non-JSON error body */
  }

  return new ApiError(response.status, code, message, details);
}

let refreshPromise: Promise<boolean> | null = null;

export function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  const token = getRefreshToken();
  if (!token) return Promise.resolve(false);

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: token }),
      });
      if (!response.ok) {
        clearTokens();
        emitAuthExpired();
        return false;
      }
      const session = (await response.json()) as Session;
      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await send(path, options);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Unable to reach the Resource Bridge server. Please check your connection.",
    );
  }

  if (response.status === 401 && options.auth !== false && !options.skipRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
  }

  if (!response.ok) throw await parseErrorResponse(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError(0, "ABORTED", "Request cancelled");
  }
  return new ApiError(
    0,
    "UNKNOWN_ERROR",
    error instanceof Error ? error.message : "Unexpected error",
  );
}
