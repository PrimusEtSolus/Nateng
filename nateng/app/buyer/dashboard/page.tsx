"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFetch } from "@/hooks/use-fetch"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User, type Listing, type Order } from "@/lib/types"
import BannedUserDashboard from "@/components/banned-user-dashboard"
import { Search, ShoppingCart, Plus, Minus, Filter, MapPin, LayoutDashboard, Package, ClipboardList, Loader2, Trash2, ArrowRight, TrendingUp, Clock, CheckCircle, Truck } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { ProductImage } from "@/components/product-image"
import { toast } from "sonner"
import { ProductGrid } from "@/components/dashboard/ProductGrid"
import { OrderModal } from "@/components/dashboard/OrderModal"
import { StatCard } from "@/components/dashboard/StatCard"
import { formatDateWithMonth } from "@/lib/date-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type TabName = "overview" | "shop" | "cart" | "orders"

const buyerTabs = [
  { id: "overview" as TabName, label: "Overview", icon: LayoutDashboard },
  { id: "shop" as TabName, label: "Shop", icon: Search },
  { id: "cart" as TabName, label: "Cart", icon: ShoppingCart },
  { id: "orders" as TabName, label: "Orders", icon: ClipboardList },
]

function TabButton({ tab, isActive, onClick }: { tab: { id: TabName; label: string; icon: any }; isActive: boolean; onClick: () => void }) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-buyer text-white shadow-md shadow-buyer/25"
          : "text-muted-foreground hover:bg-buyer-bg hover:text-buyer"
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
    </button>
  )
}

