# NatengHub Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Next.js Frontend                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐ │   │
│  │  │   Splash    │  │   Portals   │  │  Components      │ │   │
│  │  │   Page      │  │ - Farmer    │  │ - Products       │ │   │
│  │  │             │  │ - Buyer     │  │ - Listings       │ │   │
│  │  │             │  │ - Business  │  │ - Orders         │ │   │
│  │  │             │  │ - Reseller  │  │ - Cart           │ │   │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Hooks & Utilities                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ useFetch     │  │ useCart      │  │ api-client   │  │   │
│  │  │              │  │              │  │              │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────┬──────────────────────────┘
                                        │ HTTP Requests
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER SIDE (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                API Routes Layer                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐ │   │
│  │  │ /products   │  │ /listings   │  │ /orders          │ │   │
│  │  │             │  │             │  │                  │ │   │
│  │  │ - GET       │  │ - GET       │  │ - GET            │ │   │
│  │  │ - POST      │  │ - POST      │  │ - POST           │ │   │
│  │  │ - PATCH     │  │ - PATCH     │  │ - PATCH          │ │   │
│  │  │ - DELETE    │  │ - DELETE    │  │ - DELETE         │ │   │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │            /users (User Management)                │ │   │
│  │  │ - Authentication                                   │ │   │
│  │  │ - Profile Management                               │ │   │
│  │  │ - Role Assignment                                  │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Prisma ORM Layer                           │   │
│  │  - Query Builder                                         │   │
│  │  - Type Safety                                           │   │
│  │  - Transaction Support                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
└───────────────────────────────────────┬──────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (SQLite)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │   Users     │  │   Products   │  │   Listings             │  │
│  │ ├─ id       │  │ ├─ id        │  │ ├─ id                  │  │
│  │ ├─ name     │  │ ├─ name      │  │ ├─ productId           │  │
│  │ ├─ email    │  │ ├─ description│  │ ├─ sellerId            │  │
│  │ ├─ role     │  │ ├─ farmerId  │  │ ├─ priceCents          │  │
│  │ └─ ...      │  │ └─ ...       │  │ ├─ quantity            │  │
│  │             │  │              │  │ └─ available           │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐   │
│  │        Orders               │  │    OrderItems           │   │
│  │ ├─ id                       │  │ ├─ id                   │   │
│  │ ├─ buyerId                  │  │ ├─ orderId              │   │
│  │ ├─ sellerId                 │  │ ├─ listingId            │   │
│  │ ├─ totalCents               │  │ ├─ quantity             │   │
│  │ ├─ status (PENDING, etc.)   │  │ ├─ priceCents           │   │
│  │ └─ ...                      │  │ └─ ...                  │   │
│  └─────────────────────────────┘  └─────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Farmer     │
│  Creates     │
│  Product     │
└──────┬───────┘
       │ POST /api/products
       ↓
┌──────────────────────────────────┐
│   Database: Product Created       │
│   - name, description, farmerId   │
└──────┬───────────────────────────┘
       │
       │ Farmer creates Listing
       │ for that Product
       ↓
┌──────────────────────────────────────────┐
│   Database: Listing Created              │
│   - productId, sellerId                  │
│   - priceCents: 6000 (₱60/kg)            │
│   - quantity: 500 kg                     │
│   - available: true                      │
└──────┬───────────────────────────────────┘
       │
       │ Listing visible in marketplace
       │ /business/browse
       ↓
┌──────────────────────────────┐
│   Buyer/Business browses     │
│   GET /api/listings          │
│   (can filter by available)  │
└──────┬───────────────────────┘
       │
       │ Adds to cart
       │ (useCart hook)
       ↓
┌──────────────────────────────────┐
│   Cart in localStorage           │
│   ├─ listingId: 5               │
│   ├─ quantity: 50 kg            │
│   ├─ priceCents: 6000           │
│   └─ totalCents: 300000         │
└──────┬───────────────────────────┘
       │
       │ Places Order
       │ POST /api/orders
       ↓
┌─────────────────────────────────────────────┐
│   Transactional Order Creation (Prisma)    │
│   1. Verify listing exists                  │
│   2. Check inventory (qty >= order qty)    │
│   3. Create Order record                    │
│   4. Create OrderItem records               │
│   5. Decrement Listing quantity             │
│   6. Calculate & save totalCents            │
│   (ALL OR NOTHING - transaction)            │
└─────────────────┬──────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   Success               Error
        │                    │
        ↓                    ↓
┌───────────────┐    ┌──────────────────┐
│ Order Created │    │ Rollback all     │
│ Status:       │    │ changes, return  │
│ PENDING       │    │ error message    │
└───────┬───────┘    └──────────────────┘
        │
        │ Seller updates status
        │ PATCH /api/orders/:id
        ↓
┌─────────────────────────────────┐
│   Order Status Update Workflow   │
│   PENDING → CONFIRMED           │
│   CONFIRMED → SHIPPED           │
│   SHIPPED → DELIVERED           │
│   (or CANCELLED at any stage)    │
└─────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Layout
│   ├── Navigation
│   └── Footer
└── Pages
    ├── Splash (/splash)
    │   ├── Hero Section
    │   ├── About Section
    │   ├── Contact Section
    │   └── CTA Section
    ├── Auth Pages
    │   ├── Login (/login)
    │   └── Signup (/signup)
    ├── Farmer Portal (/farmer/*)
    │   ├── Dashboard
    │   ├── Crops
    │   ├── Analytics
    │   └── Orders
    ├── Buyer Portal (/buyer/*)
    │   ├── Dashboard
    │   ├── Browse
    │   ├── Cart
    │   └── Orders
    ├── Business Portal (/business/*)
    │   ├── Dashboard
    │   ├── Browse
    │   ├── Inventory
    │   └── Orders
    └── Reseller Portal (/reseller/*)
        ├── Dashboard
        ├── Inventory
        ├── Sales
        └── Wholesale
```

## State Management Flow

```
┌─────────────────────────────────────┐
│   Global State (localStorage)       │
│   ├─ Auth Token (AUTH_KEY)         │
│   └─ Shopping Cart (natenghub_cart)│
└─────────────────────────────────────┘
         ↑                    ↑
         │                    │
    useAuth()          useCart()
    Hook               Hook
         │                    │
         ↓                    ↓
    ┌─────────────────────────────────┐
    │   Component State               │
    │   ├─ Form inputs               │
    │   ├─ UI toggles                │
    │   └─ Temporary data            │
    └─────────────────────────────────┘
         ↑
         │
    API Calls
    useFetch()
         │
         ↓
    ┌─────────────────────────────────┐
    │   Server State (Database)       │
    │   ├─ Products                   │
    │   ├─ Listings                   │
    │   ├─ Orders                     │
    │   └─ Users                      │
    └─────────────────────────────────┘
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Production Environment                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    Client (Browser)                                 │   │
│  │    Deployed on Vercel / Netlify / Your Server       │   │
│  └─────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    API Server (Next.js API Routes)                  │   │
│  │    Deployed on Vercel / Node Server                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    Database (PostgreSQL / MySQL)                    │   │
│  │    Hosted on AWS RDS / Cloud SQL / Your Server      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Additional Services:                                      │
│  ├─ Payment Gateway (Stripe / PayMongo)                   │
│  ├─ Email Service (SendGrid / AWS SES)                    │
│  ├─ File Storage (AWS S3 / Firebase)                      │
│  └─ CDN (Cloudflare / AWS CloudFront)                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

**This architecture ensures**:
- ✅ Scalability
- ✅ Data consistency
- ✅ Transaction safety
- ✅ Type safety (TypeScript)
- ✅ Responsive UI
- ✅ Offline cart support
- ✅ Fast API response
