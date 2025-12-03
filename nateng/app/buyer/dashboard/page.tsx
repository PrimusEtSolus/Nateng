"use client"

import { useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { useDebounce } from "@/hooks/use-debounce"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name" | "quantity">("name")
  const { addToCart, items } = useCart()

  // Fetch available listings
  const { data: listings, loading: listingsLoading, error: listingsError } = useFetch<Listing[]>('/api/listings?available=true')

  // Extract unique product names for categories (simplified)
  const productCategories = ["All", "Vegetables", "Leafy Greens", "Root Vegetables", "Fruits"]

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = listing.product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    // Category filtering would need product.category field - simplified for now
    const matchesCategory = selectedCategory === "All" || true
    return matchesSearch && matchesCategory && listing.available && listing.quantity > 0
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
    const newQuantity = quantity > 0 ? quantity : 1
    const currentItem = items.find((i) => i.listingId === listing.id)
    const totalQuantity = (currentItem?.quantity || 0) + newQuantity

    if (totalQuantity > listing.quantity) {
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
      quantity: newQuantity,
      priceCents: listing.priceCents,
    })

    toast.success("Added to cart", {
      description: `${newQuantity}kg of ${listing.product.name} added`,
    })
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
            onClick: () => window.location.reload(),
          }}
        />
      )}

      {/* Loading State */}
      {listingsLoading && <ProductGridSkeleton count={8} />}

      {/* Products Grid */}
      {!listingsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  src={null}
                  alt={listing.product.name}
                  className="w-full h-full"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(listing.id)
                  }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>
                {listing.quantity > 100 && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-buyer text-white text-xs font-medium rounded-full">
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
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(listing, -1)
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{cartQty}</span>
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-buyer hover:bg-buyer-light"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(listing, 1)
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
                        handleAddToCart(listing, 1)
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
                    src={null}
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

                  <p className="text-sm text-muted-foreground">
                    {selectedListing.product.description || "Fresh produce from Benguet highlands"}
                  </p>
                </div>
              </div>

              <DialogFooter className="sm:justify-between sm:flex-row">
                <div>
                  <p className="text-2xl font-bold text-buyer">₱{(selectedListing.priceCents / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">per kilogram</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedListing(null)}>
                    Close
                  </Button>
                  <Button
                    className="bg-buyer hover:bg-buyer-light text-white"
                    onClick={() => {
                      handleAddToCart(selectedListing, 1)
                      setSelectedListing(null)
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add 1 kg to cart
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
