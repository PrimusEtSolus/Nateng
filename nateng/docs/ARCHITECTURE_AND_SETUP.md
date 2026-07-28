# NatengHub - Architecture and Setup Guide

## Project Objectives

NatengHub is a web-based digital marketplace integrating predictive data analytics and hub-and-spoke logistics to improve farmer income and optimize vegetable market flow in Benguet.

**Key Objectives:**
- Crop Supply Forecasting via predictive analytics
- Truck Ban-Compliant Delivery Scheduling aligned with Baguio City regulations
- Multi-actor ecosystem (Farmers, Resellers, Businesses, Consumers)
- Virtual trading platform with smart logistics
- ISO 25010 software quality standards compliance

## Multi-Actor Ecosystem

**Farmers**: Primary producers creating products/listings with crop programming dashboards and market intelligence.

**Resellers**: Wholesale traders as intermediate hubs with bulk purchasing and inventory management.

**Businesses**: Restaurants, hotels, institutions requiring bulk orders with inventory tracking and order consolidation.

**Consumers/Buyers**: Individual end-users with product browsing, shopping cart, and order tracking.

## System Architecture

```
CLIENT SIDE (Browser)
├─ Next.js Frontend
│  ├─ Splash Page, Portals (Farmer/Buyer/Business/Reseller)
│  └─ Components (Products, Listings, Orders, Cart)
├─ Hooks & Utilities
│  ├─ useFetch, useCart, api-client
└─ HTTP Requests → SERVER SIDE
```

```
SERVER SIDE (Next.js)
├─ API Routes Layer
│  ├─ /products, /listings, /orders (CRUD operations)
│  └─ /users (Authentication, Profile, Role Assignment)
├─ Prisma ORM Layer
│  ├─ Query Builder, Type Safety, Transaction Support
└─ DATABASE LAYER (SQLite)
   ├─ Users, Products, Listings, Orders, OrderItems
```

## Data Flow

```
Farmer Creates Product → Database: Product Created
Farmer Creates Listing → Database: Listing Created (productId, sellerId, priceCents, quantity)
Buyer/Business Browses Listings → Places Order
Order Creation (Transactional): Verify inventory → Calculate total → Decrement quantity → Create order items
Seller Updates Status → Buyer Tracks Order
```

## Database Schema

### Models

**User**: id, name, email, password (hashed), role (farmer/buyer/business/reseller/admin), createdAt

**Product**: id, name, description, farmerId, createdAt

**Listing**: id, productId, sellerId, priceCents, quantity, available, createdAt

**Order**: id, buyerId, sellerId, totalCents, status (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED), scheduledDate, scheduledTime, route, isCBD, truckWeightKg, deliveryAddress, isExempt, exemptionType, createdAt

**OrderItem**: id, orderId, listingId, quantity, priceCents

**Message**: id, senderId, receiverId, orderId, content, read, createdAt

**Notification**: id, userId, type, title, message, link, read, createdAt

## API Routes

### Authentication
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Get current user session

### Users
- `GET /api/users` - List users (optional `?role=farmer` filter)
- `GET /api/users/[id]` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Products
- `GET /api/products` - List all products
- `GET /api/products/[id]` - Get product by ID
- `POST /api/products` - Create product (farmer)
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Listings
- `GET /api/listings` - List listings (filters: `?sellerId=1&available=true`)
- `GET /api/listings/[id]` - Get listing by ID
- `POST /api/listings` - Create listing (seller/farmer/reseller)
- `PATCH /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

### Orders
- `GET /api/orders` - List orders (filters: `?buyerId=1&sellerId=2&status=PENDING`)
- `GET /api/orders/[id]` - Get order by ID
- `POST /api/orders` - Create order (creates notifications)
- `PATCH /api/orders/[id]` - Update status (creates notifications)
- `DELETE /api/orders/[id]` - Cancel order (PENDING only)

### Messages
- `GET /api/messages?userId=1&conversationWith=2` - Get messages/conversations
- `POST /api/messages` - Send message (creates notification)

### Notifications
- `GET /api/notifications?userId=1&unreadOnly=true` - Get notifications
- `PATCH /api/notifications` - Mark as read

## Query Filters

**Listings**: `GET /api/listings?sellerId=1&available=true&productId=5`

**Orders**: `GET /api/orders?buyerId=1&status=PENDING&sellerId=2`

**Users**: `GET /api/users?role=farmer`

## Quick Start

```bash
# Install & Setup
npm install
npm run migrate
npm run seed

# Start
npm run dev

# Visit
http://localhost:3000
```

## Project Structure

```
nateng/
├── app/
│   ├── api/              # Backend API routes
│   ├── splash/           # Landing page
│   ├── login/            # Authentication
│   ├── signup/           # User registration
│   ├── farmer/           # Farmer portal
│   ├── buyer/            # Buyer portal
│   ├── business/         # Business portal
│   └── reseller/         # Reseller portal
├── components/           # Reusable React components
├── lib/
│   ├── api-client.ts     # API integration utilities
│   ├── auth.ts           # Authentication helpers
│   └── prisma.ts         # Prisma client
├── hooks/
│   ├── use-fetch.ts      # Data fetching hook
│   └── use-cart.ts       # Shopping cart hook
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeder
└── public/               # Static assets
```

## Key Files

- `lib/api-client.ts` - Use this to call APIs
- `hooks/use-fetch.ts` - Use this to load data
- `hooks/use-cart.ts` - Use this for shopping cart
- `prisma/schema.prisma` - Database structure
- `app/splash/page.tsx` - Landing page

## API Usage Examples

### Get Data
```typescript
const { data, loading, error } = useFetch('/api/products');
```

### Post Data
```typescript
const product = await productsAPI.create({
  name: 'Tomatoes',
  description: 'Fresh from Benguet',
  farmerId: 1
});
```

### Update Data
```typescript
await listingsAPI.update(listingId, {
  quantity: 100,
  priceCents: 5000
});
```

### Delete Data
```typescript
await ordersAPI.delete(orderId);
```

## Shopping Cart

```typescript
const { items, addItem, removeItem, getTotalPrice } = useCart();

addItem({
  listingId: 1,
  productName: 'Tomatoes',
  sellerName: 'Farm Co',
  quantity: 50,
  priceCents: 6000
});

console.log(`Total: ₱${getTotalPrice() / 100}`);
```

## Navigation

- `/` - Home/Splash
- `/login` - Login page
- `/signup` - Registration
- `/farmer/dashboard` - Farmer portal
- `/farmer/crops` - Manage crops
- `/farmer/orders` - Track orders
- `/buyer/dashboard` - Buyer portal
- `/buyer/cart` - Shopping cart
- `/buyer/orders` - Purchase history
- `/business/browse` - Wholesale products
- `/business/orders` - Bulk orders

## Technical Stack

**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI

**Backend**: Next.js API Routes, Node.js

**Database**: Prisma ORM, SQLite (dev), PostgreSQL/MySQL ready (production)

## Sample Data

Running `npm run seed` creates: 5 test users (2 farmers, 1 business, 1 reseller, 1 buyer), 5 sample products (tomatoes, cabbage, carrots, lettuce, potatoes), 5 listings with different prices, 1 sample order.

**Note**: Seed data is for development/testing only. Production users register through signup pages.

## Authentication

Currently uses localStorage for session management. Farmers/Business users access role-specific dashboards. Auth token stored in `AUTH_KEY` in localStorage.

**For Production**: Upgrade to JWT tokens, add email verification, implement password reset.
