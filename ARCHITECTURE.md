# Resource Bridge — Technical Architecture

**Version:** 1.0 (v1 scope)
**Status:** Design draft — awaiting approval before implementation

---

## 1. Purpose & Scope

Resource Bridge connects people who have useful unused resources ("Donors") with
verified NGOs that collect and distribute those resources to people who need them.

**v1 donation categories (in scope):**
1. Clothes
2. Books
3. Toys
4. Educational materials
5. Household items

**Out of scope for v1 (planned separately):**
- Medicine donations (require extra legal/safety verification and a dedicated workflow)

**v1 platforms:** Web (donor + NGO + admin), Android app (donor + NGO core flow),
shared REST backend.

---

## 2. Technology Stack

Decisions favor a **single maintainable language** and **low-cost, self-hostable**
infrastructure so a college student can own the full stack.

| Concern | Choice | Why |
|---|---|---|
| **Web frontend** | React 18 + Vite + TypeScript + Tailwind CSS | Huge community, fast iteration, one language (TS) shared with backend types. Vite keeps dev server trivial. |
| **Backend** | Node.js 20 + Express 5 + TypeScript | Same language as web frontend → lower cognitive load, share DTO/schema types. Express is stable, well-documented, beginner-friendly. |
| **ORM / DB access** | Prisma (PostgreSQL) | Type-safe schema, auto migrations, easy for students; schema below maps 1:1 to Prisma models. |
| **Database** | PostgreSQL 16 | Free, robust, relational fits this domain (status history, records). PostGIS optional upgrade for geo queries. |
| **Android** | Kotlin + Jetpack Compose (min SDK 26) | Modern Android standard. Retrofit for REST, ViewModel + Flow for state, Hilt for DI (optional). |
| **Authentication** | Self-hosted JWT (access + refresh tokens) | No vendor lock-in, free, works for web + Android. bcrypt/argon2 for password hashing. |
| **Image / file storage** | Local disk on server + serving via Nginx (v1), with a thin storage abstraction | Simplest for v1. The storage interface lets us swap to S3/R2/Cloudinary later without touching business logic. |
| **Maps / location** | Store lat/long on Donors & NGOs. Web: Leaflet + OpenStreetMap. Android: Google Maps SDK + Google Places for address → coordinates. | Free tier, sufficient. Nearby search done server-side with Haversine (PostGIS-ready). |
| **Notifications** | In-app notifications table + email (Resend SMTP / Nodemailer dev) + Firebase Cloud Messaging (Android push) | v1 ships in-app + email; FCM is additive for Android. |
| **Caching / jobs** | None in v1 (avoid premature complexity); `node-cron` only for reminders if needed | Keep v1 simple. |
| **Testing** | Vitest (unit), Supertest (API integration), Playwright (web E2E), JUnit + Espresso (Android) | See Section 14. |
| **Deployment** | Docker + docker-compose on a single VPS, Nginx reverse proxy, GitHub Actions CI/CD | See Section 15. |

### Important decisions & rationale
- **Why not Next.js?** Next.js adds server rendering/API-routes concepts that overlap with the separate Express backend. A plain React SPA + dedicated REST API keeps a clear separation and exactly mirrors what the Android app consumes.
- **Why not Firestore/MongoDB?** The data is highly relational (status history, proof records linked to donations). PostgreSQL + Prisma gives migrations, referential integrity, and a mental model students already learn.
- **Why one backend for web + Android?** Avoids two divergent codebases; the API contract in Section 4 is the single source of truth.
- **Why self-hosted JWT over Auth0/Firebase Auth?** Free, offline-capable, and teaches core auth concepts. OAuth providers can be added later behind the same middleware.

---

## 3. Project Folder Structure (Monorepo)

