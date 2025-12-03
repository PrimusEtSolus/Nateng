"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { ordersAPI } from "@/lib/api-client"
import { Search, ShoppingCart, MapPin, Package, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  }
}

interface CartItem {
  listing: Listing
  quantity: number
}

export default function ResellerWholesalePage() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const productCategories = ["All", "Vegetables", "Leafy Greens", "Root Vegetables", "Fruits"]

  // Fetch available listings from farmers
  const { data: listings, loading: listingsLoading } = useFetch<Listing[]>('/api/listings?available=true')

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = listing.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || true // Simplified
    return matchesSearch && matchesCategory && listing.available && listing.quantity > 0 && listing.seller.role === "farmer"
  }) || []

  const addToCart = (listing: Listing, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.listing.id === listing.id)
      if (existing) {
        return prev.map((item) => 
          item.listing.id === listing.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        )
      }
      return [...prev, { listing, quantity }]
    })
    toast.success("Added to cart")
  }

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) {
      toast.error("Please add items to your order")
      return
    }

    setIsPlacingOrder(true)
    try {
      // Group items by seller (following architecture)
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
      const orderPromises = Object.entries(itemsBySeller).map(([sellerId, orderItems]) =>
        ordersAPI.create({
          buyerId: user.id,
          sellerId: Number(sellerId),
          items: orderItems,
        })
      )

      await Promise.all(orderPromises)
      toast.success(`${orderPromises.length} order(s) placed successfully!`)
      setCart([])
    } catch (error: any) {
      toast.error(error.message || "Failed to place order")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.listing.priceCents * item.quantity / 100), 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buy Wholesale</h1>
          <p className="text-muted-foreground mt-1">Source fresh produce directly from Benguet farmers</p>
        </div>
        {cart.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Place Order
                </>
              )}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({cart.length}) - ₱{cartTotal.toLocaleString()}
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {productCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-teal-600 text-white"
                  : "bg-white text-muted-foreground hover:bg-teal-50 hover:text-teal-600"
              }`}
            >
              {category}
            </button>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all group"
            >
              <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
                {listing.quantity < 50 && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                    Low Stock
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{listing.product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {listing.product.description || "Fresh produce"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-600">₱{(listing.priceCents / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per kg</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.product.farmer.name}</span>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{listing.quantity}kg available</span>
                  </div>
                  <span className="text-teal-600 font-medium">
                    Min: 1kg
                  </span>
                </div>

                <Button
                  onClick={() => addToCart(listing, 1)}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={!listing.available || listing.quantity === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Order
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
    </div>
  )
}
