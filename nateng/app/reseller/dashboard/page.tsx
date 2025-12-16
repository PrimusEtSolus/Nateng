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
  scheduledDate?: string | null
  scheduledTime?: string | null
  route?: string | null
  isCBD?: boolean | null
  truckWeightKg?: number | null
  deliveryAddress?: string | null
  isExempt?: boolean | null
  exemptionType?: string | null
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

export default function ResellerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<Listing | null>(null)
  const [selectedWholesaleOrder, setSelectedWholesaleOrder] = useState<Order | null>(null)
  
  // Check if user is banned and enforce restrictions
  const { banStatus, isLoading: banLoading } = useBanEnforcement()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'reseller') {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }, [router])

  // Fetch reseller's listings (inventory)
  const { data: myListings, loading: listingsLoading } = useFetch<Listing[]>(
    user ? `/api/listings?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch available farmer products for wholesale ordering (like business users)
  const { data: availableListings, loading: availableListingsLoading } = useFetch<Listing[]>(
    '/api/listings?available=true&userRole=reseller'
  )

  // Fetch reseller's orders (as buyer - wholesale orders from farmers)
  const { data: wholesaleOrders, loading: ordersLoading } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch reseller's sales (as seller - orders from buyers)
  const { data: salesOrders, loading: salesLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  const pendingOrders = Array.isArray(wholesaleOrders) ? wholesaleOrders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length || 0 : 0
  const totalSpent = Array.isArray(wholesaleOrders) ? wholesaleOrders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + o.totalCents, 0) || 0 : 0
  const totalSales = Array.isArray(salesOrders) ? salesOrders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + o.totalCents, 0) || 0 : 0

  const stats = [
    {
      label: "Total Revenue",
      value: `₱${(totalSales / 100).toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Products Listed",
      value: (myListings?.length || 0).toString(),
      change: "In stock",
      icon: Store,
      color: "bg-teal-500",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      change: "From farmers",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Customers",
      value: "48",
      change: "+5 this week",
      icon: Users,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name?.split(" ")[0] || "Reseller"}</h1>
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
        {/* My Inventory */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My Inventory</h2>
              <p className="text-sm text-muted-foreground">Products available for retail sale</p>
            </div>
            <Link
              href="/reseller/inventory"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Manage all
            </Link>
          </div>
          {listingsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-muted-foreground mx-auto animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myListings?.slice(0, 4).map((listing) => (
                <div
                  key={listing.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedInventoryItem(listing)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedInventoryItem(listing)
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{listing.product.name}</p>
                      <p className="text-sm text-muted-foreground">{listing.quantity}kg available</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₱{(listing.priceCents / 100).toFixed(2)}/kg</p>
                    <p className="text-sm text-muted-foreground">{listing.available ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              ))}
              {(!myListings || myListings.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No inventory yet. Buy wholesale to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions & Wholesale */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/reseller/wholesale"
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
                href="/reseller/inventory"
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
                href="/reseller/sales"
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

          {/* Pending Wholesale Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Wholesale Orders</h3>
            {ordersLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 text-muted-foreground mx-auto animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {wholesaleOrders?.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedWholesaleOrder(order)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedWholesaleOrder(order)
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {order.items.map((item) => item.listing.product.name).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}kg from {order.seller.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                ))}
                {(!wholesaleOrders || wholesaleOrders.length === 0) && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>No wholesale orders yet</p>
                  </div>
                )}
              </div>
            )}
            <Link
              href="/reseller/orders"
              className="block text-center text-sm font-medium text-teal-600 mt-4 hover:text-teal-700"
            >
              View all orders
            </Link>
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedInventoryItem}
        onOpenChange={(open) => {
          if (!open) setSelectedInventoryItem(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          {selectedInventoryItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedInventoryItem.product.name}</DialogTitle>
                <DialogDescription>
                  Retail listing • sourced from {selectedInventoryItem.product.farmer.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border overflow-hidden bg-muted flex items-center justify-center h-64">
                  <Package className="w-24 h-24 text-muted-foreground" />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available</span>
                    <strong>{selectedInventoryItem.quantity} kg</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price (kg)</span>
                    <strong>₱{(selectedInventoryItem.priceCents / 100).toFixed(2)}</strong>
                  </div>
                  <p className="text-muted-foreground">{selectedInventoryItem.product.description || "Fresh produce"}</p>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Source farmer</p>
                    <p className="font-semibold">{selectedInventoryItem.product.farmer.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedInventoryItem.product.farmer.email}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedInventoryItem(null)}>
                  Close
                </Button>
                <Button asChild className="bg-teal-600 hover:bg-teal-500 text-white">
                  <Link href="/reseller/inventory">Manage inventory</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedWholesaleOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedWholesaleOrder(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedWholesaleOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Wholesale Order #{selectedWholesaleOrder.id}</DialogTitle>
                <DialogDescription>
                  {selectedWholesaleOrder.items.map((item) => item.listing?.product?.name || 'Unknown').join(", ")} from {selectedWholesaleOrder.seller?.name || 'Unknown Seller'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Total Quantity</p>
                    <p className="font-semibold">
                      {selectedWholesaleOrder.items.reduce((sum, item) => sum + item.quantity, 0)}kg
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Total</p>
                    <p className="font-semibold">₱{(selectedWholesaleOrder.totalCents / 100).toLocaleString()}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs uppercase text-muted-foreground mb-2">Items</p>
                  {selectedWholesaleOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.listing?.product?.name || 'Unknown Product'} x {item.quantity || 0}kg</span>
                      <span>₱{((item.priceCents || 0) * (item.quantity || 0) / 100).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedWholesaleOrder(null)}>
                  Close
                </Button>
                <Button asChild className="bg-teal-600 hover:bg-teal-500 text-white">
                  <Link href="/reseller/orders">View full order</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