```
resource-bridge/
├── ARCHITECTURE.md
├── README.md
├── docker-compose.yml          # local + production orchestration
├── .github/
│   └── workflows/
│       ├── ci.yml              # lint + test + build
│       └── deploy.yml          # build & deploy on main
├── docs/
│   ├── api-spec.yaml           # OpenAPI 3 contract
│   ├── postman-collection.json
│   └── decisions.md            # ADR-style log
├── shared/                     # TS types shared by web + api
│   └── src/
│       ├── api/                # DTOs and API client types
│       └── constants/          # enums: categories, statuses, roles
├── backend/                    # Node/Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # database schema (see Section 5)
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── server.ts           # entry point
│   │   ├── app.ts              # express app (middleware wiring)
│   │   ├── config/             # env validation, constants
│   │   ├── middleware/         # auth, rbac, error handler, validation
│   │   ├── routes/             # one router per resource (mirrors Section 4)
│   │   ├── controllers/        # HTTP handlers
│   │   ├── services/           # business logic (state machine, geo, codes)
│   │   ├── repositories/       # Prisma data access
│   │   ├── utils/              # haversine, id/code generator, file upload
│   │   └── validators/         # zod schemas
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── uploads/                # v1 file storage (gitignored)
│   ├── .env.example
│   └── package.json
├── web/                        # React SPA
│   ├── src/
│   │   ├── main.tsx
│   │   ├── routes/             # react-router pages
│   │   ├── pages/              # Donor, NGO, Admin dashboards
│   │   ├── components/         # shared UI
│   │   ├── hooks/              # api hooks, auth context
│   │   ├── api/                # thin typed client for the REST API
│   │   ├── store/              # auth/user state (Zustand)
│   │   └── styles/
│   ├── index.html
│   ├── tailwind.config.ts
│   └── package.json
└── android/                    # Kotlin + Jetpack Compose
    ├── app/
    │   ├── src/main/
    │   │   ├── java/com/resourcebridge/
    │   │   │   ├── data/
    │   │   │   │   ├── api/        # Retrofit interfaces
    │   │   │   │   ├── repository/
    │   │   │   │   └── datastore/  # token storage, prefs
    │   │   │   ├── domain/         # models, use-cases
    │   │   │   ├── ui/             # compose screens
    │   │   │   └── di/             # Hilt modules
    │   │   └── res/
    │   └── build.gradle.kts
    └── gradle/
```

> Uploads are served by Nginx from `backend/uploads/` in production (Section 15).
> Never commit the uploads directory (gitignored).

---

## 4. REST API Structure

Base URL: `/api/v1`. All endpoints (except auth/public) require a Bearer access token.
Role markers: **[Donor]**, **[NGO]**, **[Admin]**, **[All]**, **[Public]**.

### 4.1 Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register donor or NGO account |
| POST | `/auth/login` | Public | Password login → returns access + refresh token |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | All | Revoke refresh token |
| POST | `/auth/verify-email` | All | Complete email verification |
| POST | `/auth/change-password` | All | Change own password |

### 4.2 Users / Profiles
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users/me` | All | Current user + role profile |
| PATCH | `/users/me` | All | Update own profile |
| GET | `/donors/me/addresses` | Donor | Saved pickup addresses |
| PATCH | `/ngos/me` | NGO | Update NGO profile (media, service area) |

### 4.3 NGOs + Nearby
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/ngos` | Public | List verified NGOs (filter by city) |
| GET | `/ngos/:id` | Public | NGO detail + service area |
| GET | `/ngos/nearby?lat&lng&radiusKm` | All | Geographically nearest verified NGOs (Haversine, Section 8) |
| POST | `/ngos/me/certificate` | NGO | Upload registration certificate for verification |
| POST | `/ngos/:id/verify` | Admin | Verify NGO (sets `is_verified`) |
| POST | `/ngos/:id/reject` | Admin | Reject with reason |

