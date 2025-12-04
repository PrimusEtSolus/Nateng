"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, type User } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { ordersAPI } from "@/lib/api-client"
import { Search, ShoppingCart, MapPin, Package, Loader2, X, Plus, Minus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
      minimumOrderKg?: number | null
    }
  }
  seller: {
    id: number
    name: string
    role: string
    minimumOrderKg?: number | null
  }
}

interface CartItem {
  listing: Listing
  quantity: number
}

export default function ResellerWholesalePage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Initialize quantities with minimum order for farmers
  useEffect(() => {
    if (listings) {
      const initialQuantities: Record<number, number> = {}
      listings.forEach((listing) => {
        if (listing.seller.role === 'farmer') {
          const minOrder = listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50
          initialQuantities[listing.id] = minOrder
        } else {
          initialQuantities[listing.id] = 1
        }
      })
      setQuantities(initialQuantities)
    }
  }, [listings])

  const productCategories = ["All", "Vegetables", "Leafy Greens", "Root Vegetables", "Fruits"]

  // Fetch available listings from farmers
  const { data: listings, loading: listingsLoading } = useFetch<Listing[]>('/api/listings?available=true')

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = listing.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || true // Simplified
    return matchesSearch && matchesCategory && listing.available && listing.quantity > 0 && listing.seller.role === "farmer"
  }) || []

  const addToCart = (listing: Listing, quantity?: number) => {
    const qty = quantity || quantities[listing.id] || 1
    const minOrder = listing.seller.role === 'farmer' 
      ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50)
      : 1
    
    if (qty <= 0) {
      toast.error("Quantity must be at least 1kg")
      return
    }
    if (listing.seller.role === 'farmer' && qty < minOrder) {
      toast.error(`Minimum order is ${minOrder}kg for this farmer`)
      return
    }
    if (qty > listing.quantity) {
      toast.error(`Only ${listing.quantity}kg available`)
      return
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.listing.id === listing.id)
      if (existing) {
        const newQuantity = existing.quantity + qty
        if (newQuantity > listing.quantity) {
          toast.error(`Only ${listing.quantity}kg available`)
          return prev
        }
        return prev.map((item) => 
          item.listing.id === listing.id 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      }
      return [...prev, { listing, quantity: qty }]
    })
    setQuantities((prev) => ({ ...prev, [listing.id]: 1 }))
    toast.success("Added to cart")
  }

  const updateCartQuantity = (listingId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(listingId)
      return
    }
    setCart((prev) => {
      const item = prev.find((item) => item.listing.id === listingId)
      if (!item) return prev
      
      const minOrder = item.listing.seller.role === 'farmer' 
        ? (item.listing.seller.minimumOrderKg || item.listing.product.farmer?.minimumOrderKg || 50)
        : 1
      
      if (item.listing.seller.role === 'farmer' && newQuantity < minOrder) {
        toast.error(`Minimum order is ${minOrder}kg for this farmer`)
        return prev
      }
      if (newQuantity > item.listing.quantity) {
        toast.error(`Only ${item.listing.quantity}kg available`)
        return prev
      }
      return prev.map((item) =>
        item.listing.id === listingId
          ? { ...item, quantity: newQuantity }
          : item
      )
    })
  }

  const removeFromCart = (listingId: number) => {
    setCart((prev) => prev.filter((item) => item.listing.id !== listingId))
    toast.success("Removed from cart")
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

      if (orderPromises.length === 0) {
        throw new Error("No valid items to order")
      }

      const results = await Promise.all(orderPromises)
      const orderCount = results.length
      toast.success(`${orderCount} order(s) placed successfully!`)
      setCart([])
      setIsCartOpen(false)
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "Failed to place order"
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Failed to place order")
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
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => setIsCartOpen(true)}
            >
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
                    Min: {listing.seller.role === 'farmer' 
                      ? `${listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50}kg`
                      : '1kg'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border border-border rounded-lg flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => {
                        const currentQty = quantities[listing.id] || (listing.seller.role === 'farmer' ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50) : 1)
                        const minOrder = listing.seller.role === 'farmer' 
                          ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50)
                          : 1
                        if (currentQty > minOrder) {
                          setQuantities((prev) => ({ ...prev, [listing.id]: currentQty - 1 }))
                        }
                      }}
                      disabled={!listing.available || listing.quantity === 0 || (quantities[listing.id] || (listing.seller.role === 'farmer' ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50) : 1)) <= (listing.seller.role === 'farmer' ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50) : 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min={listing.seller.role === 'farmer' ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50) : 1}
                      max={listing.quantity}
                      step="1"
                      value={quantities[listing.id] || (listing.seller.role === 'farmer' ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50) : 1)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        const minOrder = listing.seller.role === 'farmer' 
                          ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50)
                          : 1
                        if (!isNaN(val) && val >= minOrder && val <= listing.quantity) {
                          setQuantities((prev) => ({ ...prev, [listing.id]: val }))
                        } else if (!isNaN(val) && val < minOrder) {
                          // Allow typing but show error
                          setQuantities((prev) => ({ ...prev, [listing.id]: val }))
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value)
                        const minOrder = listing.seller.role === 'farmer' 
                          ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50)
                          : 1
                        if (isNaN(val) || val < minOrder) {
                          setQuantities((prev) => ({ ...prev, [listing.id]: minOrder }))
                          toast.error(`Minimum order is ${minOrder}kg`)
                        } else if (val > listing.quantity) {
                          setQuantities((prev) => ({ ...prev, [listing.id]: listing.quantity }))
                          toast.error(`Only ${listing.quantity}kg available`)
                        }
                      }}
                      className="w-20 h-9 text-center border-0 focus-visible:ring-2 focus-visible:ring-teal-500"
                      disabled={!listing.available || listing.quantity === 0}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => {
                        const currentQty = quantities[listing.id] || (listing.seller.role === 'farmer' ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50) : 1)
                        if (currentQty < listing.quantity) {
                          setQuantities((prev) => ({ ...prev, [listing.id]: currentQty + 1 }))
                        }
                      }}
                      disabled={!listing.available || listing.quantity === 0 || (quantities[listing.id] || (listing.seller.role === 'farmer' ? (listing.seller.minimumOrderKg || listing.product.farmer?.minimumOrderKg || 50) : 1)) >= listing.quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => addToCart(listing)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    disabled={!listing.available || listing.quantity === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
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

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Order Cart</DialogTitle>
            <DialogDescription>
              Review and manage items before placing your wholesale order
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.listing.id}
                  className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/30"
                >
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">{item.listing.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.listing.product.farmer.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ₱{(item.listing.priceCents / 100).toFixed(2)}/kg • {item.listing.quantity}kg available
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(item.listing.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.listing.quantity}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val) && val >= 0) {
                            updateCartQuantity(item.listing.id, val)
                          }
                        }}
                        className="w-20 h-8 text-center border-0 focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(item.listing.id, item.quantity + 1)}
                        disabled={item.quantity >= item.listing.quantity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-semibold text-foreground">
                        ₱{((item.listing.priceCents * item.quantity) / 100).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.listing.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-teal-600">₱{cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </Button>
            {cart.length > 0 && (
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={async () => {
                  setIsCartOpen(false)
                  await handlePlaceOrder()
                }}
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
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
