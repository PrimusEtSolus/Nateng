"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { ordersAPI, listingsAPI } from "@/lib/api-client"
import type { Order, Listing } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { Package, TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BusinessDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  // Fetch orders for the logged-in business user
  const { data: orders = [], loading: ordersLoading, error: ordersError } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch available listings (for "Fresh Wholesale" section)
  const { data: listings = [], loading: listingsLoading } = useFetch<Listing[]>(
    '/api/listings?available=true'
  )

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'business') {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }, [router])

  // Calculate stats from real data
  const ordersData = orders || []
  const completedOrders = ordersData.filter((o) => o.status === "DELIVERED")
  const pendingOrders = ordersData.filter((o) => 
    o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "SHIPPED"
  )
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.totalCents || 0), 0) / 100
  const totalOrders = ordersData.length
  
  // Get unique suppliers (sellers) from orders
  const uniqueSuppliers = new Set(ordersData.map((o) => o.sellerId))
  const supplierCount = uniqueSuppliers.size

  const stats = [
    {
      label: "Total Spent",
      value: `₱${totalSpent.toLocaleString()}`,
      change: totalOrders > 0 ? `${completedOrders.length} completed` : "No orders yet",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Active Orders",
      value: pendingOrders.length.toString(),
      change: pendingOrders.length > 0 ? `${pendingOrders.length} in progress` : "No active orders",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Products Sourced",
      value: totalOrders.toString(),
      change: totalOrders > 0 ? "All time" : "Start ordering",
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
    {
      label: "Suppliers",
      value: supplierCount.toString(),
      change: supplierCount > 0 ? `${supplierCount} ${supplierCount === 1 ? 'supplier' : 'suppliers'}` : "No suppliers yet",
      icon: TrendingUp,
      color: "bg-cyan-500",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.businessName || "Business"}</h1>
        <p className="text-muted-foreground mt-1">
          Source fresh produce for your business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={
              stat.label === "Total Spent" || stat.label === "Active Orders"
                ? "/business/orders"
                : stat.label === "Products Sourced"
                ? "/business/browse"
                : "/business/settings"
            }
            className="group"
          >
            <div
              className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer focus-visible:ring-2 focus-visible:ring-business focus-visible:ring-offset-2"
            >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My Orders</h2>
              <p className="text-sm text-muted-foreground">Track your wholesale purchases</p>
            </div>
            <Link
              href="/business/orders"
              className="text-sm font-medium text-business hover:text-business-light transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {ordersLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : (orders || []).length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              (orders || []).slice(0, 4).map((order) => {
                const firstItem = order.items?.[0]
                const productName = firstItem?.listing?.product?.name || "Order"
                const sellerName = order.seller?.name || "Unknown"
                const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
                
                return (
                  <div
                    key={order.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-business focus-visible:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedOrder(order)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedOrder(order)
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-business-bg rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-business" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{productName}</p>
                        <p className="text-sm text-muted-foreground">
                          from {sellerName} - {totalQuantity}kg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₱{((order.totalCents || 0) / 100).toLocaleString()}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "SHIPPED"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {order.status}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Quick Actions & Available Products */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/business/browse"
                className="flex items-center gap-3 p-3 rounded-xl bg-business-bg hover:bg-cyan-100 transition-colors group"
              >
                <div className="p-2 bg-business rounded-lg group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Browse Products</p>
                  <p className="text-xs text-muted-foreground">Find wholesale deals</p>
                </div>
              </Link>
              <Link
                href="/business/orders"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group"
              >
                <div className="p-2 bg-foreground rounded-lg group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Track Orders</p>
                  <p className="text-xs text-muted-foreground">{pendingOrders.length} in progress</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Available Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Fresh Wholesale</h3>
            {listingsLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-xs text-muted-foreground">Loading products...</p>
              </div>
            ) : (listings || []).length === 0 ? (
              <div className="p-4 text-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No products available</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {(listings || []).slice(0, 4).map((listing) => {
                    const product = listing.product
                    const minOrder = 1
                    
                    return (
                      <div
                        key={listing.id}
                        className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-business focus-visible:ring-offset-2"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedListing(listing)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setSelectedListing(listing)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product?.name || "Product"}</p>
                            <p className="text-xs text-muted-foreground">
                              Min: {minOrder}kg
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm text-business">
                          ₱{((listing.priceCents || 0) / 100).toLocaleString()}/kg
                        </p>
                      </div>
                    )
                  })}
                </div>
                <Link
                  href="/business/browse"
                  className="block text-center text-sm font-medium text-business mt-4 hover:text-business-light"
                >
                  View all products
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  {selectedOrder.items?.length || 0} item(s) from {selectedOrder.seller?.name || "Unknown"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase">Supplier</p>
                    <p className="font-semibold">{selectedOrder.seller?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <p className="font-semibold capitalize">{selectedOrder.status}</p>
                    <p className="text-xs text-muted-foreground">
                      Total ₱{((selectedOrder.totalCents || 0) / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.listing?.product?.name || "Product"} × {item.quantity}kg
                        </span>
                        <span className="font-medium">
                          ₱{((item.priceCents || 0) * (item.quantity || 0) / 100).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button asChild className="bg-business hover:bg-business-light text-white">
                  <Link href="/business/orders">Go to order tracker</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedListing}
        onOpenChange={(open) => {
          if (!open) setSelectedListing(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.product?.name || "Product"}</DialogTitle>
                <DialogDescription>
                  From {selectedListing.seller?.name || "Unknown"} • Minimum order 1kg
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border overflow-hidden bg-muted flex items-center justify-center h-32">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available</span>
                    <strong>{selectedListing.quantity}kg</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <strong>₱{((selectedListing.priceCents || 0) / 100).toLocaleString()}/kg</strong>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {selectedListing.product?.description || "No description available"}
                  </p>
                </div>
              </div>

              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedListing(null)}>
                  Close
                </Button>
                <Button asChild className="bg-business hover:bg-business-light text-white">
                  <Link href="/business/browse">Start wholesale request</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
