# NatengHub — Architecture Documentation

## 1. System Overview

NatengHub is a **B2B2C digital agricultural marketplace** connecting three primary user roles in a single supply chain:

```
Farmer → Bulk Buyer → Buyer
```

### User Roles
| Role | Description | Can Sell To | Can Buy From |
|------|-------------|-------------|--------------|
| `farmer` | Produces agricultural goods | Buyers, BulkBuyers | — |
| `bulkBuyer` | Reseller / aggregator | Buyers only | Farmers only |
| `buyer` | End consumer | — | Farmers, BulkBuyers |
| `admin` | Platform administrator | All | All |

### Core Flows
1. **Farmer → Buyer**: Direct farm-to-consumer sales.
2. **Farmer → BulkBuyer → Buyer**: Two-tier distribution (bulk aggregation + resale).
3. **Admin Oversight**: Ban management, appeals review, analytics, audit logging.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **ORM** | Prisma 5.x |
| **Database** | PostgreSQL (Neon in production) |
| **Styling** | Tailwind CSS v4 |
| **Validation** | Zod 3.x |
| **Auth** | JWT (httpOnly cookies) + bcrypt |
| **File Storage** | Vercel Blob |
| **Logging** | Custom `Logger` class (`lib/logger.ts`) |
| **Linting** | ESLint 9 with TypeScript ESLint plugin |

---

## 3. Core Architecture

### 3.1 Project Structure

```
nateng/
├── app/
│   ├── api/                  # Next.js API Route Handlers (App Router)
│   │   ├── auth/             # Login, register, logout, session, change-password
│   │   ├── users/            # User CRUD + ban-status
│   │   ├── products/         # Product CRUD
│   │   ├── listings/         # Listing CRUD
│   │   ├── orders/           # Order lifecycle + delivery scheduling
│   │   ├── favorites/        # User favorites
│   │   ├── messages/         # Direct messaging
│   │   ├── notifications/    # In-app notifications
│   │   ├── contact/          # Contact / appeal form
│   │   ├── delivery-schedule/# Delivery schedule proposals
│   │   ├── analytics/        # Admin analytics dashboard
│   │   └── admin/            # Admin-only endpoints (users, products, appeals, stats)
│   ├── farmer/               # Farmer-facing pages
│   ├── buyer/                # Buyer-facing pages
│   ├── bulkBuyer/            # BulkBuyer-facing pages
│   └── admin/                # Admin dashboard
├── components/
│   ├── ui/                   # Reusable UI primitives (shadcn/ui)
│   ├── farmer/               # Farmer-specific components
│   ├── buyer/                # Buyer-specific components
│   ├── bulkBuyer/            # BulkBuyer-specific components
│   └── shared/               # Cross-role shared components
├── lib/
│   ├── auth-server.ts        # Server-side auth helpers (getCurrentUser, requireAuth, requireRole)
│   ├── prisma.ts             # Singleton Prisma client
│   ├── types.ts              # Central TypeScript interfaces
│   ├── validation-schemas.ts # Zod schemas for all API inputs
│   ├── api-error.ts          # Standardized error responses
│   ├── validation.ts         # Legacy validation utilities
│   ├── marketplace-rules.ts  # Role-based transaction enforcement
│   ├── banned-users.ts       # Ban / appeal management
│   ├── jwt.ts                # JWT generation & verification
│   ├── rate-limit.ts         # IP-based rate limiting
│   ├── truck-ban/            # Delivery truck ban compliance
│   └── logger.ts             # Structured logging
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
└── public/                   # Static assets
```

### 3.2 Component Modularity

- **No God Components**: Each component has a single responsibility.
- **`actionSlot` Render Props**: Used for composable action menus (e.g., product cards, order rows).
- **Sidebar Pattern**: Each role has its own sidebar component (`components/{role}/sidebar.tsx`).

### 3.3 API Routing Strategy

- All routes use **Next.js App Router** (`app/api/.../route.ts`).
- RESTful conventions: `GET` (read), `POST` (create), `PATCH` (update), `DELETE` (remove).
- Authentication is enforced via `getCurrentUser()` from `lib/auth-server.ts`.
- Authorization is enforced per-route (self-or-admin pattern, role checks).
- All POST/PUT/PATCH bodies are validated with **Zod schemas** from `lib/validation-schemas.ts`.

### 3.4 Prisma Schema Relationships

```
User (1) ──< Product (1) ──< Listing (1) ──< OrderItem (N) >── Order (N)
   │                    │                      ▲
   │                    │                      │
   ├──< Order (buyer)   ├──< Favorite          └── Order (seller)
   ├──< Message (sent)  └──< OrderItem
   ├──< Message (received)
   ├──< Notification
   ├──< Appeal
   ├──< AuditLog
   ├──< ContactMessage
   ├──< DeliverySchedule (proposer)
   ├──< DeliverySchedule (confirmer)
   └──< AnalyticsEvent
```

---

## 4. Security Architecture

### 4.1 Authentication
- **JWT tokens** stored in httpOnly cookies (`auth_token`).
- Token payload: `{ userId, email, role }`.
- Session validation on every authenticated route via `getCurrentUser()`.

### 4.2 Authorization
- **Self-or-Admin Pattern**: Users can only access their own resources unless `role === 'admin'`.
- **Ownership Checks**: For PATCH/DELETE, the route fetches the resource first, then checks `resource.ownerId === currentUser.id`.
- **Role-Based Access Control (RBAC)**: Enforced via `requireRole()` or inline checks.

### 4.3 Input Validation
- All POST/PUT/PATCH bodies are validated with **Zod schemas** before Prisma interaction.
- Schemas enforce type safety, length limits, and value constraints.

### 4.4 Error Handling
- All errors return **standardized JSON** with appropriate HTTP status codes.
- Prisma errors (`P2002`, `P2025`) are mapped to `409 Conflict` and `404 Not Found`.

### 4.5 Audit Logging
- Admin actions (ban, unban, appeal review) are logged to the `AuditLog` table.
- Sensitive operations use `currentUser.email` as the `actor` — never trusting client input.

---

## 5. Database Seeding

Run `npm run seed` to populate the database with initial data:
- Admin user
- Sample farmers, bulkBuyers, and buyers
- Sample products and listings
- Test orders

---

## 6. Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `JWT_SECRET` | Secret for JWT signing |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for uploads |
| `NODE_ENV` | `development` or `production` |

---

## 7. Deployment

- **Platform**: Vercel (recommended)
- **Build Command**: `npm run build` (runs `prisma generate`, `prisma migrate deploy`, `next build`)
- **Start Command**: `npm run start`

</parameter>
<task_progress>
- [x] Explore API routes structure
- [x] Examine lib/types.ts
- [x] Review Prisma schema
- [x] Review middleware
- [x] Create comprehensive plan
- [x] Create lib/validation-schemas.ts
- [x] Create lib/api-error.ts
- [x] Phase 1: Patch all IDOR/Privilege Escalation vulnerabilities
- [x] Phase 2: Add Zod validation & standardize error handling
- [x] Phase 3: Create ARCHITECTURE.md
- [ ] Phase 3: Create TECHNICAL_DEBT.md
- [ ] Phase 4: Run lint, build, and git commit/push
</task_progress>
</write_to_file>