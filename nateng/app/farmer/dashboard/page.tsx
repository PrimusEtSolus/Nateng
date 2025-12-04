"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { formatDate } from "@/lib/date-utils"
import { productsAPI, listingsAPI, ordersAPI } from "@/lib/api-client"
import { Package, TrendingUp, Leaf, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCardSkeleton, OrderCardSkeleton } from "@/components/loading-skeletons"
import { EmptyState } from "@/components/empty-state"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Product {
  id: number
  name: string
  description: string | null
  farmerId: number
  listings: Array<{
    id: number
    quantity: number
    priceCents: number
    available: boolean
  }>
}

interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: string
  createdAt: string
  buyer: { id: number; name: string; email: string; role: string }
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
}

export default function FarmerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'farmer') {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }, [router])

  // Fetch farmer's products
  const { data: products, loading: productsLoading, refetch: refetchProducts } = useFetch<Product[]>(
    user ? `/api/products` : '',
    { skip: !user }
  )

  // Fetch farmer's listings
  const { data: listings, loading: listingsLoading } = useFetch<any[]>(
    user ? `/api/listings?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch farmer's orders (as seller)
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  const farmerProducts = products?.filter((p) => p.farmerId === user?.id) || []
  const pendingOrders = orders?.filter((o) => o.status === "PENDING") || []
  const completedOrders = orders?.filter((o) => o.status === "DELIVERED") || []
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
  const totalCrops = farmerProducts.length
  const availableStock = listings?.reduce((sum, l) => sum + (l.available ? l.quantity : 0), 0) || 0

  const stats = [
    {
      label: "Total Revenue",
      value: `₱${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      increasing: true,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      change: `${pendingOrders} new`,
      increasing: true,
      icon: Package,
      color: "bg-amber-500",
    },
    {
      label: "Active Crops",
      value: totalCrops.toString(),
      change: "2 harvested",
      increasing: false,
      icon: Leaf,
      color: "bg-green-500",
    },
    {
      label: "Available Stock",
      value: `${availableStock}kg`,
      change: "+150kg",
      increasing: true,
      icon: TrendingUp,
      color: "bg-blue-500",
    },
  ]

  const recentOrders = orders?.slice(0, 4) || []

  if (productsLoading || listingsLoading || ordersLoading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0] || "Farmer"}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your farm today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${stat.increasing ? "text-emerald-600" : "text-muted-foreground"}`}
              >
                {stat.increasing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
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
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <p className="text-sm text-muted-foreground">Latest wholesale orders from buyers</p>
            </div>
            <Link
              href="/farmer/orders"
              className="text-sm font-medium text-farmer hover:text-farmer-light transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Package}
                  title="No orders yet"
                  description="Your recent orders will appear here once buyers start placing orders."
                />
              </div>
            ) : (
              recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-farmer focus-visible:ring-offset-2 hover:translate-x-1"
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
                  <div className="w-12 h-12 bg-farmer-bg rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-farmer" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.buyer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.map((item) => `${item.listing.product.name} (${item.quantity}kg)`).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₱{(order.totalCents / 100).toLocaleString()}</p>
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
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Crop Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/farmer/crops"
                className="flex items-center gap-3 p-3 rounded-xl bg-farmer-bg hover:bg-amber-100 transition-colors group"
              >
                <div className="p-2 bg-farmer rounded-lg group-hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Add New Crop</p>
                  <p className="text-xs text-muted-foreground">List your harvest</p>
                </div>
              </Link>
              <Link
                href="/farmer/orders"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group"
              >
                <div className="p-2 bg-foreground rounded-lg group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Manage Orders</p>
                  <p className="text-xs text-muted-foreground">{pendingOrders.length} pending</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Your Products</h3>
            <div className="space-y-3">
              {farmerProducts.length === 0 ? (
                <EmptyState
                  icon={Leaf}
                  title="No products yet"
                  description="Add your first crop to start selling on NatengHub."
                  action={{
                    label: "Add Crop",
                    onClick: () => window.location.href = "/farmer/crops",
                  }}
                />
              ) : (
                farmerProducts.slice(0, 4).map((product) => {
                const productListings = listings?.filter((l) => l.productId === product.id) || []
                const totalQuantity = productListings.reduce((sum, l) => sum + (l.available ? l.quantity : 0), 0)
                const hasAvailable = productListings.some((l) => l.available && l.quantity > 0)
                
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-farmer focus-visible:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProduct(product)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedProduct(product)
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalQuantity}kg available
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hasAvailable
                          ? "bg-green-100 text-green-700"
                          : totalQuantity === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {hasAvailable ? "available" : "out of stock"}
                    </span>
                  </div>
                )
                })
              )}
            </div>
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
                <DialogTitle>Order from {selectedOrder.buyer.name}</DialogTitle>
                <DialogDescription>
                  {selectedOrder.items.map((item) => `${item.listing.product.name} (${item.quantity}kg)`).join(", ")} • Buyer: {selectedOrder.buyer.role}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <p className="font-semibold">{selectedOrder.status}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase">Total value</p>
                    <p className="font-semibold">₱{(selectedOrder.totalCents / 100).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedOrder.items.length} item{selectedOrder.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Order Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.listing.product.name} x {item.quantity}kg</span>
                        <span className="font-medium">₱{(item.priceCents * item.quantity / 100).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button asChild className="bg-farmer hover:bg-farmer/90 text-white">
                  <Link href="/farmer/orders">Open order manager</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Product details and listings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">{selectedProduct.description || "No description"}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Listings</p>
                    <p className="font-semibold">{selectedProduct.listings.length}</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Available Stock</p>
                    <p className="font-semibold">
                      {selectedProduct.listings.reduce((sum, l) => sum + (l.available ? l.quantity : 0), 0)}kg
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
                <Button asChild className="bg-farmer hover:bg-farmer/90 text-white">
                  <Link href="/farmer/crops">Go to crop manager</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
