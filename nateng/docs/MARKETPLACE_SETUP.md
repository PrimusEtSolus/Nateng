# NatengHub - Full Stack Marketplace Setup Guide

## 🚀 Quick Start

### 1. Initialize the Database

The marketplace uses SQLite with Prisma ORM. Follow these steps to set up:

```bash
# Create database and run migrations
npm run migrate

# Seed the database with sample data
npm run seed
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
nateng/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── products/           # Product management
│   │   ├── listings/           # Product listings with pricing
│   │   ├── orders/             # Order management
│   │   └── users/              # User management
│   ├── splash/                 # Landing page
│   ├── login/                  # Authentication
│   ├── signup/                 # User registration
│   ├── farmer/                 # Farmer portal
│   ├── buyer/                  # Buyer portal
│   ├── business/               # Business/Restaurant portal
│   └── reseller/               # Reseller portal
├── components/                 # Reusable React components
├── lib/
│   ├── api-client.ts          # API integration utilities
│   ├── auth.ts                # Authentication helpers
│   ├── mock-data.ts           # Mock data (being phased out)
│   └── prisma.ts              # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeder
└── public/                     # Static assets
```

## 🗄️ Database Schema

### Users
- **farmer**: Can list products for wholesale
- **buyer**: Can purchase individual items
- **business**: Restaurants, hotels, institutions
- **reseller**: Wholesale traders
- **admin**: System administrators

### Products
- Created by farmers
- Associated with farm data
- Has multiple listings

### Listings
- Product + pricing + quantity
- Each seller can list the same product at different prices
- Tracks available inventory

### Orders
- Buyer purchases from seller
- Contains multiple order items
- Tracks order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)

## 🔌 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Farmers)
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Listings
- `GET /api/listings` - List all listings (with filters)
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing
- `PATCH /api/listings/:id` - Update listing (price/quantity)
- `DELETE /api/listings/:id` - Remove listing

### Orders
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Cancel pending order

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user profile
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 📊 Query Filters

### Listings
```
GET /api/listings?sellerId=1&available=true&productId=5
```

### Orders
```
GET /api/orders?buyerId=1&status=PENDING&sellerId=2
```

### Users
```
GET /api/users?role=farmer
```

## 🛠️ Using the API Client

The `lib/api-client.ts` provides convenient functions for API calls:

```typescript
import { productsAPI, listingsAPI, ordersAPI, usersAPI } from '@/lib/api-client';

// Get all products
const products = await productsAPI.getAll();

// Get listings for a seller
const listings = await listingsAPI.getAll({ sellerId: 1, available: true });

// Create an order
const order = await ordersAPI.create({
  buyerId: 1,
  sellerId: 2,
  items: [
    { listingId: 5, quantity: 50 },
    { listingId: 6, quantity: 30 }
  ]
});

// Update order status
await ordersAPI.updateStatus(orderId, 'CONFIRMED');
```

## 👥 User Roles & Features

### Farmer
- Dashboard with analytics
- Manage crops/products
- View orders
- Track sales and revenue
- Set wholesale pricing

### Buyer
- Browse available products
- View farmer profiles
- Place orders
- Track purchases
- Favorites list

### Business/Restaurant
- Wholesale purchasing
- Bulk ordering
- Preferred supplier management
- Analytics dashboard

### Reseller
- Wholesale bulk buying
- Inventory management
- Sales tracking
- Markup pricing

## 🎨 Splash Screen Features

The landing page includes:
- **Navigation Bar**: Quick links to Home, About, Contact
- **Hero Section**: Showcase with highland vegetable imagery
- **Stats Section**: Platform metrics
- **About Section**: Mission and features
- **Why Choose Us**: Key benefits
- **Contact Section**: Contact form and information
- **Call-to-Action**: Links to signup
- **Footer**: Quick navigation and links

## 📈 Sample Data

The seed script creates:
- 5 test users (2 farmers, 1 business, 1 reseller, 1 buyer)
- 5 sample products (tomatoes, cabbage, carrots, lettuce, potatoes)
- 5 listings with different prices
- 1 sample order

Test credentials available after seeding.

## 🔐 Authentication

- Currently uses localStorage for session management
- Farmers/Business users access role-specific dashboards
- Auth token stored in `AUTH_KEY` in localStorage

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- Responsive navigation
- Touch-friendly UI

## 🚢 Deployment

Before deploying:
1. Update environment variables
2. Run migrations on production DB
3. Configure proper database (PostgreSQL recommended)
4. Set up environment variables for API_BASE

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Port Already in Use
```bash
# Change port
PORT=3001 npm run dev
```

### Build Issues
```bash
# Clear cache
rm -rf .next
npm run build
```

## 📝 Next Steps

1. Connect authentication to database
2. Implement payment processing
3. Add image uploads for products
4. Implement real-time notifications
5. Add review/rating system
6. Implement chat between buyers and sellers

---

**NatengHub** - Connecting Highland Farmers with Markets
