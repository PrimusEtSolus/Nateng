"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User, type Product, type Order } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import BannedUserDashboard from "@/components/banned-user-dashboard"
import { Package, TrendingUp, Leaf, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCardSkeleton } from "@/components/loading-skeletons"
import { StatCard } from "@/components/dashboard/StatCard"
import { OrderList } from "@/components/dashboard/OrderList"
import { ProductGrid } from "@/components/dashboard/ProductGrid"
import { OrderModal } from "@/components/dashboard/OrderModal"
import { ProductModal } from "@/components/dashboard/ProductModal"

export default function FarmerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Check if user is banned and enforce restrictions
  const { banStatus, isLoading: banLoading } = useBanEnforcement()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'farmer') {
        router.push('/login')
        return
      }
      
      // Check if user is banned
      if (currentUser.isBanned) {
        // Don't load normal dashboard data for banned users
        setUser(currentUser)
        return
      }
      
      setUser(currentUser)
    }
    loadUser()
  }, [router])

  // Fetch farmer's products (filtered by farmerId on the server)
  const { data: productsResponse, loading: productsLoading, refetch: refetchProducts } = useFetch<{ products: Product[] }>(
    user ? `/api/products?farmerId=${user.id}` : '',
    { skip: !user }
  )

  const products = productsResponse?.products || null

  // Fetch farmer's listings
  const { data: listings, loading: listingsLoading } = useFetch<any[]>(
    user ? `/api/listings?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch pending orders (server-side filtered) — for the actionable Pending Orders section
  const { data: pendingOrders, loading: pendingOrdersLoading, refetch: refetchOrders } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}&status=PENDING&limit=4` : '',
    { skip: !user }
  )

  // Fetch all orders for revenue calculation (no client-side filtering needed)
  const { data: allOrders, loading: ordersLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Compute revenue from delivered + confirmed + shipped orders (using reduce, not filter)
  const totalRevenue = Array.isArray(allOrders)
    ? allOrders.reduce((sum, o) => {
        if (["CONFIRMED", "SHIPPED", "DELIVERED"].includes(o.status)) {
          return sum + o.totalCents
        }
        return sum
      }, 0) / 100
    : 0

  const deliveredRevenue = Array.isArray(allOrders)
    ? allOrders.reduce((sum, o) => {
        if (o.status === "DELIVERED") return sum + o.totalCents
        return sum
      }, 0) / 100
    : 0

  const totalCrops = Array.isArray(products) ? products.length : 0
  const availableStock = listings?.reduce((sum: number, l: any) => sum + (l.available ? l.quantity : 0), 0) || 0
  const pendingCount = Array.isArray(pendingOrders) ? pendingOrders.length : 0

  const stats = [
    {
      label: "Total Revenue",
      value: `₱${totalRevenue.toLocaleString()}`,
      change: `₱${deliveredRevenue.toLocaleString()} delivered`,
      increasing: true,
      icon: DollarSign,
      color: "bg-emerald-500",
      href: "/farmer/orders",
    },
    {
      label: "Pending Orders",
      value: pendingCount.toString(),
      change: `${pendingCount} new`,
      increasing: true,
      icon: Package,
      color: "bg-amber-500",
      href: "/farmer/orders",
    },
    {
      label: "Active Crops",
      value: totalCrops.toString(),
      change: "Growing",
      increasing: false,
      icon: Leaf,
      color: "bg-green-500",
      href: "/farmer/crops",
    },
    {
      label: "Available Stock",
      value: `${availableStock}kg`,
      change: "In listings",
      increasing: true,
      icon: TrendingUp,
      color: "bg-blue-500",
      href: "/farmer/analytics",
    },
  ]

  const isLoading = productsLoading || listingsLoading || ordersLoading || pendingOrdersLoading

  if (isLoading && !user?.isBanned) {
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
    <>
      {/* Show restricted dashboard for banned users */}
      {user?.isBanned && <BannedUserDashboard />}
      
      {/* Show normal dashboard for non-banned users */}
      {!user?.isBanned && (
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0] || "Farmer"}</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your farm today</p>
          </div>

          {/* Pending Orders (Actionable — placed at the top) */}
          <div className="mb-8">
            <OrderList
              orders={Array.isArray(pendingOrders) ? pendingOrders : []}
              loading={pendingOrdersLoading}
              onOrderClick={setSelectedOrder}
              emptyState={{
                icon: Package,
                title: "No pending orders",
                description: "You're all caught up! When buyers place orders, they'll appear here.",
              }}
              title="Pending Orders"
              subtitle="Orders waiting for your confirmation"
              viewAllHref="/farmer/orders"
              viewAllLabel="View all orders"
              accentColor="text-farmer"
              maxItems={4}
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
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
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(pendingOrders) ? pendingOrders.length : 0} pending
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                increasing={stat.increasing}
                icon={stat.icon}
                color={stat.color}
                href={stat.href}
              />
            ))}
          </div>

          {/* Products Section */}
          <div className="max-w-md">
            <ProductGrid
              items={Array.isArray(products) ? products : []}
              loading={productsLoading}
              onItemClick={(item) => setSelectedProduct(item as Product)}
              emptyState={{
                icon: Leaf,
                title: "No products yet",
                description: "Add your first crop to start selling on NatengHub.",
                action: {
                  label: "Add Crop",
                  onClick: () => router.push("/farmer/crops"),
                },
              }}
              variant="list"
              title="Your Products"
              subtitle="Manage your crops and listings"
            />
          </div>

          {/* Order Detail Modal */}
          <OrderModal
            open={!!selectedOrder}
            onOpenChange={(open) => {
              if (!open) setSelectedOrder(null)
            }}
            order={selectedOrder}
            accentColor="bg-farmer hover:bg-farmer/90"
            managerHref="/farmer/orders"
            managerLabel="Open order manager"
          />

          {/* Product Detail Modal */}
          <ProductModal
            open={!!selectedProduct}
            onOpenChange={(open) => {
              if (!open) setSelectedProduct(null)
            }}
            item={selectedProduct}
            mode="product"
            accentColor="bg-farmer hover:bg-farmer/90"
            managerHref="/farmer/crops"
            managerLabel="Go to crop manager"
          />
        </div>
      )}
    </>
  )
}