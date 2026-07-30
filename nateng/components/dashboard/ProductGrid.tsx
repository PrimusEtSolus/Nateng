"use client"

import { type ReactNode } from "react"
import { Package, Leaf, Star, MapPin, Store, BadgeCheck, AlertTriangle } from "lucide-react"
import { type Listing, type Product } from "@/lib/types"
import { ProductCardSkeleton, ProductGridSkeleton } from "@/components/loading-skeletons"
import { EmptyState } from "@/components/empty-state"
import { ProductImage } from "@/components/product-image"
import { type LucideIcon } from "lucide-react"

interface ProductGridProps {
  items: (Listing | Product)[]
  loading: boolean
  onItemClick: (item: Listing | Product) => void
  emptyState: {
    icon: LucideIcon
    title: string
    description: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  variant: "cards" | "list"
  showTrustSignals?: boolean
  title?: string
  subtitle?: string
  accentColor?: string
  accentHoverColor?: string
  /** Render prop for role-specific actions (e.g., "Add to Cart", "Manage Stock") */
  actionSlot?: (item: Listing | Product) => ReactNode
  /** Render prop for custom content inside each card */
  children?: (item: Listing | Product) => ReactNode
}

function isListing(item: Listing | Product): item is Listing {
  return "priceCents" in item && "productId" in item
}

function getLowStockQuantity(item: Listing | Product): number {
  if (isListing(item)) {
    return item.quantity
  }
  // For Product type, sum up available listings
  return (item as Product).listings?.reduce((sum, l) => sum + (l.available ? l.quantity : 0), 0) || 0
}

function isLowStock(item: Listing | Product): boolean {
  const qty = getLowStockQuantity(item)
  return qty > 0 && qty <= 5
}

function isOutOfStock(item: Listing | Product): boolean {
  return getLowStockQuantity(item) === 0
}

function getProductName(item: Listing | Product): string {
  if (isListing(item)) return item.product?.name || "Product"
  return (item as Product).name
}

function getProductImage(item: Listing | Product): string | null {
  if (isListing(item)) return item.product?.imageUrl || null
  return (item as Product).imageUrl || null
}

function getPriceDisplay(item: Listing | Product): string | null {
  if (isListing(item)) {
    return `₱${(item.priceCents / 100).toLocaleString()}/kg`
  }
  // Product: show price range from listings
  const product = item as Product
  if (product.listings && product.listings.length > 0) {
    const prices = product.listings.filter(l => l.available).map(l => l.priceCents)
    if (prices.length > 0) {
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return min === max ? `₱${(min / 100).toLocaleString()}/kg` : `₱${(min / 100).toLocaleString()} - ₱${(max / 100).toLocaleString()}/kg`
    }
  }
  return null
}

function getQuantityDisplay(item: Listing | Product): string {
  const qty = getLowStockQuantity(item)
  if (isListing(item)) return `${qty}kg available`
  const product = item as Product
  const totalListings = product.listings?.length || 0
  return `${qty}kg available${totalListings > 0 ? ` (${totalListings} listing${totalListings !== 1 ? 's' : ''})` : ''}`
}

function getSellerName(item: Listing | Product): string | null {
  if (isListing(item)) return item.seller?.name || null
  const product = item as Product
  return product.farmer?.name || null
}

function getSellerRole(item: Listing | Product): string | null {
  if (isListing(item)) return item.seller?.role || null
  return "farmer"
}

function getSellerLocation(item: Listing | Product): string | null {
  if (!isListing(item)) return null
  const seller = item.seller
  if (seller?.city && seller?.province) {
    return `${seller.city}, ${seller.province}`
  }
  return null
}

export function ProductGrid({
  items,
  loading,
  onItemClick,
  emptyState,
  variant,
  showTrustSignals = false,
  title,
  subtitle,
  accentColor = "text-farmer",
  accentHoverColor = "hover:bg-farmer",
  actionSlot,
  children,
}: ProductGridProps) {
  if (loading) {
    if (variant === "cards") {
      return <ProductGridSkeleton count={8} />
    }
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
        {title && (
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div className="space-y-3">
          {items.map((item) => {
            const qty = getLowStockQuantity(item)
            const stockLow = isLowStock(item)
            const stockOut = isOutOfStock(item)

            return (
              <div
                key={isListing(item) ? item.id : (item as Product).id}
                className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-offset-2"
                role="button"
                tabIndex={0}
                onClick={() => onItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onItemClick(item)
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <ProductImage
                      src={getProductImage(item)}
                      alt={getProductName(item)}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getProductName(item)}</p>
                    <p className="text-xs text-muted-foreground">{getQuantityDisplay(item)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stockLow && !stockOut && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stockOut
                        ? "bg-red-100 text-red-700"
                        : stockLow
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {stockOut ? "out of stock" : stockLow ? "low stock" : "available"}
                  </span>
                  {actionSlot && actionSlot(item)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Cards variant (for Buyer dashboard)
  return (
    <div>
      {title && (
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => {
          if (!isListing(item)) return null // Cards variant only supports listings
          const listing = item
          const pricePerKg = listing.priceCents / 100
          const location = getSellerLocation(listing)

          return (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-all group cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={() => onItemClick(listing)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onItemClick(listing)
                }
              }}
            >
              <div className="aspect-square bg-muted relative overflow-hidden group">
                <ProductImage
                  src={listing.product?.imageUrl || null}
                  alt={listing.product?.name || "Product"}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {listing.quantity > 100 && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-buyer text-white text-xs font-medium rounded-full shadow-md">
                    Popular
                  </span>
                )}
                {showTrustSignals && (
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{listing.product?.name || "Product"}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      Sold by {listing.seller?.name || "Unknown"} ({listing.seller?.role || "seller"})
                      {location && ` • ${location}`}
                    </p>
                    {listing.seller?.role === 'bulkBuyer' && listing.seller?.address && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Store className="w-3 h-3" />
                        {listing.seller.address}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      From farmer {listing.product?.farmer?.name || "Unknown"}
                    </p>
                    {showTrustSignals && (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-[11px] text-muted-foreground ml-1">(4.8)</span>
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Posted {new Date(listing.createdAt).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {listing.product?.description || "Fresh produce from Benguet"}
                </p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-buyer">₱{pricePerKg.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per kg • {listing.quantity}kg available</p>
                  </div>
                  {actionSlot && actionSlot(listing)}
                </div>

                {children && children(listing)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}