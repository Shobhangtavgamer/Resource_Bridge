export type Role = "DONOR" | "NGO" | "ADMIN";

export type DonationCategory =
  | "CLOTHES"
  | "BOOKS"
  | "TOYS"
  | "EDUCATIONAL_MATERIALS"
  | "HOUSEHOLD_ITEMS";

export type ItemCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";

export type DonationStatus =
  | "CREATED"
  | "PENDING_VERIFICATION"
  | "AVAILABLE"
  | "ACCEPTED_BY_NGO"
  | "PICKUP_SCHEDULED"
  | "COLLECTED"
  | "RECEIVED_BY_NGO"
  | "DISTRIBUTED"
  | "COMPLETED";

export type PickupStatus =
  | "PENDING"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ProofType =
  | "DONATION_ITEM"
  | "PICKUP"
  | "DISTRIBUTION"
  | "NGO_VERIFICATION"
  | "CONSENT_BASED";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Shape returned by /auth register + login (public user fields). */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Donor {
  id: string;
  defaultAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ngo {
  id: string;
  orgName: string;
  registrationNo: string;
  certFileUrl: string | null;
  description: string | null;
  contactPerson: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number;
  isVerified: boolean;
  verifiedAt: string | null;
  verifiedByAdminId: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present only for the NGO itself or an admin (see GET /ngos/:id). */
  user?: Pick<AuthUser, "id" | "email" | "fullName" | "phone">;
}

/** Shape returned by GET /users/me and profile update endpoints. */
export interface Me {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  emailVerifiedAt: string | null;
  createdAt: string;
  donor: Donor | null;
  ngo: Ngo | null;
}

export interface DonationItem {
  id: string;
  donationId: string;
  category: DonationCategory;
  title: string;
  description: string | null;
  quantity: number;
  condition: ItemCondition;
  ageGroup: string | null;
  createdAt: string;
}

export interface PickupRequest {
  id: string;
  donationId: string;
  ngoId: string;
  scheduledAt: string | null;
  pickedUpAt: string | null;
  assignedTo: string | null;
  pickupAddress: string;
  status: PickupStatus;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DonationStatusHistoryEntry {
  id: string;
  donationId: string;
  fromStatus: DonationStatus | null;
  toStatus: DonationStatus;
  changedById: string;
  actorRole: Role;
  comment: string | null;
  createdAt: string;
}

export interface DistributionRecord {
  id: string;
  donationId: string;
  ngoId: string;
  distributedAt: string;
  recipientCategory: string | null;
  recipientCount: number;
  region: string | null;
  notes: string | null;
  proofAvailable: boolean;
  proofs?: ProofPhotograph[];
}

export interface ProofPhotograph {
  id: string;
  donationId: string | null;
  distributionRecordId: string | null;
  uploadedById: string;
  type: ProofType;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  isIdentifying: boolean;
  consentReference: string | null;
  reviewStatus: ReviewStatus;
  reviewNote: string | null;
  createdAt: string;
  donation?: { id: string; donationCode: string } | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface Donation {
  id: string;
  donationCode: string;
  donorId: string;
  ngoId: string | null;
  status: DonationStatus;
  city: string;
  pickupAddressLine: string;
  pickupPincode: string | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  preferredPickupDate: string | null;
  notes: string | null;
  softDeletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  items?: DonationItem[];
  statusHistory?: DonationStatusHistoryEntry[];
  pickup?: PickupRequest | null;
  distributions?: DistributionRecord[];
  proofs?: ProofPhotograph[];
  donor?: Pick<Donor, "id" | "city" | "state">;
  ngo?: Pick<Ngo, "id" | "orgName" | "city"> | null;
  nextTransitions?: DonationStatus[];
  _count?: { distributions: number };
}

export interface NearbyNgo {
  id: string;
  orgName: string;
  city: string | null;
  serviceRadiusKm: number;
  distanceKm: number;
}

export interface AdminStats {
  totalDonations: number;
  byStatus: Partial<Record<DonationStatus, number>>;
  byCategory: Partial<Record<DonationCategory, number>>;
  totalNgos: number;
  verifiedNgos: number;
  totalDonors: number;
  pendingReviews: number;
  pendingNgoVerifications: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface ReviewQueue {
  pendingDonations: Donation[];
  pendingProofs: ProofPhotograph[];
}

/* ------------------------------- inputs ------------------------------- */

export interface RegisterInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: Extract<Role, "DONOR" | "NGO">;
  city?: string;
  state?: string;
  pincode?: string;
  defaultAddress?: string;
  latitude?: number;
  longitude?: number;
  orgName?: string;
  registrationNo?: string;
  description?: string;
  contactPerson?: string;
  serviceRadiusKm?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateMeInput {
  fullName?: string;
  phone?: string;
  defaultAddress?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateNgoInput {
  orgName?: string;
  description?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
}

export interface DonationItemInput {
  category: DonationCategory;
  title: string;
  description?: string;
  quantity?: number;
  condition: ItemCondition;
  ageGroup?: string;
}

export interface CreateDonationInput {
  city: string;
  pickupAddressLine: string;
  pickupPincode?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  preferredPickupDate?: string;
  notes?: string;
  items: DonationItemInput[];
}

export interface SchedulePickupInput {
  scheduledAt: string;
  assignedTo?: string;
}

export interface DistributionInput {
  recipientCategory?: string;
  recipientCount: number;
  region?: string;
  notes?: string;
  proofId?: string;
}

export interface ProofUploadInput {
  type: ProofType;
  file: File;
  donationId?: string;
  distributionRecordId?: string;
  isIdentifying?: boolean;
  consentReference?: string;
}
