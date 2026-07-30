"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User, type Listing, type Order } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Package, TrendingUp, ShoppingBag, DollarSign, Store, Leaf, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/StatCard"
import { OrderList } from "@/components/dashboard/OrderList"
import { ProductGrid } from "@/components/dashboard/ProductGrid"
import { OrderModal } from "@/components/dashboard/OrderModal"
import { ProductModal } from "@/components/dashboard/ProductModal"

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

  // Fetch orders as buyer (procurement)
  const { data: orders = [], loading: ordersLoading, error: ordersError } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch available listings (for "Fresh Wholesale" section) — expanded with limit=8
  const { data: listings = [], loading: listingsLoading } = useFetch<Listing[]>(
    '/api/listings?available=true&userRole=bulkBuyer&limit=8'
  )

  // Fetch sales as seller
  const { data: salesOrders = [], loading: salesLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Compute procurement stats using reduce (no filter)
  const pendingOrders = Array.isArray(orders)
    ? orders.reduce((count, o) => count + (o.status === "PENDING" || o.status === "CONFIRMED" ? 1 : 0), 0)
    : 0

  const totalSpent = Array.isArray(orders)
    ? orders.reduce((sum, o) => sum + (o.status === "DELIVERED" ? o.totalCents : 0), 0)
    : 0

  // Compute sales stats using reduce (no filter)
  const totalSales = Array.isArray(salesOrders)
    ? salesOrders.reduce((sum, o) => sum + (o.status === "DELIVERED" ? o.totalCents : 0), 0)
    : 0

  // Procurement stats (buying context)
  const procurementStats = [
    {
      label: "Total Spent",
      value: `₱${(totalSpent / 100).toLocaleString()}`,
      change: `${pendingOrders} pending orders`,
      increasing: true,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Active Orders",
      value: pendingOrders.toString(),
      change: "From farmers",
      increasing: true,
      icon: Package,
      color: "bg-blue-500",
    },
  ]

  // Sales stats (selling context)
  const salesStats = [
    {
      label: "Total Sales",
      value: `₱${(totalSales / 100).toLocaleString()}`,
      change: "As seller",
      increasing: true,
      icon: TrendingUp,
      color: "bg-teal-500",
    },
    {
      label: "Products Available",
      value: (Array.isArray(listings) ? listings.length : 0).toString(),
      change: "For purchase",
      increasing: true,
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name?.split(" ")[0] || "Bulk Buyer"}</h1>
        <p className="text-muted-foreground mt-1">Buy wholesale from farmers and manage your retail inventory</p>
      </div>

      {/* ===== PROCUREMENT DASHBOARD (Buying Context) ===== */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Procurement Dashboard</h2>
            <p className="text-sm text-muted-foreground">Your wholesale purchases from farmers</p>
          </div>
        </div>

        {/* Procurement Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {procurementStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              increasing={stat.increasing}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Wholesale Orders */}
        <OrderList
          orders={Array.isArray(orders) ? orders : []}
          loading={ordersLoading}
          onOrderClick={setSelectedOrder}
          emptyState={{
            icon: Package,
            title: "No orders yet",
            description: "Your wholesale orders from farmers will appear here.",
          }}
          title="My Wholesale Orders"
          subtitle="Track your bulk purchases from farmers"
          viewAllHref="/bulkBuyer/orders"
          viewAllLabel="View all"
          accentColor="text-teal-700"
          maxItems={4}
        />
      </section>

      {/* Visual separator */}
      <div className="border-t border-border" />

      {/* ===== SALES DASHBOARD (Selling Context) ===== */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Store className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Retail Sales Dashboard</h2>
            <p className="text-sm text-muted-foreground">Your retail sales to buyers</p>
          </div>
        </div>

        {/* Sales Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {salesStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              increasing={stat.increasing}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Quick Actions for Selling */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
      </section>

      {/* Visual separator */}
      <div className="border-t border-border" />

      {/* ===== FRESH WHOLESALE SECTION (Full-width, expanded) ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Fresh Wholesale</h2>
            <p className="text-sm text-muted-foreground">Discover available produce from farmers</p>
          </div>
          <Link href="/bulkBuyer/browse">
            <Button variant="outline" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Browse All
            </Button>
          </Link>
        </div>

        <ProductGrid
          items={Array.isArray(listings) ? listings : []}
          loading={listingsLoading}
          onItemClick={(item) => setSelectedListing(item as Listing)}
          emptyState={{
            icon: ShoppingBag,
            title: "No products available",
            description: "There are no wholesale products available at the moment. Check back later!",
          }}
          variant="list"
          title="Available Wholesale Products"
          subtitle="Fresh produce directly from farmers"
        />
      </section>

      {/* Order Detail Modal */}
      <OrderModal
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
        order={selectedOrder}
        accentColor="bg-teal-600 hover:bg-teal-700"
        managerHref="/bulkBuyer/orders"
        managerLabel="View all orders"
      />

      {/* Listing Detail Modal */}
      <ProductModal
        open={!!selectedListing}
        onOpenChange={(open) => {
          if (!open) setSelectedListing(null)
        }}
        item={selectedListing}
        mode="listing"
        accentColor="bg-teal-600 hover:bg-teal-700"
        managerHref="/bulkBuyer/browse"
        managerLabel="Browse full catalog"
      />
    </div>
  )
}