### 4.4 Donations (the core resource)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/donations` | Donor | Create donation + items, auto-assign code (Section 9) |
| GET | `/donations/me` | Donor | List own donations + live status |
| GET | `/donations` | NGO, Admin | Browse open donations (by city/category) |
| GET | `/donations/:id` | All (owner/NGO/admin) | Detail incl. items, history, proof |
| POST | `/donations/:id/status` | Donor/NGO/Admin | Transition status (server-enforced machine, Sections 6, 11) |
| POST | `/donations/:id/claim` | NGO | NGO accepts donation |
| POST | `/donations/:id/verify` | Admin | Admin clears "Pending verification" stage |
| PATCH | `/donations/:id` | Donor | Edit while in editable statuses |
| DELETE | `/donations/:id` | Donor, Admin | Soft-delete (only in early statuses) |

### 4.5 Donation Items
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/donations/:id/items` | Donor | Add item |
| PATCH | `/donations/items/:itemId` | Donor | Edit item |
| DELETE | `/donations/items/:itemId` | Donor | Remove item (if not yet collected) |

### 4.6 Pickup Requests
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/pickups` | NGO | Create pickup (after acceptance) |
| GET | `/pickups/me` | NGO, Donor | List pickup schedules |
| PATCH | `/pickups/:id/schedule` | NGO | Set date/time → status "Pickup scheduled" |
| PATCH | `/pickups/:id/collect` | NGO | Mark collected → status "Collected" |
| PATCH | `/pickups/:id/cancel` | NGO | Cancel with reason |

### 4.7 Distribution
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/distributions` | NGO | Record distribution (non-identifying beneficiary data) |
| GET | `/distributions/:donationId` | NGO, Admin | Distribution records for a donation |
| POST | `/donations/:id/proof` | NGO | Upload distribution proof photo (Section 12) |

### 4.8 Proof Photographs
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/proof` | NGO, Donor | Upload photo (validates type + non-identifying policy) |
| GET | `/proof/:id` | Owner, Admin | View proof |
| DELETE | `/proof/:id` | Owner, Admin | Remove / resubmit |
| POST | `/proof/:id/review` | Admin | Approve/reject proof against privacy policy |

### 4.9 Admin (v1)
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Donation counts by status/category/city |
| GET | `/admin/users` | Admin | List users, suspend/reactivate |
| GET | `/admin/ngos?status=pending` | Admin | NGO verification queue |
| GET | `/admin/review-queue` | Admin | Donations waiting verification + proof review queue |

### 4.10 Notifications
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/notifications/me` | All | In-app notifications |
| PATCH | `/notifications/:id/read` | All | Mark read |

---

## 5. Database Schema (PostgreSQL / Prisma)

> `users` is the base identity table. `donors` and `ngos` are 1:1 profiles created
> by role — this keeps auth and role data clean, and avoids nullable role-specific
> column soup on one table.

```prisma
enum Role { DONOR NGO ADMIN }

enum DonationCategory {
  CLOTHES
  BOOKS
  TOYS
  EDUCATIONAL_MATERIALS
  HOUSEHOLD_ITEMS
}

enum DonationStatus {
  CREATED
  PENDING_VERIFICATION
  AVAILABLE
  ACCEPTED_BY_NGO
  PICKUP_SCHEDULED
  COLLECTED
  RECEIVED_BY_NGO
  DISTRIBUTED
  COMPLETED
}

enum PickupStatus   { PENDING SCHEDULED IN_PROGRESS COMPLETED CANCELLED }
enum ProofType      { DONATION_ITEM PICKUP DISTRIBUTION NGO_VERIFICATION CONSENT_BASED }
enum ItemCondition  { NEW LIKE_NEW GOOD FAIR }

model User {
  id              String   @id @default(uuid())
  fullName        String
  email           String   @unique
  phone           String?
  passwordHash    String
  role            Role
  emailVerifiedAt DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  donor         Donor?
  ngo           Ngo?
  histories     DonationStatusHistory[]
  proofs        ProofPhotograph[]
  notifications Notification[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  tokenHash String   @unique      // SHA-256 of the opaque token
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())
}

model Donor {
  id             String   @id @default(uuid())   // = user.id
  user           User     @relation(fields: [id], references: [id])
  defaultAddress String?
  latitude       Float?
  longitude      Float?
  city           String?
  state          String?
  pincode        String?
  donations      Donation[]
}

