/**
 * Marketplace transaction rules enforcement
 * 
 * Rules:
 * - Farmers may sell to Buyers and BulkBuyers
 * - BulkBuyers may sell only to Buyers
 * - Buyers may purchase from Farmers or BulkBuyers
 * - BulkBuyers may purchase only from Farmers
 * - Admin can do anything
 */

import type { UserRole } from '@/lib/types';

export interface MarketplaceRuleViolation {
  allowed: boolean
  reason?: string
  allowedRoles?: string[]
}

/**
 * Check if a seller can sell to a buyer based on marketplace rules
 */
export function canSellTo(sellerRole: UserRole, buyerRole: UserRole): MarketplaceRuleViolation {
  // Admin can do anything (symmetric bypass for consistency)
  if (sellerRole === 'admin' || buyerRole === 'admin') {
    return { allowed: true }
  }

  // Farmers may sell to Buyers and BulkBuyers
  if (sellerRole === 'farmer') {
    const allowedBuyers = ['buyer', 'bulkBuyer']
    return {
      allowed: allowedBuyers.includes(buyerRole),
      allowedRoles: allowedBuyers,
      reason: allowedBuyers.includes(buyerRole) 
        ? undefined 
        : `Farmers can only sell to Buyers and BulkBuyers, not ${buyerRole}`
    }
  }

  // BulkBuyers may sell only to Buyers
  if (sellerRole === 'bulkBuyer') {
    const allowedBuyers = ['buyer']
    return {
      allowed: allowedBuyers.includes(buyerRole),
      allowedRoles: allowedBuyers,
      reason: allowedBuyers.includes(buyerRole)
        ? undefined
        : `BulkBuyers can only sell to Buyers, not ${buyerRole}`
    }
  }

  // Buyers cannot sell (they are buyers only)
  if (sellerRole === 'buyer') {
    return {
      allowed: false,
      reason: 'Buyers cannot sell products'
    }
  }

  return { allowed: false, reason: `Unknown seller role: ${sellerRole}` }
}

/**
 * Check if a buyer can purchase from a seller based on marketplace rules
 */
export function canBuyFrom(buyerRole: UserRole, sellerRole: UserRole): MarketplaceRuleViolation {
  // Admin can do anything (symmetric bypass for consistency)
  if (buyerRole === 'admin' || sellerRole === 'admin') {
    return { allowed: true }
  }

  // Buyers may purchase from Farmers or BulkBuyers
  if (buyerRole === 'buyer') {
    const allowedSellers = ['farmer', 'bulkBuyer']
    return {
      allowed: allowedSellers.includes(sellerRole),
      allowedRoles: allowedSellers,
      reason: allowedSellers.includes(sellerRole)
        ? undefined
        : `Buyers can only purchase from Farmers or BulkBuyers, not ${sellerRole}`
    }
  }

  // BulkBuyers may purchase only from Farmers
  if (buyerRole === 'bulkBuyer') {
    const allowedSellers = ['farmer']
    return {
      allowed: allowedSellers.includes(sellerRole),
      allowedRoles: allowedSellers,
      reason: allowedSellers.includes(sellerRole)
        ? undefined
        : `BulkBuyers can only purchase from Farmers, not ${sellerRole}`
    }
  }

  // Farmers cannot purchase (they are sellers only)
  if (buyerRole === 'farmer') {
    return {
      allowed: false,
      reason: 'Farmers cannot purchase products, they can only sell'
    }
  }

  return { allowed: false, reason: `Unknown buyer role: ${buyerRole}` }
}

/**
 * Validate a marketplace transaction (both directions)
 */
export function validateMarketplaceTransaction(
  sellerRole: UserRole, 
  buyerRole: UserRole
): MarketplaceRuleViolation {
  const sellerCheck = canSellTo(sellerRole, buyerRole)
  const buyerCheck = canBuyFrom(buyerRole, sellerRole)

  // Both checks should agree
  if (sellerCheck.allowed !== buyerCheck.allowed) {
    return {
      allowed: false,
      reason: 'Inconsistent marketplace rules detected'
    }
  }

  return sellerCheck
}

/**
 * Get allowed buyer roles for a given seller role
 */
export function getAllowedBuyersForSeller(sellerRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ['farmer', 'buyer', 'bulkBuyer', 'admin']
  
  return allRoles.filter(buyerRole => {
    const result = canSellTo(sellerRole, buyerRole)
    return result.allowed
  }).filter(role => role !== 'admin') // Explicitly exclude admin from discovery lists
}

/**
 * Get allowed seller roles for a given buyer role
 */
export function getAllowedSellersForBuyer(buyerRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ['farmer', 'buyer', 'bulkBuyer', 'admin']
  
  return allRoles.filter(sellerRole => {
    const result = canBuyFrom(buyerRole, sellerRole)
    return result.allowed
  }).filter(role => role !== 'admin') // Explicitly exclude admin from discovery lists
}

/**
 * Filter listings based on user's role and marketplace rules
 */
export function filterListingsByUserRole<T extends { seller: { role: UserRole } }>(
  listings: T[],
  userRole: UserRole
): T[] {
  if (userRole === 'admin') {
    return listings // Admin can see all listings (including admin-owned)
  }

  const allowedSellers = getAllowedSellersForBuyer(userRole)
  
  return listings.filter(listing => 
    allowedSellers.includes(listing.seller.role)
  )
}

/**
 * Check if a user can create listings based on their role
 */
export function canCreateListings(userRole: UserRole): MarketplaceRuleViolation {
  // Admin can do anything
  if (userRole === 'admin') {
    return { allowed: true }
  }

  // Farmers and BulkBuyers can create listings
  if (userRole === 'farmer' || userRole === 'bulkBuyer') {
    return { allowed: true }
  }

  // Buyers cannot create listings
  return {
    allowed: false,
    reason: 'Only Farmers and BulkBuyers can create listings'
  }
}
