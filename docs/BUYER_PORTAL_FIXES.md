# Buyer Portal Fixes - December 3, 2025

## Issues Fixed

### 1. ✅ Minus Button Bug - FIXED
**Problem**: The minus (-) button was adding items instead of subtracting them.

**Root Cause**: The `handleAddToCart` function converted negative quantities to 1:
```typescript
const newQuantity = quantity > 0 ? quantity : 1  // -1 became 1!
```

**Fix Applied**:
- Changed minus button to use `updateQuantity` directly from cart context
- Minus button now subtracts 0.2kg (200 grams) increments
- Properly handles removal when quantity reaches 0

**Files Modified**:
- `app/buyer/dashboard/page.tsx` - Fixed quantity controls
- `app/buyer/cart/page.tsx` - Fixed cart quantity controls

### 2. ✅ Buyer Portal Filter - FIXED
**Problem**: Buyer portal was showing farmers' listings, but farmers only accept bulk orders (for business/reseller portals).

**Fix Applied**:
- Added filter to only show listings from resellers: `listing.seller.role === 'reseller'`
- Buyers now only see retail listings from resellers
- Farmers' listings are only visible in business/reseller wholesale portals

**Files Modified**:
- `app/buyer/dashboard/page.tsx` - Added reseller filter

### 3. ✅ Minimum Order Validation - FIXED
**Problem**: No minimum order requirement for retail (buyer portal).

**Fix Applied**:
- Added minimum order of **200 grams (0.2kg)** for buyer portal
- All quantity controls now use 0.2kg increments
- Validation added in:
  - Dashboard (when adding to cart)
  - Cart page (when adjusting quantities)
  - Checkout page (before placing order)

**Files Modified**:
- `app/buyer/dashboard/page.tsx` - Added MIN_QUANTITY = 0.2 validation
- `app/buyer/cart/page.tsx` - Updated to 0.2kg increments
- `app/buyer/checkout/page.tsx` - Added minimum order validation

## Changes Summary

### Buyer Dashboard (`app/buyer/dashboard/page.tsx`)

1. **Filter to Resellers Only**:
```typescript
const filteredListings = listings?.filter((listing) => {
  // ... other filters ...
  const isReseller = listing.seller.role === 'reseller'
  return matchesSearch && matchesCategory && listing.available && listing.quantity > 0 && isReseller
})
```

2. **Fixed Minus Button**:
```typescript
onClick={(e) => {
  e.stopPropagation()
  const newQuantity = Math.max(0, cartQty - 0.2)
  if (newQuantity === 0) {
    updateQuantity(listing.id, 0)
    toast.success("Removed from cart")
  } else {
    updateQuantity(listing.id, newQuantity)
  }
}}
```

3. **Minimum Order Validation**:
```typescript
const MIN_QUANTITY = 0.2  // 200 grams
if (newTotalQuantity > 0 && newTotalQuantity < MIN_QUANTITY) {
  toast.error("Minimum order required", {
    description: `Minimum order is ${MIN_QUANTITY}kg (200 grams)`,
  })
  return
}
```

4. **Updated Add Button**:
```typescript
onClick={(e) => {
  e.stopPropagation()
  handleAddToCart(listing, 0.2)  // Start with minimum order
}}
```

### Buyer Cart (`app/buyer/cart/page.tsx`)

1. **Fixed Quantity Controls**:
```typescript
// Minus button
onClick={() => {
  const newQuantity = Math.max(0, item.quantity - 0.2)
  if (newQuantity === 0) {
    updateQuantity(itemId, 0)
  } else {
    updateQuantity(itemId, newQuantity)
  }
}}
disabled={item.quantity <= 0.2}  // Disable at minimum

// Plus button
onClick={() => {
  updateQuantity(itemId, item.quantity + 0.2)  // Increment by 0.2kg
}}
```

2. **Display Format**:
```typescript
<span>{item.quantity.toFixed(1)}kg</span>  // Show 1 decimal place
```

### Buyer Checkout (`app/buyer/checkout/page.tsx`)

1. **Pre-Order Validation**:
```typescript
const MIN_QUANTITY = 0.2
const invalidItems = items.filter(item => item.quantity > 0 && item.quantity < MIN_QUANTITY)
if (invalidItems.length > 0) {
  toast.error("Minimum order required", {
    description: `Each item must be at least ${MIN_QUANTITY}kg (200 grams)`,
  })
  return
}
```

## Business Logic

### Retail vs Wholesale

**Buyer Portal (Retail)**:
- ✅ Only shows resellers
- ✅ Minimum order: 200 grams (0.2kg)
- ✅ Increments: 0.2kg steps
- ✅ For individual consumers

**Business/Reseller Portals (Wholesale)**:
- ✅ Shows farmers' listings
- ✅ Bulk orders (no minimum for wholesale)
- ✅ For businesses and resellers

## Testing Checklist

- [x] Minus button subtracts 0.2kg correctly
- [x] Plus button adds 0.2kg correctly
- [x] Buyer portal only shows resellers
- [x] Minimum order validation works
- [x] Cart page uses 0.2kg increments
- [x] Checkout validates minimum order
- [x] Quantities display with 1 decimal place
- [x] Items can be removed when quantity reaches 0

## Related Files

- `app/buyer/dashboard/page.tsx` - Main buyer browsing page
- `app/buyer/cart/page.tsx` - Shopping cart
- `app/buyer/checkout/page.tsx` - Checkout process
- `lib/cart-context.tsx` - Cart state management

## Notes

- All quantity changes are in 0.2kg (200 gram) increments for retail
- Farmers' listings are filtered out from buyer portal
- Business and reseller portals still see farmers (for bulk orders)
- Minimum order is enforced at multiple points (dashboard, cart, checkout)