model Ngo {
  id                String   @id @default(uuid())       // = user.id
  user              User     @relation(fields: [id], references: [id])
  orgName           String
  registrationNo    String   @unique
  certFileUrl       String?                 // registration certificate
  description       String?
  contactPerson     String?
  address           String?
  city              String?
  state             String?
  pincode           String?
  country           String   @default("IN")
  latitude          Float?
  longitude         Float?
  serviceRadiusKm   Int      @default(25)
  isVerified        Boolean  @default(false)
  verifiedAt        DateTime?
  verifiedByAdminId String?
  suspendedAt       DateTime?
  donations         Donation[]
  pickups           PickupRequest[]
  distributions     DistributionRecord[]
}

model Donation {
  id                  String   @id @default(uuid())
  donationCode        String   @unique          // "RB-MUM-2026-000001" (Section 9)
  donorId             String
  donor               Donor    @relation(fields: [donorId], references: [id])
  ngoId               String?                  // set when NGO claims
  ngo                 Ngo?     @relation(fields: [ngoId], references: [id])
  status              DonationStatus @default(CREATED)
  city                String                   // snapshotted pickup city (ID city code)
  pickupAddressLine   String                   // snapshot at creation
  pickupPincode       String?
  pickupLatitude      Float?
  pickupLongitude     Float?
  preferredPickupDate DateTime?
  notes               String?
  softDeletedAt       DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  items        DonationItem[]
  statusHistory DonationStatusHistory[]
  pickup       PickupRequest?
  distributions DistributionRecord[]
  proofs       ProofPhotograph[]

  @@index([status])
  @@index([city])
  @@index([ngoId])
}

model IDCounter {
  id    String @id @default(uuid())
  year  Int
  city  String                  // city code, e.g. MUM
  value Int    @default(0)
  @@unique([year, city])
}

model DonationItem {
  id          String   @id @default(uuid())
  donationId  String
  donation    Donation @relation(fields: [donationId], references: [id])
  category    DonationCategory
  title       String
  description String?
  quantity    Int      @default(1)
  condition   ItemCondition
  ageGroup    String?          // for toys/books/educational material (e.g. "5-8 yrs")
  createdAt   DateTime @default(now())

  @@index([donationId])
}

model PickupRequest {
  id            String      @id @default(uuid())
  donationId    String      @unique
  donation      Donation    @relation(fields: [donationId], references: [id])
  ngoId         String
  ngo           Ngo         @relation(fields: [ngoId], references: [id])
  scheduledAt   DateTime?
  pickedUpAt    DateTime?
  assignedTo    String?             // collector name/id inside NGO
  pickupAddress String              // snapshot from donation
  status        PickupStatus @default(PENDING)
  cancelReason  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([ngoId])
}

model DonationStatusHistory {
  id         String          @id @default(uuid())
  donationId String
  donation   Donation        @relation(fields: [donationId], references: [id])
  fromStatus DonationStatus?
  toStatus   DonationStatus
  changedById String
  changedBy  User            @relation(fields: [changedById], references: [id])
  actorRole  Role
  comment    String?
  createdAt  DateTime        @default(now())

  @@index([donationId])
}

model DistributionRecord {
  id                String   @id @default(uuid())
  donationId        String
  donation          Donation @relation(fields: [donationId], references: [id])
  ngoId             String
  ngo               Ngo      @relation(fields: [ngoId], references: [id])
  distributedAt     DateTime @default(now())
  recipientCategory String?   // e.g. "family", "student", "shelter" (no identity)
  recipientCount    Int
  region            String?   // locality / city (no exact addresses)
  notes             String?
  proofAvailable    Boolean  @default(false)
  proofs            ProofPhotograph[]

  @@index([donationId])
  @@index([ngoId])
}

