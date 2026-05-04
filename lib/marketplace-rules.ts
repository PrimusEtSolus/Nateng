/**
 * Marketplace transaction rules enforcement
 * 
 * Rules:
 * - Farmers may sell to Business, Reseller, and Buyer users
 * - Resellers may sell only to Buyer users  
 * - Buyers may purchase from Reseller or Farmer users
 * - Business and Reseller users may purchase from Farmers
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
  // Admin can do anything
  if (sellerRole === 'admin' || buyerRole === 'admin') {
    return { allowed: true }
  }

  // Farmers may sell to Business, Reseller, and Buyer users
  if (sellerRole === 'farmer') {
    const allowedBuyers = ['business', 'reseller', 'buyer']
    return {
      allowed: allowedBuyers.includes(buyerRole),
      allowedRoles: allowedBuyers,
      reason: allowedBuyers.includes(buyerRole) 
        ? undefined 
        : `Farmers can only sell to Business, Reseller, and Buyer users, not ${buyerRole}`
    }
  }

  // Resellers may sell only to Buyer users
  if (sellerRole === 'reseller') {
    const allowedBuyers = ['buyer']
    return {
      allowed: allowedBuyers.includes(buyerRole),
      allowedRoles: allowedBuyers,
      reason: allowedBuyers.includes(buyerRole)
        ? undefined
        : `Resellers can only sell to Buyer users, not ${buyerRole}`
    }
  }

  // Business users cannot sell (they are buyers only)
  if (sellerRole === 'business') {
    return {
      allowed: false,
      reason: 'This seller cannot offer products'
    }
  }

  // Buyers cannot sell (they are buyers only)
  if (sellerRole === 'buyer') {
    return {
      allowed: false,
      reason: 'This seller cannot offer products'
    }
  }

  return { allowed: false, reason: `Unknown seller role: ${sellerRole}` }
}

/**
 * Check if a buyer can purchase from a seller based on marketplace rules
 */
export function canBuyFrom(buyerRole: UserRole, sellerRole: UserRole): MarketplaceRuleViolation {
  // Admin can do anything
  if (buyerRole === 'admin' || sellerRole === 'admin') {
    return { allowed: true }
  }

  // Buyers may purchase from Reseller or Farmer users
  if (buyerRole === 'buyer') {
    const allowedSellers = ['reseller', 'farmer']
    return {
      allowed: allowedSellers.includes(sellerRole),
      allowedRoles: allowedSellers,
      reason: allowedSellers.includes(sellerRole)
        ? undefined
        : `Buyers can only purchase from Reseller or Farmer users, not ${sellerRole}`
    }
  }

  // Business and Reseller users may purchase only from Farmers
  if (buyerRole === 'business' || buyerRole === 'reseller') {
    const allowedSellers = ['farmer']
    return {
      allowed: allowedSellers.includes(sellerRole),
      allowedRoles: allowedSellers,
      reason: allowedSellers.includes(sellerRole)
        ? undefined
        : `${buyerRole} users can only purchase from Farmers, not ${sellerRole}`
    }
  }

  // Farmers cannot purchase (they are sellers only)
  if (buyerRole === 'farmer') {
    return {
      allowed: false,
      reason: 'Farmer users cannot purchase products, they can only sell'
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
    // This should never happen if rules are consistent
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
  const allRoles: UserRole[] = ['farmer', 'buyer', 'reseller', 'business', 'admin']
  
  return allRoles.filter(buyerRole => {
    const result = canSellTo(sellerRole, buyerRole)
    return result.allowed
  })
}

/**
 * Get allowed seller roles for a given buyer role
 */
export function getAllowedSellersForBuyer(buyerRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ['farmer', 'buyer', 'reseller', 'business', 'admin']
  
  return allRoles.filter(sellerRole => {
    const result = canBuyFrom(buyerRole, sellerRole)
    return result.allowed
  })
}

/**
 * Filter listings based on user's role and marketplace rules
 */
export function filterListingsByUserRole<T extends { seller: { role: string } }>(
  listings: T[],
  userRole: UserRole
): T[] {
  if (userRole === 'admin') {
    return listings // Admin can see all listings
  }

  const allowedSellers = getAllowedSellersForBuyer(userRole)
  
  return listings.filter(listing => 
    allowedSellers.includes(listing.seller.role as UserRole)
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

  // Farmers and Resellers can create listings
  if (userRole === 'farmer' || userRole === 'reseller') {
    return { allowed: true }
  }

  // Buyers and Business users cannot create listings
  return {
    allowed: false,
    reason: 'Only Farmers and Resellers can create listings'
  }
}
