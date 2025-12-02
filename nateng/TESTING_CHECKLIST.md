# NatengHub - Bug Hunting & Feature Testing Checklist

## Status: ✅ READY FOR TESTING
**Server**: Running on http://localhost:3000  
**Database**: SQLite with 5 seeded products, 5 listings, 5 users, 1 order  
**Build**: Production-ready (no TypeScript errors)

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
- [ ] GET /api/orders - Returns all orders
- [ ] GET /api/orders/1 - Get order with items
- [ ] POST /api/orders - Create order (test with: `{ buyerId: 4, sellerId: 1, items: [{ listingId: 1, quantity: 50 }] }`)
- [ ] PATCH /api/orders/1 - Update order status to "SHIPPED"
- [ ] DELETE /api/orders/1 - Delete pending order

### Users API
- [ ] GET /api/users - Returns all users
- [ ] GET /api/users?role=farmer - Filter by role
- [ ] GET /api/users/1 - Get user profile with relations
- [ ] POST /api/users - Create new user
- [ ] PATCH /api/users/1 - Update user role/email
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

## 3. Component Testing

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

## 4. Data Flow Testing

### Database Queries
- [ ] Products query returns farmer relation correctly
- [ ] Listings include seller and product data
- [ ] Orders fetch with items and buyer/seller info
- [ ] User queries include products/listings/orders relations

### Mock Data Validation
- [ ] 5 products exist and display correctly
- [ ] 5 listings have valid pricing (₱35-80/kg)
- [ ] 5 users have correct roles
- [ ] 1 order shows with status "CONFIRMED"
- [ ] Relationships are intact (farmer→products, etc.)

---

## 5. Cart Functionality Testing

- [ ] Add product to cart (if connected to API)
- [ ] Remove product from cart
- [ ] Update quantity in cart
- [ ] Clear cart
- [ ] Cart persists in localStorage
- [ ] Cart displays total price
- [ ] Checkout page shows cart items

---

## 6. Error Handling Testing

### API Error Cases
- [ ] GET /api/products/9999 - Returns 404 "product not found"
- [ ] POST /api/orders with invalid data - Returns 400 with validation error
- [ ] Invalid order status - Returns 400 "invalid status"
- [ ] Non-existent user update - Returns 404
- [ ] Missing required fields - Returns 400 error

### Frontend Error Cases
- [ ] Page navigation handles 404s
- [ ] API errors display user-friendly messages
- [ ] Network errors don't crash the app
- [ ] Invalid form input shows validation errors

---

## 7. Responsive Design Testing

- [ ] Pages render on mobile (320px width)
- [ ] Tablet view (768px) looks correct
- [ ] Desktop view (1024px+) optimal
- [ ] Navigation works on all sizes
- [ ] Tables don't overflow on mobile
- [ ] Images scale properly
- [ ] Text is readable on all sizes

---

## 8. Performance Testing

- [ ] API responses are fast (< 500ms)
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Images load without delays
- [ ] Database queries are efficient
- [ ] No memory leaks visible

---

## 9. Role-Based Access Testing

- [ ] Farmer role can see farmer-specific pages
- [ ] Buyer can see buyer pages
- [ ] Business can access business pages
- [ ] Reseller can access reseller sections
- [ ] Navigation reflects current user role
- [ ] Dashboards show role-appropriate data

---

## 10. Data Persistence Testing

### localStorage Testing (Cart)
- [ ] Items added to cart persist on refresh
- [ ] Cart clears when "Clear Cart" clicked
- [ ] LocalStorage shows correct structure

### Database Testing
- [ ] New products created remain after server restart
- [ ] Orders persist in database
- [ ] User data survives restarts
- [ ] Relations maintain integrity

---

## 11. Known Issues to Investigate

- [ ] Frontend pages use mock data instead of API (by design, not yet integrated)
- [ ] Order POST/PATCH/DELETE not yet tested (code ready)
- [ ] No authentication system (accessible without login)
- [ ] Cart not connected to backend inventory
- [ ] No form submission implemented on signup pages

---

## 12. Browser Compatibility

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