model ProofPhotograph {
  id                   String   @id @default(uuid())
  donationId           String?
  donation             Donation?    @relation(fields: [donationId], references: [id])
  distributionRecordId String?
  distributionRecord   DistributionRecord? @relation(fields: [distributionRecordId], references: [id])
  uploadedById         String
  uploadedBy           User       @relation(fields: [uploadedById], references: [id])
  type                 ProofType
  fileUrl              String
  mimeType             String
  sizeBytes            Int
  isIdentifying        Boolean  @default(false)  // MUST be false for children (Section 12)
  consentReference     String?   // consent form/ack reference for CONSENT_BASED
  reviewStatus         String   @default("PENDING") // PENDING | APPROVED | REJECTED
  reviewNote           String?
  createdAt            DateTime @default(now())

  @@index([donationId])
  @@index([distributionRecordId])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  body      String?
  type      String   // STATUS_UPDATE | PICKUP | MATCH | REVIEW | SYSTEM
  link      String?
  readAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId, readAt])
}
```

### Key modeling decisions
- **City is snapshotted onto `Donation`** so nearby-NGO matching and the Donation ID
  city code are stable even if the donor edits their profile.
- **Status is denormalized (`Donation.status`) + fully audited** by
  `DonationStatusHistory`. Fast reads for dashboards, complete immutable trail.
- **Pickup is 1:1 with Donation** — v1 allows one NGO to collect one donation.
- **Distribution records never store names, addresses, or photos of identifiable
  children** — only counts, categories, and region (Section 12 privacy requirement).
- **`IDCounter`** guarantees race-free per-(city, year) sequences for Donation IDs (Section 9).

---

## 6. Donation Lifecycle (State Machine)

```
CREATED ────────── submit ──────────▶ PENDING_VERIFICATION
                ◀── (reject/withdraw) ──┘
PENDING_VERIFICATION ── admin approve ──▶ AVAILABLE
AVAILABLE ── NGO claims ──▶ ACCEPTED_BY_NGO
ACCEPTED_BY_NGO ── schedule pickup ──▶ PICKUP_SCHEDULED
PICKUP_SCHEDULED ── items picked up ──▶ COLLECTED
COLLECTED ── NGO acknowledges receipt ──▶ RECEIVED_BY_NGO
RECEIVED_BY_NGO ── NGO records distribution + safe proof ──▶ DISTRIBUTED
DISTRIBUTED ── proof reviewed & records complete ──▶ COMPLETED   (terminal)
```

### Allowed transitions (enforced server-side)
| From | To | Allowed actors |
|---|---|---|
| CREATED | PENDING_VERIFICATION | Donor (submit) |
| PENDING_VERIFICATION | CREATED | Admin (reject w/ reason), Donor (withdraw) |
| PENDING_VERIFICATION | AVAILABLE | Admin |
| AVAILABLE | ACCEPTED_BY_NGO | NGO (claim) |
| AVAILABLE | CREATED | Donor (re-edit) |
| ACCEPTED_BY_NGO | PICKUP_SCHEDULED | NGO |
| ACCEPTED_BY_NGO | AVAILABLE | Donor/NGO cancel (unclaim) |
| PICKUP_SCHEDULED | AVAILABLE | Cancellation (w/ reason) |
| PICKUP_SCHEDULED | COLLECTED | NGO |
| COLLECTED | RECEIVED_BY_NGO | NGO |
| RECEIVED_BY_NGO | DISTRIBUTED | NGO |
| DISTRIBUTED | COMPLETED | NGO (after proof reviewed + recorded) / Admin |
| any | any | Admin override (always audited) |

- Every transition writes a `DonationStatusHistory` row; removal is impossible (audit).
- Notifications are emitted on every transition to the affected counterparty.
- **Admin override exists but is logged** so misuse is traceable.

---

## 7. Authentication & Authorization

### 7.1 Token model
- **Access token:** JWT (HS256), short expiry (15–30 min), claims: `sub` (user id),
  `role`, `email`.
- **Refresh token:** opaque random string stored **hashed** in `RefreshToken` with
  expiry + revocation. Web: `Secure; HttpOnly` cookie. Android: returned in JSON,
  stored in EncryptedSharedPreferences.
- Middleware decodes the access token → attaches `req.user`; a role guard middleware
  checks `req.user.role`.

### 7.2 Registration & verification
- Register with email + password (bcrypt, cost 12) + role intent (donor / ngo).
- Email verification by token; unverified accounts cannot create donations.
- NGO accounts additionally submit their registration certificate and start as
  `isVerified:false` → Admin verifies via `/ngos/:id/verify`. **Only verified NGOs
  can claim donations** — the core trust mechanism of the platform.

### 7.3 Role-based access (RBAC)
| Capability | Donor | NGO | Admin |
|---|---|---|---|
| Create/edit own donation | Yes | No | Yes (manage) |
| Claim / pickup / distribute | No | Yes (verified only) | Yes |
| Verify NGO / donations / proof | No | No | Yes |
| Manage users | No | No | Yes |
| View donors list | No | No | Yes |

- **Row-level authorization:** a Donor can only GET/update their own donations; an
  NGO only sees/updates donations it claimed. Enforced in services, not just routes.
- Passwords are never returned by the API; DTO mappers strip sensitive fields.

---

## 8. Nearby NGOs Identification

- Both `Ngo` and `Donor` store `latitude` / `longitude` + `city`.
- On donation creation, the donation's pickup coordinates are snapshotted.
- Endpoint `GET /ngos/nearby?lat&lng&radiusKm` returns verified NGOs ordered by
  distance using the **Haversine** formula evaluated in SQL:

```sql
SELECT id, org_name,
       6371 * 2 * ASIN(SQRT(
         POWER(SIN((radians(n.latitude) - radians(?lat))/2), 2)
         + COS(radians(?lat)) * COS(radians(n.latitude))
           * POWER(SIN((radians(n.longitude) - radians(?lng))/2), 2)
       )) AS distance_km
