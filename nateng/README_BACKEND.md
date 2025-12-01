This project includes a small backend using Prisma + Next.js API routes.

Overview
- Database: SQLite (local) via Prisma
- Prisma schema: `prisma/schema.prisma`
- Prisma client helper: `lib/prisma.ts`
- API routes:
  - `GET /api/listings` — list marketplace listings
  - `POST /api/listings` — create a listing (seller/farmer/reseller)
  - `GET /api/orders` — list orders
  - `POST /api/orders` — create an order (buyer buying from seller)
  - `GET /api/users` — list users
  - `POST /api/users` — create a user

Setup (PowerShell)

1) Install new dependencies:

```powershell
cd "c:\Users\My Computer\OneDrive\Desktop\CAPSTONE 1\Nateng\nateng"
npm install
```

2) Initialize Prisma DB and run migration:

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

The migrate command will create `prisma/dev.db` (SQLite) and apply the schema. If you prefer not to run migrations, you can run `npx prisma db push` to push the schema without generating a migration.

3) Start dev server:

```powershell
npm run dev
```

API usage examples (fetch)

Create a user:

```ts
await fetch('/api/users', { method: 'POST', body: JSON.stringify({ name: 'Anna', email: 'a@example.com', role: 'FARMER' }), headers: { 'Content-Type': 'application/json' } });
```

Create a product (farmer -> product) — create a Product directly using Prisma in your code or extend API similarly.

Create a listing:

```ts
await fetch('/api/listings', { method: 'POST', body: JSON.stringify({ productId: 1, sellerId: 1, priceCents: 1000, quantity: 10 }), headers: { 'Content-Type': 'application/json' } });
```

Create an order (buyer buys from seller — items are listingId/quantity):

```ts
await fetch('/api/orders', { method: 'POST', body: JSON.stringify({ buyerId: 5, sellerId: 1, items: [{ listingId: 1, quantity: 2 }] }), headers: { 'Content-Type': 'application/json' } });
```

Notes & next steps
- This is a minimal, example backend. You should add authentication, authorization and input validation for production.
- You can replace SQLite with PostgreSQL by updating `prisma/schema.prisma` datasource URL and running migrations.
- If you'd like, I can add endpoints for managing products (create/update product), expose endpoints scoped by role (farmers/resellers/business flows), or add simple JWT auth.
