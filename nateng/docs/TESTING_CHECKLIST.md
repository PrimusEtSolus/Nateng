# NatengHub - Bug Hunting & Feature Testing Checklist

## Status: ✅ READY FOR TESTING
**Server**: Running on http://localhost:3000  
**Database**: SQLite with 5 seeded products, 5 listings, 5 users, 1 order  
**Build**: Production-ready (no TypeScript errors)  
**Last Updated**: 2026-02-06 (Farmer Settings & Logistics Update)

---

## 1. API Endpoint Testing

### Products API
- [ ] GET /api/products - Returns all products
- [ ] GET /api/products/1 - Returns product with farmer details
- [ ] POST /api/products - Create new product (test with: `{ name: "Test", description: "Test product", farmerId: 1 }`)
- [ ] PATCH /api/products/1 - Update product name/description
- [ ] DELETE /api/products/1 - Delete a product

### Listings API  
- [ ] GET /api/listings - Returns all listings
- [ ] GET /api/listings?sellerId=1 - Filter by seller
- [ ] GET /api/listings?available=true - Filter by availability
- [ ] GET /api/listings/1 - Get specific listing with product info
- [ ] POST /api/listings - Create new listing
- [ ] PATCH /api/listings/1 - Update listing quantity/price
- [ ] DELETE /api/listings/1 - Delete listing

### Orders API
- [ ] GET /api/orders - Returns all orders (requires Authorization header)
- [ ] GET /api/orders/1 - Get order with items
- [ ] POST /api/orders - Create order (test with: `{ buyerId: 4, sellerId: 1, items: [{ listingId: 1, quantity: 50 }] }`)
- [ ] PATCH /api/orders/1 - Update order status to "SHIPPED"
- [ ] DELETE /api/orders/1 - Delete pending order

### Users API
- [ ] GET /api/users - Returns all users (admin only)
- [ ] GET /api/users?role=farmer - Filter by role
- [ ] GET /api/users/1 - Get user profile with relations
- [ ] POST /api/users - Create new user
- [ ] PATCH /api/users/1 - Update user (supports: name, email, phone, minimumOrderKg, deliveryAreas, paymentMethods, profilePhotoUrl)
- [ ] DELETE /api/users/1 - Delete user

---

## 2. Frontend Page Flow Testing

### Splash Page (/)
- [ ] Hero section displays correctly
- [ ] Navigation bar appears
- [ ] About section visible
- [ ] Contact form renders
- [ ] CTA buttons are clickable
- [ ] Images load without errors
- [ ] Responsive on mobile view

### Authentication Pages  
- [ ] /login renders login form
- [ ] /signup shows role selection
- [ ] /signup/farmer - farmer signup page
- [ ] /signup/buyer - buyer signup page
- [ ] /signup/business - business signup page
- [ ] /signup/reseller - reseller signup page

### Farmer Dashboard (/farmer/dashboard)
- [ ] Dashboard loads without errors
- [ ] Stats cards display (Revenue, Crops, Orders, Stock)
- [ ] Mock data displays correctly
- [ ] Orders table shows recent orders
- [ ] All stat values are visible

### Farmer Pages
- [ ] /farmer/crops - Crops list and modal appear
- [ ] /farmer/orders - Orders for farmer display
- [ ] /farmer/analytics - Analytics page loads
- [ ] /farmer/settings - Settings page renders
- [ ] /farmer/logistics - **NEW** Logistics page loads with Benguet coverage and ordinance compliance

### Buyer Pages
- [ ] /buyer/dashboard - Shows buyer stats
- [ ] /buyer/cart - Cart page loads (empty initially)
- [ ] /buyer/checkout - Checkout form appears
- [ ] /buyer/orders - Buyer's orders display
- [ ] /buyer/favorites - Favorites section shows
- [ ] /buyer/settings - Settings loads

### Business Pages
- [ ] /business/dashboard - Dashboard loads
- [ ] /business/browse - Browse listings works
- [ ] /business/inventory - Inventory list shows
- [ ] /business/orders - Orders display