FROM ngos n
WHERE n.is_verified = TRUE
  AND n.latitude IS NOT NULL AND n.longitude IS NOT NULL
  AND 6371 * 2 * ASIN(SQRT(
         POWER(SIN((radians(n.latitude) - radians(?lat))/2), 2)
         + COS(radians(?lat)) * COS(radians(n.latitude))
           * POWER(SIN((radians(n.longitude) - radians(?lng))/2), 2)
       )) <= COALESCE(?radiusKm, n.service_radius_km)
ORDER BY distance_km;
```

- v1 also filters by matching `city` string as a cheap pre-filter (donors see
  "3 verified NGOs near you"). Lat/long wins when both exist.
- **Optimization path:** enable PostGIS + spatial GIST index; query becomes
  `ST_DWithin(ST_MakePoint(lng, lat)::geography, ...)`. No schema change needed —
  the lat/lng columns are the same.

---

## 9. Donation ID (Donation Code)

**Format:** `RB-MUM-2026-000001`

```
RB         MUM      2026       000001
│          │        │          └── 6-digit zero-padded sequence (per city+year)
│          │        └───────────── year of creation
│          └────────────────────── 3-letter city code (e.g. MUM = Mumbai, DEL = Delhi)
└───────────────────────────────── "Resource Bridge" prefix
```

### Rules
1. **Generated server-side always** (never client-side) at donation creation — inside
   one DB transaction; `donationCode` is `@unique` so collisions are impossible.
2. **City code** derives from the donation's snapshotted city via a lookup map
   (Mumbai→MUM, Delhi→DEL, Bengaluru→BLR, …; unknown → `OTH`).
3. **Sequence** is per `(city, year)` via the atomic `IDCounter` table:
   `INSERT ... ON CONFLICT (year, city) DO UPDATE SET value = IDCounter.value + 1
   RETURNING value` — race-free under concurrent creates. Zero-padded to 6 digits
   (`000001`); rolls to 7 digits if ever needed.
4. **Human-readable** → listed as "pickup ref" on paper slips during collection:
   an NGO volunteer can quote `RB-MUM-2026-000001` to confirm the right lot.
5. Displayed on every status page and searchable via `GET /donations?code=...`.

---

## 10. How Donors Track Their Donations

- **Live status timeline:** `GET /donations/:id` returns `status` +
  `statusHistory[]` in reverse-chronological order with actor role, timestamp, and
  comment — rendered as a vertical timeline on web and Android.
- **Notifications (in-app + email) on every transition:** e.g. "Your donation was
  collected", "NGO confirmed receipt". Each notification carries a deep link to the
  donation detail page.
- **Donor dashboard:** all donations listed with a status badge and success counters
  (`Available / In progress / Completed / Rejected`).
- **Proof visibility:** once distribution is recorded, the donor can view the safe,
  non-identifying, admin-reviewed proof attached by the NGO (Section 12).
- **Search:** donation code lookup in the dashboard header.

---

## 11. How NGOs Update Donation Status

- All NGO interactions go through role-guarded endpoints that **only permit the NGO
  that claimed the donation** (row-level auth in the service layer).
- The server **validates every transition against the Section 6 state machine**
  before writing `Donation.status` + a `DonationStatusHistory` row.
- NGO action mapping:
  - `POST /donations/:id/claim` → ACCEPTED_BY_NGO
  - `POST /pickups` + `PATCH /pickups/:id/schedule` → PICKUP_SCHEDULED
  - `PATCH /pickups/:id/collect` → COLLECTED
  - `POST /donations/:id/status {to: "RECEIVED_BY_NGO", comment}` → RECEIVED_BY_NGO
  - `POST /distributions` + proof upload → DISTRIBUTED
  - review / proof approval → COMPLETED
- The frontend only renders the allowed "next action" buttons from the
  `transitions[]` the API returns — **the server never trusts the client** to state
  what is allowed.

---

## 12. Distribution Proof (Privacy-Safe)

### The rule (hard requirement)
> **No identifiable photographs of children receiving donations. Ever.**

### Allowed proof types (`ProofType`)
1. **DONATION_ITEM** — photos of the donated items (before pickup or upon receipt).
2. **PICKUP** — photo of the collected lot at the pickup location. No individuals
   required; if people appear, faces must be blurred.
3. **DISTRIBUTION** — non-identifying photos only: lots being handed over with faces
   out of frame / blurred, group shots from behind, or parcels labelled with the
   donation code.
4. **NGO_VERIFICATION** — NGO registration certificate, premises photo, or a receipt
   from the distribution site.
5. **CONSENT_BASED** — photo taken only with explicit written consent; stored with a
   `consentReference` (consent form ID) and flagged `isIdentifying`. Still subject to
   admin review.

### Enforcement mechanism
- Upload endpoint validates `type`; distribution proof forces `isIdentifying=false`
  unless a valid `consentReference` is supplied.
- Every photo enters an **admin review queue** (`ProofPhotograph.reviewStatus`);
  only `APPROVED` proofs are visible to donors.
- Admin reviewers use a checklist: *no recognizable children, no names/locations in
  frame, blur applied if needed*.
- Donor-facing UI labels proof as "Uploaded by NGO, reviewed by admin" — **proof of
  the donation turning into benefit, never proof of a person's identity.**

---

## 13. Security Considerations

1. **Transport:** HTTPS everywhere (Let's Encrypt); HSTS header; Nginx terminates TLS.
2. **Auth hardening:** bcrypt (cost 12) or argon2id for passwords; short-lived access
   tokens; revocable + rotating refresh tokens; login rate limiting (e.g. 5 tries /
   15 min per account + IP).
3. **Input validation:** every body validated with zod; statuses/categories are typed
   enums only — no client-invented values.
4. **SQL safety:** Prisma parameterizes all queries → no SQL injection surface.
5. **XSS/CSRF:** React escapes output; `HttpOnly` cookies for refresh tokens; strict
   Content-Security-Policy; user content rendered as text, never raw HTML in v1.
6. **File upload safety:** validate MIME + magic bytes, size cap (≤10 MB), random
   filenames, non-executable permissions, serve with `X-Content-Type-Options: nosniff`.
7. **Authorization:** RBAC middleware **plus** row-level ownership checks in services
   (defense in depth, Section 7.3).
8. **Privacy by design:** PII minimised; distribution records hold only counts and
   categories; the `isIdentifying` flag + admin review gate proofs (Section 12).
9. **Audit trail:** every status change and every admin override is immutable
   history — no DELETE API for history.
10. **Secrets:** `.env` only, never committed; `.env.example` committed; non-root DB
    user in compose; automated backups; `npm audit` / `govulncheck` in CI.
11. **Rate limiting:** global + per-endpoint (auth, upload, nearby-search).

---

## 14. Testing Strategy

| Layer | Tool | What is tested |
|---|---|---|
| Backend unit | Vitest | State machine transitions, Donation ID generator, Haversine distance, DTO mappers, RBAC guards |
| Backend integration | Vitest + Supertest | Every endpoint against a real test Postgres (fresh Prisma migration); the full donation lifecycle happy + unhappy paths; auth + refresh flows |
| Web E2E | Playwright | Donor creates → NGO claims → schedules pickup → collects → receives → distributes → completes; admin verification + proof review flows |
| Android | JUnit4 + MockWebServer + Espresso | Repository/use-case logic against mocked Retrofit; Compose UI smoke tests for the donor core flow |
| Contract | OpenAPI (`docs/api-spec.yaml`) | Web client + Android DTOs derived from one contract; breaking changes caught by CI diff |
| CI | GitHub Actions (`ci.yml`) | `lint`, `typecheck`, unit + integration tests, web build, Android debug APK build, on every PR |
| Manual smoke | `docs/manual-testing.md` | Scripted QA run before each release |

Coverage targets: state machine, geo, auth, and the donation lifecycle end-to-end.

---

## 15. Deployment Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              VPS (1 node, e.g. 4GB RAM)      │
                    │                                              │
 User ──HTTPS──▶ Nginx ──/──────────▶ web/  (React static build)   │
                    │   └──/api─────▶ api/   (Node/Express :3000)  │
                    │   └──/uploads──▶ files from backend/uploads  │
                    │            │                                  │
                    │            └──▶ PostgreSQL 16 (volume-live)  │
                    │         (node-cron) backups → offsite        │
                    └──────────────────────────────────────────────┘
```

