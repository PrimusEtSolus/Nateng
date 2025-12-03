# NatengHub Backend API Documentation

This project includes a complete full-stack backend using Prisma + Next.js API routes.

## Overview
- **Database**: SQLite (local) via Prisma (PostgreSQL-ready)
- **Prisma schema**: `prisma/schema.prisma`
- **Prisma client helper**: `lib/prisma.ts`
- **Authentication**: bcrypt password hashing
- **Session Management**: localStorage (upgradeable to JWT)

## API Routes

### Authentication
- `POST /api/auth/login` — User login with email/password
- `POST /api/auth/register` — User registration
- `GET /api/auth/session` — Get current user session

### Users
- `GET /api/users` — List users (optional `?role=farmer` filter)
- `GET /api/users/[id]` — Get user by ID
- `POST /api/users` — Create a user (admin only)
- `PATCH /api/users/[id]` — Update user
- `DELETE /api/users/[id]` — Delete user

### Products
- `GET /api/products` — List all products
- `GET /api/products/[id]` — Get product by ID
- `POST /api/products` — Create a product (farmer)
- `PATCH /api/products/[id]` — Update product
- `DELETE /api/products/[id]` — Delete product

### Listings
- `GET /api/listings` — List marketplace listings (optional filters: `?sellerId=1&available=true`)
- `GET /api/listings/[id]` — Get listing by ID
- `POST /api/listings` — Create a listing (seller/farmer/reseller)
- `PATCH /api/listings/[id]` — Update listing
- `DELETE /api/listings/[id]` — Delete listing

### Orders
- `GET /api/orders` — List orders (optional filters: `?buyerId=1&sellerId=2&status=PENDING`)
- `GET /api/orders/[id]` — Get order by ID
- `POST /api/orders` — Create an order (buyer buying from seller) - **Creates notifications**
- `PATCH /api/orders/[id]` — Update order status - **Creates notifications**
- `DELETE /api/orders/[id]` — Cancel order (PENDING only)

### Messages
- `GET /api/messages?userId=1&conversationWith=2` — Get messages/conversations
- `POST /api/messages` — Send a message - **Creates notification**

### Notifications
- `GET /api/notifications?userId=1&unreadOnly=true` — Get notifications
- `PATCH /api/notifications` — Mark notification as read

Setup (PowerShell)

✅ **Status: All setup steps completed!**

1) ✅ Install new dependencies:

```powershell
npm install
```

2) ✅ Initialize Prisma DB and run migration:

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

The migrate command will create `prisma/dev.db` (SQLite) and apply the schema. If you prefer not to run migrations, you can run `npx prisma db push` to push the schema without generating a migration.

3) ✅ Start dev server:

```powershell
npm run dev
```

**The development server is running at: http://localhost:3000**

## API Usage Examples

### Authentication

**Register a new user:**
```ts
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Anna Santos',
    email: 'anna@example.com',
    password: 'securepassword123',
    role: 'farmer'
  })
});
const { user } = await response.json();
```

**Login:**
```ts
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'anna@example.com',
    password: 'securepassword123'
  })
});
const { user } = await response.json();
```

### Products & Listings

**Create a product:**
```ts
await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Highland Tomatoes',
    description: 'Fresh tomatoes from Benguet',
    farmerId: 1
  })
});
```

**Create a listing:**
```ts
await fetch('/api/listings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 1,
    sellerId: 1,
    priceCents: 1000, // ₱10.00
    quantity: 10
  })
});
```

### Orders

**Create an order (creates notifications automatically):**
```ts
await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    buyerId: 5,
    sellerId: 1,
    items: [
      { listingId: 1, quantity: 2 },
      { listingId: 2, quantity: 5 }
    ]
  })
});
```

**Update order status (creates notifications automatically):**
```ts
await fetch('/api/orders/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'CONFIRMED' // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  })
});
```

### Messages

**Send a message:**
```ts
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    senderId: 1,
    receiverId: 2,
    content: 'Hello, when will my order be delivered?',
    orderId: 5 // Optional: link message to an order
  })
});
```

**Get conversation:**
```ts
const messages = await fetch('/api/messages?userId=1&conversationWith=2');
```

### Notifications

**Get notifications:**
```ts
// All notifications
const notifications = await fetch('/api/notifications?userId=1');

// Unread only
const unread = await fetch('/api/notifications?userId=1&unreadOnly=true');
```

**Mark as read:**
```ts
await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notificationId: 1,
    read: true
  })
});
```

## Database Schema

### Models
- **User**: id, name, email, password (hashed), role, createdAt
- **Product**: id, name, description, farmerId, createdAt
- **Listing**: id, productId, sellerId, priceCents, quantity, available, createdAt
- **Order**: id, buyerId, sellerId, totalCents, status, scheduledDate, scheduledTime, route, isCBD, truckWeightKg, deliveryAddress, isExempt, exemptionType, createdAt
- **OrderItem**: id, orderId, listingId, quantity, priceCents
- **Message**: id, senderId, receiverId, orderId, content, read, createdAt
- **Notification**: id, userId, type, title, message, link, read, createdAt

## Notes & Next Steps

✅ **Implemented:**
- Complete authentication system with bcrypt
- User-to-user messaging
- Real-time notification system
- Automatic notifications for orders and messages
- Complete order lifecycle management

🚧 **For Production:**
- Upgrade from localStorage to JWT tokens
- Add email verification
- Implement password reset
- Add rate limiting
- Add input validation middleware
- Replace SQLite with PostgreSQL
- Add WebSocket support for real-time updates
- Implement proper authorization (role-based access control)

For complete implementation details, see [FULLSTACK_IMPLEMENTATION.md](./FULLSTACK_IMPLEMENTATION.md).