### Reseller Pages
- [ ] /reseller/dashboard - Loads successfully
- [ ] /reseller/wholesale - Wholesale section works
- [ ] /reseller/inventory - Inventory displays
- [ ] /reseller/orders - Orders shown
- [ ] /reseller/sales - Sales data visible

---

## 3. Farmer Settings Testing (NEW)

### Profile Tab
- [ ] Profile photo upload works (max 2MB, JPG/PNG)
- [ ] Name and mobile number fields save correctly
- [ ] Mobile number validation (09xxxxxxxxx format)
- [ ] Profile updates persist to database

### Farm Details Tab
- [ ] Municipality dropdown shows Benguet municipalities
- [ ] Barangay and farm size fields accept input
- [ ] Verification status shows correctly

### Payments Tab
- [ ] **NEW**: Payment methods start blank for new farmers
- [ ] **NEW**: Shows "No payment methods configured yet" message
- [ ] **NEW**: Add Method button is disabled (pilot limitation)
- [ ] Existing payment methods display if present

### Delivery Tab
- [ ] **NEW**: Delivery areas derived from farmer location (city/municipality)
- [ ] **NEW**: Shows "No delivery areas set. Derived from your location" when empty
- [ ] **NEW**: Minimum order input is in kilograms (not currency)
- [ ] **NEW**: Minimum order value persists (default 50kg)
- [ ] Add Delivery Area button disabled (pilot limitation)

### Security & Notifications Tabs
- [ ] Password change shows "not implemented yet" info
- [ ] 2FA enable button present but not functional
- [ ] Notification preferences render correctly

---

## 4. Farmer Logistics Testing (NEW)

### Logistics Page (/farmer/logistics)
- [ ] **NEW**: Page loads without errors
- [ ] **NEW**: Shows "Benguet Province" coverage area
- [ ] **NEW**: Displays farmer’s current location (city/province)
- [ ] **NEW**: Ordinance Compliance section shows truck ban rules
- [ ] **NEW**: Violation Penalties section displays fines
- [ ] **NEW**: Best Practices section shows optimal delivery times
- [ ] **NEW**: "View Interactive Map" button disabled (pilot limitation)

### Sidebar Update
- [ ] **NEW**: Logistics link points to /farmer/logistics (not /logistics/dashboard)
- [ ] **NEW**: Navigation highlights correct active page

---

## 5. Component Testing

### UI Components
- [ ] Buttons are clickable and styled correctly
- [ ] Forms have proper layout
- [ ] Tables display data correctly
- [ ] Cards render with proper spacing
- [ ] Navigation works between pages
- [ ] Sidebars collapse/expand properly
- [ ] Icons display from lucide-react

### Data Display
- [ ] Product listings show price/availability
- [ ] Order statuses display with correct colors
- [ ] User roles visible on profiles
- [ ] Quantity fields show correct units (kg)
- [ ] Currency displays as ₱ (Philippine Peso)

---

## 6. Data Flow Testing

### Database Queries
- [ ] Products query returns farmer relation correctly
- [ ] Listings include seller and product data
- [ ] Orders fetch with items and buyer/seller info
- [ ] User queries include products/listings/orders relations
- [ ] **NEW**: User queries include minimumOrderKg, deliveryAreas, paymentMethods

### Mock Data Validation
- [ ] 5 products exist and display correctly
- [ ] 5 listings have valid pricing (₱35-80/kg)
- [ ] 5 users have correct roles
- [ ] 1 order shows with status "CONFIRMED"
- [ ] Relationships are intact (farmer→products, etc.)

---

## 7. Cart Functionality Testing

- [ ] Add product to cart (if connected to API)
- [ ] Remove product from cart
- [ ] Update quantity in cart
- [ ] Clear cart
- [ ] Cart persists in localStorage
- [ ] Cart displays total price
- [ ] Checkout page shows cart items

---

## 8. Error Handling Testing

