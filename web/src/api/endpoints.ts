import { apiRequest, buildQuery } from "./client";
import type {
  AdminStats,
  AdminUser,
  AuthUser,
  ChangePasswordInput,
  CreateDonationInput,
  DistributionInput,
  DistributionRecord,
  Donation,
  DonationCategory,
  DonationItem,
  DonationItemInput,
  DonationStatus,
  LoginInput,
  Me,
  NearbyNgo,
  Ngo,
  Notification,
  ProofPhotograph,
  ProofUploadInput,
  RegisterInput,
  ReviewQueue,
  SchedulePickupInput,
  Session,
  UpdateMeInput,
  UpdateNgoInput,
} from "./types";

/* --------------------------------- auth --------------------------------- */

export const authApi = {
  register: (input: RegisterInput) =>
    apiRequest<{ user: AuthUser }>("/auth/register", {
      method: "POST",
      body: input,
      auth: false,
    }),

  login: (input: LoginInput) =>
    apiRequest<Session>("/auth/login", { method: "POST", body: input, auth: false }),

  refresh: (refreshToken: string) =>
    apiRequest<Session>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),

  logout: (refreshToken: string) =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),

  verifyEmail: (token: string) =>
    apiRequest<{ message: string }>(
      `/auth/verify-email${buildQuery({ token })}`,
      { auth: false },
    ),

  changePassword: (input: ChangePasswordInput) =>
    apiRequest<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: input,
    }),
};

/* --------------------------------- users --------------------------------- */

export const usersApi = {
  me: (signal?: AbortSignal) => apiRequest<{ user: Me }>("/users/me", { signal }),

  updateMe: (input: UpdateMeInput) =>
    apiRequest<{ user: Me }>("/users/me", { method: "PATCH", body: input }),

  updateNgoProfile: (input: UpdateNgoInput) =>
    apiRequest<{ user: Me }>("/users/ngos/me", { method: "PATCH", body: input }),

  notifications: (signal?: AbortSignal) =>
    apiRequest<{ notifications: Notification[] }>("/users/notifications", { signal }),

  readNotification: (id: string) =>
    apiRequest<{ message: string }>(`/users/notifications/${id}/read`, {
      method: "PATCH",
    }),
};

/* ------------------------------- donations ------------------------------- */

export interface ListOpenParams {
  city?: string;
  category?: DonationCategory;
  status?: DonationStatus;
}

export const donationsApi = {
  listOpen: (params: ListOpenParams = {}, signal?: AbortSignal) =>
    apiRequest<{ donations: Donation[] }>(`/donations/open${buildQuery(params)}`, {
      auth: false,
      signal,
    }),

  searchByCode: (code: string, signal?: AbortSignal) =>
    apiRequest<{ donation: Donation }>(
      `/donations/code/${encodeURIComponent(code)}`,
      { auth: false, signal },
    ),

  listMine: (signal?: AbortSignal) =>
    apiRequest<{ donations: Donation[] }>("/donations/me", { signal }),

  listForNgo: (signal?: AbortSignal) =>
    apiRequest<{ donations: Donation[] }>("/donations/ngos", { signal }),

  getOne: (id: string, signal?: AbortSignal) =>
    apiRequest<{ donation: Donation }>(`/donations/${id}`, { signal }),

  create: (input: CreateDonationInput) =>
    apiRequest<{ donation: Donation }>("/donations", { method: "POST", body: input }),

  remove: (id: string) =>
    apiRequest<void>(`/donations/${id}`, { method: "DELETE" }),

  addItem: (donationId: string, item: DonationItemInput) =>
    apiRequest<{ item: DonationItem }>(`/donations/${donationId}/items`, {
      method: "POST",
      body: item,
    }),

  updateItem: (itemId: string, patch: Partial<DonationItemInput>) =>
    apiRequest<{ item: DonationItem }>(`/donations/items/${itemId}`, {
      method: "PATCH",
      body: patch,
    }),

  removeItem: (itemId: string) =>
    apiRequest<void>(`/donations/items/${itemId}`, { method: "DELETE" }),

  changeStatus: (id: string, to: DonationStatus, comment?: string) =>
    apiRequest<{ donation: Donation; nextTransitions: DonationStatus[] }>(
      `/donations/${id}/status`,
      { method: "POST", body: { to, comment } },
    ),

  claim: (id: string) =>
    apiRequest<{ message: string }>(`/donations/${id}/claim`, { method: "POST" }),

  unclaim: (id: string) =>
    apiRequest<{ message: string }>(`/donations/${id}/unclaim`, { method: "POST" }),

  schedulePickup: (id: string, input: SchedulePickupInput) =>
    apiRequest<{ message: string }>(`/donations/${id}/schedule-pickup`, {
      method: "POST",
      body: input,
    }),

  collect: (id: string) =>
    apiRequest<{ message: string }>(`/donations/${id}/collect`, { method: "POST" }),
};

