"use client"

import { useState, useEffect } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { ordersAPI } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingCart, MapPin, Package, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Listing {
  id: number
  productId: number
  sellerId: number
  priceCents: number
  quantity: number
  available: boolean
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

interface CartItem {
  listing: Listing
  quantity: number
}

export default function BusinessBrowsePage() {
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch available listings
  const { data: listings, loading: listingsLoading } = useFetch<Listing[]>('/api/listings?available=true')

  const productCategories = ["All", "Vegetables", "Leafy Greens", "Root Vegetables", "Fruits"]

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = listing.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || true // Simplified
    return matchesSearch && matchesCategory && listing.available && listing.quantity > 0
  }) || []

  const handleAddToOrder = () => {
    if (selectedListing && orderQuantity) {
      const qty = Number(orderQuantity)
      if (qty > 0 && qty <= selectedListing.quantity) {
        setCart([...cart, { listing: selectedListing, quantity: qty }])
        setSelectedListing(null)
        setOrderQuantity("")
        toast.success("Added to order")
      } else {
        toast.error(`Quantity must be between 1 and ${selectedListing.quantity}kg`)
      }
    }
  }

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) {
      toast.error("Please add items to your order")
      return
    }

    setIsPlacingOrder(true)
    try {
      // Group items by seller for order creation
      const itemsBySeller = cart.reduce((acc, item) => {
        const sellerId = item.listing.sellerId
        if (!acc[sellerId]) {
          acc[sellerId] = []
        }
        acc[sellerId].push({
          listingId: item.listing.id,
          quantity: item.quantity,
        })
        return acc
      }, {} as Record<number, Array<{ listingId: number; quantity: number }>>)

      // Create orders for each seller
      const orderPromises = Object.entries(itemsBySeller).map(([sellerId, items]) =>
        ordersAPI.create({
          buyerId: user.id,
          sellerId: Number(sellerId),
          items,
        })
      )

      await Promise.all(orderPromises)
      toast.success("Order placed successfully!")
      setCart([])
    } catch (error: any) {
      toast.error(error.message || "Failed to place order")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const totalCartValue = cart.reduce((sum, item) => sum + (item.listing.priceCents * item.quantity / 100), 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wholesale Market</h1>
          <p className="text-muted-foreground mt-1">Browse fresh produce directly from Benguet farmers</p>
        </div>
        {cart.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="gap-2"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Place Order
                </>
              )}
            </Button>
            <Button className="bg-business hover:bg-business-light text-white gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length}) - ₱{totalCartValue.toLocaleString()}
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {productCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-business hover:bg-business-light" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {listingsLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {!listingsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-muted relative flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
                <span
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    listing.available && listing.quantity > 0
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {listing.quantity}kg available
                </span>
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{listing.product.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {listing.product.farmer.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sold by {listing.seller.name} ({listing.seller.role})
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {listing.product.description || "Fresh produce from Benguet"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-business">₱{(listing.priceCents / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Available</p>
                    <p className="text-sm text-muted-foreground">{listing.quantity}kg</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-business hover:bg-business-light text-white gap-2"
                  onClick={() => {
                    setSelectedListing(listing)
                    setOrderQuantity("1")
                  }}
                  disabled={!listing.available || listing.quantity === 0}
                >
                  <Package className="w-5 h-5" />
                  Place Wholesale Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!listingsLoading && filteredListings.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-1">No products found</h3>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}

      {/* Order Modal */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Place Wholesale Order</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4 py-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedListing.product.name}</h3>
                  <p className="text-sm text-muted-foreground">from {selectedListing.product.farmer.name}</p>
                  <p className="text-lg font-bold text-business mt-1">
                    ₱{(selectedListing.priceCents / 100).toFixed(2)}/kg
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Order Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={selectedListing.quantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
                <p className="text-xs text-muted-foreground">
                  Available: {selectedListing.quantity}kg
                </p>
              </div>

              {orderQuantity && Number(orderQuantity) > 0 && Number(orderQuantity) <= selectedListing.quantity && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span>₱{((selectedListing.priceCents / 100) * Number(orderQuantity)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-business">
                      ₱{((selectedListing.priceCents / 100) * Number(orderQuantity)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedListing(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-business hover:bg-business-light"
                  onClick={handleAddToOrder}
                  disabled={!orderQuantity || Number(orderQuantity) <= 0 || Number(orderQuantity) > selectedListing.quantity}
                >
                  Add to Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
