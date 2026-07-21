"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Package, TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, Store, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: string
  createdAt: string
  items: Array<{
    id: number
    quantity: number
    priceCents: number
    listing: {
      id: number
      product: {
        id: number
        name: string
      }
    }
  }>
  buyer?: {
    id: number
    name: string
    email: string
    role: string
  } | null
  seller: {
    id: number
    name: string
    email?: string
    role?: string
  }
}

export default function BulkBuyerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  
  // Check if user is banned and enforce restrictions
  const { banStatus, isLoading: banLoading } = useBanEnforcement()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'bulkBuyer') {
        router.push('/login')
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [router])

  // Fetch orders for the logged-in bulk buyer user (as buyer)
  const { data: orders = [], loading: ordersLoading, error: ordersError } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch available listings (for "Fresh Wholesale" section) - filtered for bulk buyers
  const { data: listings = [], loading: listingsLoading } = useFetch<Listing[]>(
    '/api/listings?available=true&userRole=bulkBuyer'
  )

  // Fetch sales (as seller - orders from buyers)
  const { data: salesOrders = [], loading: salesLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  const pendingOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length || 0 : 0
  const totalSpent = Array.isArray(orders) ? orders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + o.totalCents, 0) || 0 : 0
  const totalSales = Array.isArray(salesOrders) ? salesOrders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + o.totalCents, 0) || 0 : 0

  const stats = [
    {
      label: "Total Spent",
      value: `₱${(totalSpent / 100).toLocaleString()}`,
      change: `${pendingOrders} pending orders`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Active Orders",
      value: pendingOrders.toString(),
      change: "From farmers",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Total Sales",
      value: `₱${(totalSales / 100).toLocaleString()}`,
      change: "As seller",
      icon: TrendingUp,
      color: "bg-teal-500",
    },
    {
      label: "Products Available",
      value: (listings?.length || 0).toString(),
      change: "For purchase",
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name?.split(" ")[0] || "Bulk Buyer"}</h1>
        <p className="text-muted-foreground mt-1">Buy wholesale from farmers and manage your retail inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
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
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My Wholesale Orders</h2>
              <p className="text-sm text-muted-foreground">Track your bulk purchases from farmers</p>
            </div>
            <Link
              href="/bulkBuyer/orders"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
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
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
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
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-teal-600" />
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
                href="/bulkBuyer/browse"
                className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors group"
              >
                <div className="p-2 bg-teal-500 rounded-lg group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Buy Wholesale</p>
                  <p className="text-xs text-muted-foreground">Get stock from farmers</p>
                </div>
              </Link>
              <Link
                href="/bulkBuyer/inventory"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group"
              >
                <div className="p-2 bg-foreground rounded-lg group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Manage Inventory</p>
                  <p className="text-xs text-muted-foreground">Set retail prices</p>
                </div>
              </Link>
              <Link
                href="/bulkBuyer/sales"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group"
              >
                <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">View Sales</p>
                  <p className="text-xs text-muted-foreground">Track your earnings</p>
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
                        className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
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
                        <p className="font-semibold text-sm text-teal-600">
                          ₱{((listing.priceCents || 0) / 100).toLocaleString()}/kg
                        </p>
                      </div>
                    )
                  })}
                </div>
                <Link
                  href="/bulkBuyer/browse"
                  className="block text-center text-sm font-medium text-teal-600 mt-4 hover:text-teal-700"
                >
                  View all products
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}