### API Error Cases
- [ ] GET /api/products/9999 - Returns 404 "product not found"
- [ ] POST /api/orders with invalid data - Returns 400 with validation error
- [ ] Invalid order status - Returns 400 "invalid status"
- [ ] Non-existent user update - Returns 404
- [ ] Missing required fields - Returns 400 error
- [ ] **NEW**: /api/orders without Authorization header returns 401 (fixed)

### Frontend Error Cases
- [ ] Page navigation handles 404s
- [ ] API errors display user-friendly messages
- [ ] Network errors don't crash the app
- [ ] Invalid form input shows validation errors

---

## 9. Responsive Design Testing

- [ ] Pages render on mobile (320px width)
- [ ] Tablet view (768px) looks correct
- [ ] Desktop view (1024px+) optimal
- [ ] Navigation works on all sizes
- [ ] Tables don't overflow on mobile
- [ ] Images scale properly
- [ ] Text is readable on all sizes

---

## 10. Performance Testing

- [ ] API responses are fast (< 500ms)
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Images load without delays
- [ ] Database queries are efficient
- [ ] No memory leaks visible

---

## 11. Role-Based Access Testing

- [ ] Farmer role can see farmer-specific pages
- [ ] Buyer can see buyer pages
- [ ] Business can access business pages
- [ ] Reseller can access reseller sections
- [ ] Navigation reflects current user role
- [ ] Dashboards show role-appropriate data

---

## 12. Data Persistence Testing

### localStorage Testing (Cart)
- [ ] Items added to cart persist on refresh
- [ ] Cart clears when "Clear Cart" clicked
- [ ] LocalStorage shows correct structure

### Database Testing
- [ ] New products created remain after server restart
- [ ] Orders persist in database
- [ ] User data survives restarts
- [ ] Relations maintain integrity
- [ ] **NEW**: Farmer settings (minimumOrderKg, deliveryAreas, paymentMethods) persist

---

## 13. Known Issues to Investigate

- [ ] Frontend pages use mock data instead of API (by design, not yet integrated)
- [ ] Order POST/PATCH/DELETE not yet tested (code ready)
- [ ] Add Method buttons disabled (pilot limitation)
- [ ] Interactive Map not implemented (pilot limitation)
- [ ] Password change endpoint not implemented
- [ ] Cart not connected to backend inventory

---

## 14. Browser Compatibility

- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works in Safari (if available)

---

## Test Results Log

### Passed Tests
- ✅ All GET endpoints responding correctly
- ✅ Database connections working
- ✅ TypeScript compilation successful
- ✅ All pages render without errors
- ✅ Components display properly
- ✅ Styling is correct
- ✅ **NEW**: Farmer settings persistence working
- ✅ **NEW**: Farmer logistics page loads
- ✅ **NEW**: Unauthorized /api/orders error fixed

### Failed Tests
- None identified yet - ready for comprehensive testing!

### Warnings
- Some baseline-browser-mapping warnings (non-critical)
- Consider updating packages in next maintenance cycle

---

## Testing Conclusion

**Status**: ✅ **READY FOR COMPREHENSIVE TESTING**

All critical systems are operational. Ready to execute full test suite and identify bugs, imperfections, or deficiencies.

**Next Steps**:
1. Run through each section of this checklist
2. Document any issues found
3. Prioritize fixes (critical vs. enhancement)
4. Connect frontend to API endpoints
5. Implement authentication

**Server Details**:
- URL: http://localhost:3000
- Start: `npm start` (from project root)
- Database: SQLite (./dev.db)
- Logs: Console output shows all requests

**Recent Updates (2026-02-06)**:
- Farmer Settings: Blank payment methods for new accounts; minimum order in kg; delivery areas derived from location
- Farmer Logistics: New page at /farmer/logistics with Benguet coverage and ordinance compliance
- Database: Added deliveryAreas, paymentMethods, minimumOrderKg to User model
- API: /api/users/[id] PATCH supports new farmer fields
- Bug Fix: Added Authorization header to /api/orders fetch in logistics dashboard

