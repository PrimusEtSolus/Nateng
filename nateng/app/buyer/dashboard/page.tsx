"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { useDebounce } from "@/hooks/use-debounce"
import { useCart } from "@/lib/cart-context"
import { formatDate } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Heart, Star, MapPin, ShoppingCart, Plus, Minus, Loader2, Filter } from "lucide-react"
import Link from "next/link"
import { ProductGridSkeleton, ProductCardSkeleton } from "@/components/loading-skeletons"
import { EmptyState } from "@/components/empty-state"
import { ProductImage } from "@/components/product-image"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Listing {
  id: number
  productId: number
  sellerId: number
  priceCents: number
  quantity: number
  available: boolean
  createdAt: string
  product: {
    id: number
    name: string
    description: string | null
    imageUrl: string | null
    farmer: {
      id: number
      name: string
      email: string
    }
  }
  seller: {
    id: number
    name: string
    role: string
    email: string
  }
}

export default function BuyerDashboardPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [dialogQuantity, setDialogQuantity] = useState("0.2")
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name" | "quantity">("name")
  const { addToCart, updateQuantity, items } = useCart()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'buyer') {
      router.push('/login')
      return
    }
  }, [router])

  // Reset dialog quantity when listing changes
  useEffect(() => {
    if (selectedListing) {
      setDialogQuantity("0.2")
    }
  }, [selectedListing])

  // Fetch available listings - only from resellers (farmers only accept bulk orders)
  const { data: listings, loading: listingsLoading, error: listingsError } = useFetch<Listing[]>('/api/listings?available=true')

  // Extract unique product names for categories (simplified)
  const productCategories = ["All", "Vegetables", "Leafy Greens", "Root Vegetables", "Fruits"]

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = listing.product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    // Category filtering would need product.category field - simplified for now
    const matchesCategory = selectedCategory === "All" || true
    // Only show resellers - farmers only accept bulk orders (for business/reseller portals)
    const isReseller = listing.seller.role === 'reseller'
    return matchesSearch && matchesCategory && listing.available && listing.quantity > 0 && isReseller
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.priceCents - b.priceCents
      case "price-desc":
        return b.priceCents - a.priceCents
      case "name":
        return a.product.name.localeCompare(b.product.name)
      case "quantity":
        return b.quantity - a.quantity
      default:
        return 0
    }
  }) || []

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const getCartQuantity = (listingId: number) => {
    const item = items.find((i) => i.listingId === listingId)
    return item?.quantity || 0
  }

  const handleAddToCart = (listing: Listing, quantity: number) => {
    // Minimum order for retail (buyer portal): 200 grams (0.2kg)
    const MIN_QUANTITY = 0.2
    const currentItem = items.find((i) => i.listingId === listing.id)
    const currentQuantity = currentItem?.quantity || 0
    const newTotalQuantity = currentQuantity + quantity

    // Validate minimum order
    if (newTotalQuantity > 0 && newTotalQuantity < MIN_QUANTITY) {
      toast.error("Minimum order required", {
        description: `Minimum order is ${MIN_QUANTITY}kg (200 grams)`,
      })
      return
    }

    if (newTotalQuantity > listing.quantity) {
      toast.error("Insufficient stock", {
        description: `Only ${listing.quantity}kg available`,
      })
      return
    }

    addToCart({
      listingId: listing.id,
      sellerId: listing.sellerId,
      productName: listing.product.name,
      sellerName: listing.seller.name,
      quantity: quantity,
      priceCents: listing.priceCents,
    })

    if (quantity > 0) {
      toast.success("Added to cart", {
        description: `${quantity.toFixed(1)}kg of ${listing.product.name} added`,
      })
    } else {
      toast.success("Removed from cart", {
        description: `${Math.abs(quantity).toFixed(1)}kg of ${listing.product.name} removed`,
      })
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fresh from Benguet</h1>
          <p className="text-muted-foreground mt-1">Shop farm-fresh vegetables delivered to your doorstep</p>
        </div>
        <Link href="/buyer/cart">
          <Button className="bg-buyer hover:bg-buyer-light text-white gap-2">
            <ShoppingCart className="w-5 h-5" />
            View Cart ({items.length})
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search fresh produce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const options = ["price-asc", "price-desc", "name", "quantity"] as const
                const currentIndex = options.indexOf(sortBy)
                setSortBy(options[(currentIndex + 1) % options.length])
              }}
            >
              <Filter className="w-4 h-4" />
              Sort: {sortBy === "price-asc" ? "Price ↑" : sortBy === "price-desc" ? "Price ↓" : sortBy === "name" ? "Name" : "Stock"}
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {productCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-buyer hover:bg-buyer-light" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>
        {debouncedSearchTerm && (
          <p className="text-sm text-muted-foreground">
            Found {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
          </p>
        )}
      </div>

      {/* Error State */}
      {listingsError && (
        <EmptyState
          icon={ShoppingCart}
          title="Failed to load products"
          description="There was an error loading the products. Please try again."
          action={{
            label: "Retry",
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            },
          }}
        />
      )}

      {/* Loading State */}
      {listingsLoading && <ProductGridSkeleton count={8} />}

      {/* Products Grid */}
      {!listingsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredListings.map((listing) => {
            const cartQty = getCartQuantity(listing.id)
            const isFavorite = favorites.includes(listing.id)
            const pricePerKg = listing.priceCents / 100

          return (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-all group cursor-pointer focus-visible:ring-2 focus-visible:ring-buyer focus-visible:ring-offset-2"
              onClick={() => setSelectedListing(listing)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setSelectedListing(listing)
                }
              }}
            >
              <div className="aspect-square bg-muted relative overflow-hidden group">
                <ProductImage
                  src={listing.product.imageUrl}
                  alt={listing.product.name}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(listing.id)
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>
                {listing.quantity > 100 && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-buyer text-white text-xs font-medium rounded-full shadow-md">
                    Popular
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{listing.product.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      Sold by {listing.seller.name} ({listing.seller.role})
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      From farmer {listing.product.farmer.name}
                    </p>
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
                  {listing.product.description || "Fresh produce from Benguet"}
                </p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-buyer">₱{pricePerKg.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per kg • {listing.quantity}kg available</p>
                  </div>

                  {cartQty > 0 ? (
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-muted-foreground/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Minimum order: 0.2kg (200 grams)
                          const newQuantity = Math.max(0, cartQty - 0.2)
                          if (newQuantity === 0) {
                            updateQuantity(listing.id, 0)
                            toast.success("Removed from cart")
                          } else if (newQuantity >= 0.2) {
                            updateQuantity(listing.id, newQuantity)
                          } else {
                            toast.error("Minimum order is 0.2kg")
                          }
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium px-2 min-w-[3rem] text-center">
                        {cartQty.toFixed(1)}kg
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-muted-foreground/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateQuantity(listing.id, cartQty + 0.2)
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-buyer hover:bg-buyer-light text-white gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Minimum order: 0.2kg (200 grams) for retail
                        handleAddToCart(listing, 0.2)
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        </div>
      )}

      {!listingsLoading && !listingsError && filteredListings.length === 0 && (
        <EmptyState
          icon={Search}
          title={debouncedSearchTerm ? "No products found" : "No products available"}
          description={
            debouncedSearchTerm
              ? `No products match "${debouncedSearchTerm}". Try a different search term.`
              : "There are no products available at the moment. Check back later!"
          }
          action={
            debouncedSearchTerm
              ? {
                  label: "Clear search",
                  onClick: () => setSearchTerm(""),
                }
              : undefined
          }
        />
      )}

      <Dialog
        open={!!selectedListing}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedListing(null)
            setDialogQuantity("0.2")
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.product.name}</DialogTitle>
                <DialogDescription>
                  Sold by {selectedListing.seller.name} ({selectedListing.seller.role}) with produce sourced from{" "}
                  {selectedListing.product.farmer.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border overflow-hidden bg-muted h-64">
                  <ProductImage
                    src={selectedListing.product.imageUrl}
                    alt={selectedListing.product.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">Seller</p>
                    <p className="font-medium">{selectedListing.seller.name}</p>
                    <p className="text-muted-foreground">Role: {selectedListing.seller.role}</p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {selectedListing.seller.role === "reseller" 
                        ? "This reseller consolidates produce and handles delivery to buyers."
                        : "Direct from farmer"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">Source Farmer</p>
                    <p className="font-medium">{selectedListing.product.farmer.name}</p>
                    <p className="text-muted-foreground">{selectedListing.product.farmer.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="font-semibold">{selectedListing.quantity} kg</p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-semibold">₱{(selectedListing.priceCents / 100).toFixed(2)}/kg</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">Posted Date</p>
                    <p className="font-medium">{new Date(selectedListing.createdAt).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {selectedListing.product.description || "Fresh produce from Benguet highlands"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-quantity">Quantity (kg)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="dialog-quantity"
                      type="number"
                      min="0.2"
                      max={selectedListing.quantity}
                      step="0.1"
                      value={dialogQuantity}
                      onChange={(e) => {
                        const value = e.target.value
                        setDialogQuantity(value)
                      }}
                      placeholder="0.2"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum: 0.2kg (200 grams) • Available: {selectedListing.quantity}kg
                  </p>
                </div>
              </div>

              <DialogFooter className="sm:justify-between sm:flex-row">
                <div>
                  <p className="text-2xl font-bold text-buyer">
                    ₱{((selectedListing.priceCents / 100) * (parseFloat(dialogQuantity) || 0.2)).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">₱{(selectedListing.priceCents / 100).toFixed(2)} per kilogram</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setSelectedListing(null)
                    setDialogQuantity("0.2")
                  }}>
                    Close
                  </Button>
                  <Button
                    className="bg-buyer hover:bg-buyer-light text-white"
                    onClick={() => {
                      const quantity = parseFloat(dialogQuantity) || 0.2
                      const MIN_QUANTITY = 0.2
                      
                      if (quantity < MIN_QUANTITY) {
                        toast.error("Minimum order required", {
                          description: `Minimum order is ${MIN_QUANTITY}kg (200 grams)`,
                        })
                        return
                      }
                      
                      if (quantity > selectedListing.quantity) {
                        toast.error("Insufficient stock", {
                          description: `Only ${selectedListing.quantity}kg available`,
                        })
                        return
                      }
                      
                      handleAddToCart(selectedListing, quantity)
                      setSelectedListing(null)
                      setDialogQuantity("0.2")
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to cart
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