export default function BuyerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabName>("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedCategory, setSelectedCategory] = useState("All")
const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dialogQuantity, setDialogQuantity] = useState("0.2")
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name" | "quantity">("name")
  const [filter, setFilter] = useState<string>("all")
  const { addToCart, updateQuantity, items, removeFromCart, totalPrice, clearCart } = useCart()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'buyer') {
        router.push('/login')
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [router])

  useEffect(() => {
    if (selectedListing) setDialogQuantity("0.2")
  }, [selectedListing])

  const { data: listings, loading: listingsLoading, error: listingsError } = useFetch<Listing[]>(
    debouncedSearchTerm
      ? `/api/listings?available=true&userRole=buyer&search=${encodeURIComponent(debouncedSearchTerm)}&sortBy=${sortBy}`
      : `/api/listings?available=true&userRole=buyer&sortBy=${sortBy}`
  )

  const { data: orders, loading: ordersLoading } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  const productCategories = ["All", "Vegetables", "Leafy Greens", "Root Vegetables", "Fruits"]

  const getCartQuantity = (listingId: number) => {
    const item = items.find((i) => i.listingId === listingId)
    return item?.quantity || 0
  }

  const handleAddToCart = (listing: Listing, quantity: number) => {
    const MIN_QUANTITY = 0.2
    const currentItem = items.find((i) => i.listingId === listing.id)
    const currentQuantity = currentItem?.quantity || 0
    const newTotalQuantity = currentQuantity + quantity

    if (newTotalQuantity > 0 && newTotalQuantity < MIN_QUANTITY) {
      toast.error("Minimum order required", { description: `Minimum order is ${MIN_QUANTITY}kg` })
      return
    }
    if (newTotalQuantity > listing.quantity) {
      toast.error("Insufficient stock", { description: `Only ${listing.quantity}kg available` })
      return
    }

    addToCart({
      listingId: listing.id,
      sellerId: listing.sellerId,
      productName: listing.product?.name || "Product",
      sellerName: listing.seller?.name || "Seller",
      quantity: quantity,
      priceCents: listing.priceCents,
    })

    toast.success("Added to cart", { description: `${quantity.toFixed(1)}kg of ${listing.product?.name || "Product"} added` })
  }

  const pendingOrdersCount = Array.isArray(orders) ? orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED").length : 0
  const deliveredOrdersCount = Array.isArray(orders) ? orders.filter(o => o.status === "DELIVERED").length : 0
  const totalSpent = Array.isArray(orders) ? orders.reduce((sum, o) => sum + (o.status === "DELIVERED" ? o.totalCents : 0), 0) : 0

  const filteredOrders = Array.isArray(orders) ? orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  }) || [] : []

  const deliveryFee = totalPrice >= 500 ? 0 : 50
  const grandTotal = totalPrice + deliveryFee

  return (
    <>
      {user?.isBanned && <BannedUserDashboard />}
{!user?.isBanned && (
        <>
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name?.split(" ")[0] || "Buyer"}</h1>
            <p className="text-muted-foreground mt-1">Shop farm-fresh vegetables delivered to your doorstep</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
            {buyerTabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
          </div>

          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Cart Items" value={items.length.toString()} change={`₱${totalPrice.toLocaleString()} total`} increasing={true} icon={ShoppingCart} color="bg-buyer" />
                <StatCard label="Active Orders" value={pendingOrdersCount.toString()} change={`${deliveredOrdersCount} delivered`} increasing={true} icon={Package} color="bg-blue-500" />
                <StatCard label="Total Spent" value={`₱${(totalSpent / 100).toLocaleString()}`} change="All time" increasing={true} icon={TrendingUp} color="bg-emerald-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button onClick={() => setActiveTab("shop")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-buyer-bg hover:bg-orange-100 transition-colors group">
                      <div className="p-2 bg-buyer rounded-lg group-hover:scale-105 transition-transform"><Search className="w-5 h-5 text-white" /></div>
                      <div className="text-left"><p className="font-medium text-foreground">Shop Products</p><p className="text-xs text-muted-foreground">Browse fresh produce</p></div>
                    </button>
                    <button onClick={() => setActiveTab("cart")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group">
                      <div className="p-2 bg-foreground rounded-lg group-hover:scale-105 transition-transform"><ShoppingCart className="w-5 h-5 text-white" /></div>
                      <div className="text-left"><p className="font-medium text-foreground">View Cart</p><p className="text-xs text-muted-foreground">{items.length} items</p></div>
                    </button>
                    <button onClick={() => setActiveTab("orders")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group">
                      <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-105 transition-transform"><Package className="w-5 h-5 text-white" /></div>
                      <div className="text-left"><p className="font-medium text-foreground">My Orders</p><p className="text-xs text-muted-foreground">{pendingOrdersCount} active</p></div>
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Products</h3>
                  <ProductGrid
                    items={Array.isArray(listings) ? listings.slice(0, 4) : []}
                    loading={listingsLoading}
                    onItemClick={(item) => setSelectedListing(item as Listing)}
                    emptyState={{ icon: Search, title: "No products available", description: "Check back later for fresh produce!" }}
                    variant="list"
                    title=""
                    subtitle=""
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "shop" && (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Shop</h2>
                  <p className="text-muted-foreground mt-1">Browse fresh produce from farmers</p>
                </div>
                <button onClick={() => setActiveTab("cart")}>
                  <Button className="bg-buyer hover:bg-buyer-light text-white gap-2"><ShoppingCart className="w-5 h-5" /> Cart ({items.length})</Button>
                </button>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Search fresh produce..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                    const options = ["price-asc", "price-desc", "name", "quantity"] as const
                    const currentIndex = options.indexOf(sortBy)
                    setSortBy(options[(currentIndex + 1) % options.length])
                  }}>
                    <Filter className="w-4 h-4" />
                    Sort: {sortBy === "price-asc" ? "Price ↑" : sortBy === "price-desc" ? "Price ↓" : sortBy === "name" ? "Name" : "Stock"}
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {productCategories.map((cat) => (
                    <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}
                      className={selectedCategory === cat ? "bg-buyer hover:bg-buyer-light" : ""}>{cat}</Button>
                  ))}
                </div>
              </div>
              {listingsError && (
                <EmptyState icon={ShoppingCart} title="Failed to load products" description="There was an error loading products." action={{ label: "Retry", onClick: () => window.location.reload() }} />
              )}
              <ProductGrid
                items={Array.isArray(listings) ? listings : []}
                loading={listingsLoading}
                onItemClick={(item) => setSelectedListing(item as Listing)}
                emptyState={{ icon: Search, title: debouncedSearchTerm ? "No products found" : "No products available",
                  description: debouncedSearchTerm ? `No products match "${debouncedSearchTerm}".` : "No products available. Check back later!",
                  action: debouncedSearchTerm ? { label: "Clear search", onClick: () => setSearchTerm("") } : undefined }}
                variant="cards"
                showTrustSignals={true}
                actionSlot={(item) => {
                  const listing = item as Listing
                  const cartQty = getCartQuantity(listing.id)
                  if (cartQty > 0) {
                    return (
                      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-muted-foreground/10" onClick={(e) => {
                          e.stopPropagation()
                          const nq = Math.max(0, cartQty - 0.2)
                          if (nq === 0) { updateQuantity(listing.id, 0); toast.success("Removed from cart") }
                          else if (nq >= 0.2) updateQuantity(listing.id, nq)
                          else toast.error("Minimum order is 0.2kg") }}><Minus className="w-4 h-4" /></Button>
                        <span className="text-sm font-medium px-2 min-w-12 text-center">{cartQty.toFixed(1)}kg</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-muted-foreground/10" onClick={(e) => { e.stopPropagation(); updateQuantity(listing.id, cartQty + 0.2) }}><Plus className="w-4 h-4" /></Button>
                      </div>
                    )
                  }
                  return (<Button size="sm" className="bg-buyer hover:bg-buyer-light text-white gap-1" onClick={(e) => { e.stopPropagation(); handleAddToCart(listing, 0.2) }}><Plus className="w-4 h-4" /> Add</Button>)
                }}
              />
              <Dialog open={!!selectedListing} onOpenChange={(open) => { if (!open) { setSelectedListing(null); setDialogQuantity("0.2") } }}>
                <DialogContent className="sm:max-w-2xl">
                  {selectedListing && (
                    <>
                      <DialogHeader>
                        <DialogTitle>{selectedListing.product?.name || "Product"}</DialogTitle>
                        <DialogDescription>Sold by {selectedListing.seller?.name || "Unknown"}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border overflow-hidden bg-muted h-64">
                          <ProductImage src={selectedListing.product?.imageUrl || null} alt={selectedListing.product?.name || "Product"} className="w-full h-full" />
                        </div>
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-xs uppercase text-muted-foreground tracking-wide">Seller</p>
                            <p className="font-medium">{selectedListing.seller?.name || "Unknown"}</p>
                            <p className="text-muted-foreground">Role: {selectedListing.seller?.role || "seller"}</p>
                            {selectedListing.seller?.city && selectedListing.seller?.province && (
                              <p className="text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{selectedListing.seller.city}, {selectedListing.seller.province}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground tracking-wide">Source</p>
                            <p className="font-medium">{selectedListing.product?.farmer?.name || "Unknown"}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Available</p><p className="font-semibold">{selectedListing.quantity} kg</p></div>
                            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Price</p><p className="font-semibold">₱{(selectedListing.priceCents / 100).toFixed(2)}/kg</p></div>
                          </div>
                          <p className="text-sm text-muted-foreground">{selectedListing.product?.description || "Fresh produce"}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dialog-qty">Quantity (kg)</Label>
                        <div className="flex items-center gap-2">
                          <Input id="dialog-qty" type="number" min="0.2" max={selectedListing.quantity} step="0.1" value={dialogQuantity} onChange={(e) => setDialogQuantity(e.target.value)} placeholder="0.2" className="flex-1" />
                          <span className="text-sm text-muted-foreground">kg</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum: 0.2kg • Available: {selectedListing.quantity}kg</p>
                      </div>
                      <DialogFooter className="sm:justify-between">
                        <div>
                          <p className="text-2xl font-bold text-buyer">₱{((selectedListing.priceCents / 100) * (parseFloat(dialogQuantity) || 0.2)).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">₱{(selectedListing.priceCents / 100).toFixed(2)}/kg</p>
                        </div>
                        <Button className="bg-buyer hover:bg-buyer-light text-white" onClick={() => {
                          const qty = parseFloat(dialogQuantity) || 0.2
                          if (qty < 0.2) { toast.error("Minimum order required"); return }
                          if (qty > selectedListing.quantity) { toast.error("Insufficient stock"); return }
                          handleAddToCart(selectedListing, qty)
                          setSelectedListing(null); setDialogQuantity("0.2")
                        }}><ShoppingCart className="w-4 h-4" /> Add to cart</Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "cart" && (
            <div>
              {items.length === 0 ? (
                <div className="max-w-2xl mx-auto text-center py-16">
                  <div className="w-24 h-24 bg-buyer-bg rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingCart className="w-12 h-12 text-buyer" /></div>
                  <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                  <p className="text-muted-foreground mb-6">Start shopping for fresh vegetables from Benguet farmers</p>
                  <button onClick={() => setActiveTab("shop")}><Button className="bg-buyer hover:bg-buyer-light text-white">Browse Products</Button></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
                      <p className="text-muted-foreground mt-1">{items.length} items in your cart</p>
                    </div>
                    <Button variant="outline" onClick={() => { if (confirm("Clear your cart?")) clearCart() }} className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
                      <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
                    </Button>
                  </div>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                      {items.map((item, index) => {
                        const itemId = item.listingId || index
                        const pricePerKg = item.priceCents ? item.priceCents / 100 : 0
                        const total = pricePerKg * item.quantity
                        return (
                          <div key={itemId} className="bg-white rounded-2xl border border-border p-4 shadow-sm flex gap-4">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 flex items-center justify-center"><ShoppingCart className="w-8 h-8 text-muted-foreground" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground">{item.productName || "Product"}</h3>
                                  <p className="text-sm text-muted-foreground">Sold by {item.sellerName || "Seller"}</p>
                                </div>
                                <button onClick={() => removeFromCart(itemId)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                              </div>
                              <div className="flex items-end justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent"
                                    onClick={() => { const nq = Math.max(0, item.quantity - 0.2); if (nq === 0) updateQuantity(itemId, 0); else updateQuantity(itemId, nq) }}
                                    disabled={item.quantity <= 0.2}><Minus className="w-4 h-4" /></Button>
                                  <Input type="number" min="0.2" step="0.1" value={item.quantity.toFixed(1)}
                                    onChange={(e) => { const v = parseFloat(e.target.value) || 0; if (v === 0) updateQuantity(itemId, 0); else if (v >= 0.2) updateQuantity(itemId, v) }}
                                    className="w-16 h-8 text-center text-sm font-medium" />
                                  <span className="text-xs text-muted-foreground">kg</span>
                                  <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent" onClick={() => updateQuantity(itemId, item.quantity + 0.2)}><Plus className="w-4 h-4" /></Button>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-buyer">₱{total.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">₱{pricePerKg.toFixed(2)}/kg</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div>
                      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-8">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₱{totalPrice.toLocaleString()}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery Fee</span><span className="font-medium">{deliveryFee === 0 ? "Free" : `₱${deliveryFee}`}</span></div>
                          <div className="border-t pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-bold text-buyer">₱{grandTotal.toLocaleString()}</span></div>
                        </div>
                        <Link href="/buyer/checkout"><Button className="w-full bg-buyer hover:bg-buyer-light text-white gap-2 h-12">Proceed to Checkout <ArrowRight className="w-5 h-5" /></Button></Link>
                        <p className="text-xs text-muted-foreground text-center mt-4">Free delivery on orders above ₱500</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
                <p className="text-muted-foreground mt-1">Track your orders and purchase history</p>
              </div>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[{ key: "all", label: "All Orders" }, { key: "PENDING", label: "Pending" }, { key: "CONFIRMED", label: "Confirmed" }, { key: "SHIPPED", label: "Shipped" }, { key: "DELIVERED", label: "Delivered" }].map((tab) => (
                  <Button key={tab.key} variant={filter === tab.key ? "default" : "outline"} className={filter === tab.key ? "bg-buyer hover:bg-buyer/90" : ""} onClick={() => setFilter(tab.key)}>{tab.label}</Button>
                ))}
              </div>
              {ordersLoading ? (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" /><p className="text-muted-foreground">Loading orders...</p></div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-border p-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filter !== "all" ? `No orders with status "${filter}"` : "Start shopping to place your first order!"}
                  </p>
                  {filter !== "all" && (
                    <Button variant="outline" className="mt-4" onClick={() => setFilter("all")}>
                      View all orders
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            order.status === "PENDING" ? "bg-yellow-100" :
                            order.status === "CONFIRMED" ? "bg-blue-100" :
                            order.status === "SHIPPED" ? "bg-green-100" :
                            "bg-gray-100"
                          }`}>
                            {order.status === "PENDING" ? <Clock className="w-5 h-5 text-yellow-600" /> :
                             order.status === "CONFIRMED" ? <CheckCircle className="w-5 h-5 text-blue-600" /> :
                             order.status === "SHIPPED" ? <Truck className="w-5 h-5 text-green-600" /> :
                             <Package className="w-5 h-5 text-gray-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground">{formatDateWithMonth(order.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                          order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                          order.status === "SHIPPED" ? "bg-green-100 text-green-700" :
                          order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Items</span>
                          <span className="font-medium">{order.items?.length || 0} item(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-semibold text-buyer">₱{(order.totalCents / 100).toLocaleString()}</span>
                        </div>
                        {order.seller && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Seller</span>
                            <span className="font-medium">{order.seller.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
</div>
              )}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        <OrderModal
          open={!!selectedOrder}
          onOpenChange={(open) => { if (!open) setSelectedOrder(null) }}
          order={selectedOrder}
          accentColor="bg-buyer hover:bg-buyer-light"
          managerHref="/buyer/orders"
          managerLabel="View all orders"
        />
        </>
      )}
    </>
  )}
