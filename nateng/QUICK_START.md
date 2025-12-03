# 🏃 Quick Start Guide - NatengHub Marketplace

## ⚡ 30-Second Setup

```bash
# 1. Install & Setup
npm install
npm run migrate
npm run seed

# 2. Start
npm run dev

# 3. Visit
http://localhost:3000
```

## 🗂️ Core Directories

- `/app/api` - Backend API endpoints
- `/components` - Reusable React components
- `/lib` - Utilities and helpers
- `/hooks` - Custom React hooks
- `/prisma` - Database schema and seed

## 🎯 Key Files to Know

```
lib/api-client.ts      ← Use this to call APIs
hooks/use-fetch.ts     ← Use this to load data
hooks/use-cart.ts      ← Use this for shopping cart
prisma/schema.prisma   ← Database structure
app/splash/page.tsx    ← New landing page
```

## 📊 Database Models

```typescript
// User roles: farmer, buyer, business, reseller, admin
User → creates → Product → has → Listing
                                    ↓
                            Order (from Listing)
```

## 🔌 Common API Patterns

### Get Data
```typescript
const { data, loading, error } = useFetch('/api/products');
```

### Post Data
```typescript
const product = await productsAPI.create({
  name: 'Tomatoes',
  description: '...',
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

## 🛒 Shopping Cart

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

## 👥 Sample Users (After Seed)

| Role | Email | Password |
|------|-------|----------|
| Farmer | farmer1@email.com | password123 |
| Farmer | farmer2@email.com | password123 |
| Buyer | buyer1@email.com | password123 |
| Buyer | buyer2@email.com | password123 |
| Buyer | buyer3@email.com | password123 |
| Business | business1@email.com | password123 |
| Reseller | reseller1@email.com | password123 |
| Reseller | reseller2@email.com | password123 |
| Reseller | reseller3@email.com | password123 |

**Note:** All seed users use the password `password123`. For production, users will set their own passwords during registration.

## 🗺️ Navigation

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

## 🐛 Common Issues

### Port 3000 in use?
```bash
PORT=3001 npm run dev
```

### Database error?
```bash
npx prisma migrate reset
npm run seed
```

### API not responding?
```bash
# Check if API is working
curl http://localhost:3000/api/products
```

### Change data?
```bash
# Reset database and re-seed
npm run migrate:reset
npm run seed
```

## 📝 API Query Examples

```bash
# Get products
curl http://localhost:3000/api/products

# Get available listings
curl http://localhost:3000/api/listings?available=true

# Get farmer's listings
curl http://localhost:3000/api/listings?sellerId=1

# Get buyer's orders
curl http://localhost:3000/api/orders?buyerId=1&status=PENDING
```

## 🎨 Design System

- **Primary Color**: #31E672 (Green)
- **Secondary Color**: #50EAB2 (Lighter Green)
- **Font**: System default (sans-serif)
- **Spacing**: 4px base unit (Tailwind)
- **Breakpoints**: Mobile-first responsive

## 🚀 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Switch from SQLite to PostgreSQL
- [ ] Set up proper authentication (JWT)
- [ ] Configure HTTPS
- [ ] Add error logging
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Add payment processing

## 📚 Documentation Files

- `MARKETPLACE_SETUP.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - Complete feature overview
- `README_BACKEND.md` - Backend documentation (if exists)

## ✨ What's New

✅ Full REST API with error handling
✅ Database with real schema
✅ API client utilities
✅ Shopping cart with persistence
✅ Beautiful redesigned landing page
✅ Role-based portals
✅ Inventory management
✅ Order tracking
✅ **Complete Authentication System** - Registration and login with bcrypt
✅ **User-to-User Messaging** - Direct communication between buyers and sellers
✅ **Real-time Notifications** - Automatic notifications for orders and messages
✅ **Complete Order Flow** - End-to-end order processing with status updates

## 🎯 Next Feature Ideas

1. Payment integration (Stripe/PayMongo)
2. Image uploads for products
3. Real-time order notifications
4. User ratings and reviews
5. Buyer/Seller messaging
6. Inventory alerts
7. Analytics dashboard
8. Bulk operations

## 📞 Support

For issues:
1. Check logs: `npm run dev` output
2. Verify database: `npx prisma studio`
3. Check API: `curl http://localhost:3000/api/products`
4. Review docs: `MARKETPLACE_SETUP.md`

---

**Happy Coding! 🚀**