/* ---------------------------------- ngos ---------------------------------- */

export const ngoApi = {
  list: (params: { city?: string } = {}, signal?: AbortSignal) =>
    apiRequest<{ ngos: Ngo[] }>(`/ngos${buildQuery(params)}`, {
      auth: false,
      signal,
    }),

  nearby: (params: { lat: number; lng: number; radiusKm?: number }, signal?: AbortSignal) =>
    apiRequest<{ ngos: NearbyNgo[] }>(`/ngos/nearby${buildQuery(params)}`, {
      auth: false,
      signal,
    }),

  getOne: (id: string, signal?: AbortSignal) =>
    apiRequest<{ ngo: Ngo }>(`/ngos/${id}`, { signal }),
};

/* ------------------------------ distributions ------------------------------ */

export const distributionApi = {
  record: (donationId: string, input: DistributionInput) =>
    apiRequest<{ distribution: DistributionRecord }>(`/distributions/${donationId}`, {
      method: "POST",
      body: input,
    }),

  list: (donationId: string, signal?: AbortSignal) =>
    apiRequest<{ distributions: DistributionRecord[] }>(`/distributions/${donationId}`, {
      signal,
    }),
};

/* ---------------------------------- proof ---------------------------------- */

export const proofApi = {
  upload: (input: ProofUploadInput) => {
    const form = new FormData();
    form.append("type", input.type);
    if (input.donationId) form.append("donationId", input.donationId);
    if (input.distributionRecordId) {
      form.append("distributionRecordId", input.distributionRecordId);
    }
    if (input.isIdentifying !== undefined) {
      form.append("isIdentifying", String(input.isIdentifying));
    }
    if (input.consentReference) {
      form.append("consentReference", input.consentReference);
    }
    form.append("file", input.file);
    return apiRequest<{ proof: ProofPhotograph }>("/proof", {
      method: "POST",
      formData: form,
    });
  },

  review: (id: string, decision: "APPROVED" | "REJECTED", note?: string) =>
    apiRequest<{ id: string; reviewStatus: string }>(`/proof/${id}/review`, {
      method: "POST",
      body: { decision, note },
    }),

  get: (id: string, signal?: AbortSignal) =>
    apiRequest<{ proof: ProofPhotograph }>(`/proof/${id}`, { signal }),
};

/* ---------------------------------- admin ---------------------------------- */

export const adminApi = {
  stats: (signal?: AbortSignal) => apiRequest<AdminStats>("/admin/stats", { signal }),

  users: (params: { role?: string; search?: string } = {}, signal?: AbortSignal) =>
    apiRequest<{ users: AdminUser[] }>(`/admin/users${buildQuery(params)}`, { signal }),

  setUserStatus: (id: string, suspend: boolean) =>
    apiRequest<{ message: string }>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { suspend },
    }),

  ngos: (
    params: { verified?: boolean; city?: string; search?: string } = {},
    signal?: AbortSignal,
  ) =>
    apiRequest<{ ngos: Ngo[] }>(`/admin/ngos${buildQuery(params)}`, { signal }),

  verifyNgo: (id: string) =>
    apiRequest<{ message: string }>(`/admin/ngos/${id}/verify`, { method: "POST" }),

  rejectNgo: (id: string, reason?: string) =>
    apiRequest<{ message: string }>(`/admin/ngos/${id}/reject`, {
      method: "POST",
      body: { reason },
    }),

  reviewQueue: (signal?: AbortSignal) =>
    apiRequest<ReviewQueue>("/admin/review-queue", { signal }),
};