- **Single VPS + docker-compose** (api, web, db, nginx). One file, one machine —
  cheapest and easiest for a college student to maintain; can scale later by splitting
  services.
- **Nginx** serves static web files, reverse-proxies `/api`, serves `/uploads`, and
  terminates TLS (Let's Encrypt / certbot).
- **GitHub Actions CI/CD:** merge to `main` → run tests → build images → SSH deploy
  `docker compose up -d` → `prisma migrate deploy`.
- **Environments:** `development` (docker-compose with Postgres + seed data, live
  rebuild), `test` (CI ephemeral Postgres), `production` (VPS). `.env` per env.
- **Backups:** nightly `pg_dump` to a safe location (S3/R2 bucket or second disk),
  retention ≥ 30 days. Marked as critical before launch.
- **Monitoring (v1-lite):** structured logs to stdout + a health endpoint
  `GET /health` (checks DB). Optional upgrade: uptime robot + Sentry.
- **Scaling path (when needed):** move uploads to S3/R2 (storage abstraction exists),
  add Redis for rate limits/queues, run api + web on separate nodes.

---

## 16. Suggested Build Order (after approval)

1. Backend skeleton + DB schema + migrations + seed (`shared/` types).
2. Auth (register, login, refresh, email verify) + RBAC middleware.
3. Donations + items + Donation ID generator + status state machine + history.
4. Nearby NGO query + claiming/pickup endpoints.
5. Distribution + proof upload + admin review queue.
6. Web app (donor dashboard → NGO portal → admin panel).
7. Android app (login → create donation → track status).
8. Notifications (in-app + email), CI/CD, deployment, manual QA.

---

*End of architecture document. Awaiting approval before any implementation begins.*