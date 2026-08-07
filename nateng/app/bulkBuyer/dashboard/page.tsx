"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User, type Listing, type Order } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Package, TrendingUp, ShoppingBag, DollarSign, Store, LayoutDashboard, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/dashboard/StatCard"
import { OrderList } from "@/components/dashboard/OrderList"
import { ProductGrid } from "@/components/dashboard/ProductGrid"
import { OrderModal } from "@/components/dashboard/OrderModal"
import { ProductModal } from "@/components/dashboard/ProductModal"
import { useDebounce } from "@/hooks/use-debounce"

type TabName = "overview" | "wholesale" | "inventory" | "orders"

const bulkBuyerTabs = [
  { id: "overview" as TabName, label: "Overview", icon: LayoutDashboard },
  { id: "wholesale" as TabName, label: "Buy Wholesale", icon: ShoppingBag },
  { id: "inventory" as TabName, label: "My Inventory", icon: Store },
  { id: "orders" as TabName, label: "Orders", icon: Package },
]

function TabButton({ tab, isActive, onClick }: { tab: { id: TabName; label: string; icon: any }; isActive: boolean; onClick: () => void }) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25"
          : "text-muted-foreground hover:bg-teal-50 hover:text-teal-700"
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
    </button>
  )
}

export default function BulkBuyerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabName>("overview")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
// Check if user is banned and enforce restrictions
  useBanEnforcement()

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
const { data: orders = [], loading: ordersLoading } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch available listings (for wholesale browsing)
  const { data: listings = [], loading: listingsLoading } = useFetch<Listing[]>(
    debouncedSearchTerm
      ? `/api/listings?available=true&userRole=bulkBuyer&search=${encodeURIComponent(debouncedSearchTerm)}`
      : '/api/listings?available=true&userRole=bulkBuyer&limit=50'
  )

  // Fetch sales as seller
const { data: salesOrders = [] } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch my inventory (my listings as seller)
  const { data: myListings = [], loading: myListingsLoading } = useFetch<Listing[]>(
    user ? `/api/listings?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Data already server-side filtered via the API call above (search param passed in URL)

  // Compute procurement stats
  const pendingOrders = Array.isArray(orders)
    ? orders.reduce((count, o) => count + (o.status === "PENDING" || o.status === "CONFIRMED" ? 1 : 0), 0)
    : 0

  const totalSpent = Array.isArray(orders)
    ? orders.reduce((sum, o) => sum + (o.status === "DELIVERED" ? o.totalCents : 0), 0)
    : 0

  const totalSales = Array.isArray(salesOrders)
    ? salesOrders.reduce((sum, o) => sum + (o.status === "DELIVERED" ? o.totalCents : 0), 0)
    : 0

  const procurementStats = [
    { label: "Total Spent", value: `₱${(totalSpent / 100).toLocaleString()}`, change: `${pendingOrders} pending orders`, increasing: true, icon: DollarSign, color: "bg-emerald-500" },
    { label: "Active Orders", value: pendingOrders.toString(), change: "From farmers", increasing: true, icon: Package, color: "bg-blue-500" },
  ]

  const salesStats = [
    { label: "Total Sales", value: `₱${(totalSales / 100).toLocaleString()}`, change: "As seller", increasing: true, icon: TrendingUp, color: "bg-teal-500" },
    { label: "Inventory Items", value: (Array.isArray(myListings) ? myListings.length : 0).toString(), change: "For retail", increasing: true, icon: Store, color: "bg-purple-500" },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.businessName || user?.name?.split(" ")[0] || "Bulk Buyer"}</h1>
        <p className="text-muted-foreground mt-1">Buy wholesale from farmers and manage your retail inventory</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
        {bulkBuyerTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === "overview" && (
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg"><ShoppingBag className="w-5 h-5 text-emerald-700" /></div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Procurement Dashboard</h2>
                <p className="text-sm text-muted-foreground">Your wholesale purchases from farmers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {procurementStats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} increasing={stat.increasing} icon={stat.icon} color={stat.color} />
              ))}
            </div>
            <OrderList
              orders={Array.isArray(orders) ? orders : []}
              loading={ordersLoading}
              onOrderClick={setSelectedOrder}
              emptyState={{ icon: Package, title: "No orders yet", description: "Your wholesale orders from farmers will appear here." }}
              title="My Wholesale Orders"
              subtitle="Track your bulk purchases from farmers"
              viewAllHref="/bulkBuyer/orders"
              viewAllLabel="View all"
              accentColor="text-teal-700"
              maxItems={4}
            />
          </section>

          <div className="border-t border-border" />

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg"><Store className="w-5 h-5 text-teal-700" /></div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Retail Sales Dashboard</h2>
                <p className="text-sm text-muted-foreground">Your retail sales to buyers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {salesStats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} increasing={stat.increasing} icon={stat.icon} color={stat.color} />
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setActiveTab("wholesale")} className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors group">
                  <div className="p-2 bg-teal-500 rounded-lg group-hover:scale-105 transition-transform"><ShoppingBag className="w-5 h-5 text-white" /></div>
                  <div><p className="font-medium text-foreground">Buy Wholesale</p><p className="text-xs text-muted-foreground">Get stock from farmers</p></div>
                </button>
                <button onClick={() => setActiveTab("inventory")} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group">
                  <div className="p-2 bg-foreground rounded-lg group-hover:scale-105 transition-transform"><Store className="w-5 h-5 text-white" /></div>
                  <div><p className="font-medium text-foreground">Manage Inventory</p><p className="text-xs text-muted-foreground">Set retail prices</p></div>
                </button>
                <button onClick={() => setActiveTab("orders")} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group">
                  <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-105 transition-transform"><TrendingUp className="w-5 h-5 text-white" /></div>
                  <div><p className="font-medium text-foreground">View Orders</p><p className="text-xs text-muted-foreground">Track your orders</p></div>
                </button>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Fresh Wholesale</h2>
                <p className="text-sm text-muted-foreground">Discover available produce from farmers</p>
              </div>
              <button onClick={() => setActiveTab("wholesale")}>
                <Button variant="outline" className="gap-2"><ShoppingBag className="w-4 h-4" /> Browse All</Button>
              </button>
            </div>
            <ProductGrid
              items={Array.isArray(listings) ? listings.slice(0, 8) : []}
              loading={listingsLoading}
              onItemClick={(item) => setSelectedListing(item as Listing)}
              emptyState={{ icon: ShoppingBag, title: "No products available", description: "There are no wholesale products available at the moment." }}
              variant="list"
              title="Available Wholesale Products"
              subtitle="Fresh produce directly from farmers"
            />
          </section>
        </div>
      )}

      {/* ===== BUY WHOLESALE TAB ===== */}
      {activeTab === "wholesale" && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Buy Wholesale</h2>
            <p className="text-muted-foreground mt-1">Purchase fresh produce from farmers in bulk</p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            {debouncedSearchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {Array.isArray(listings) ? listings.length : 0} result{Array.isArray(listings) && listings.length !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
              </p>
            )}
          </div>

          {listingsLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" /><p className="text-muted-foreground">Loading products...</p></div>
          ) : !Array.isArray(listings) || listings.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{debouncedSearchTerm ? `No products match "${debouncedSearchTerm}". Try a different search term.` : "No products available for wholesale purchase"}</p>
              {debouncedSearchTerm && <button onClick={() => setSearchTerm("")} className="mt-4 text-teal-600 hover:text-teal-700 underline">Clear search</button>}
            </div>
) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{listing.product?.name || "Product"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">From {listing.product?.farmer?.name || listing.seller?.name || "Unknown"}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-teal-600">₱{(listing.priceCents / 100).toFixed(2)}/kg</p>
                      <p className="text-xs text-muted-foreground">{listing.quantity}kg available</p>
                    </div>
                    <Link href={`/bulkBuyer/browse/${listing.id}`}>
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">View</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== MY INVENTORY TAB ===== */}
      {activeTab === "inventory" && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">My Inventory</h2>
            <p className="text-muted-foreground mt-1">Products available for retail sale</p>
          </div>

          {myListingsLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" /><p className="text-muted-foreground">Loading inventory...</p></div>
          ) : (myListings || []).length === 0 ? (
            <div className="p-8 text-center">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No inventory yet. Buy wholesale to get started!</p>
              <button onClick={() => setActiveTab("wholesale")} className="mt-4 text-teal-600 hover:text-teal-700 underline">Browse wholesale products</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(myListings || []).map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{listing.product?.name || "Product"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{listing.quantity}kg available</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-teal-600">₱{(listing.priceCents / 100).toFixed(2)}/kg</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${listing.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {listing.available ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ORDERS TAB ===== */}
      {activeTab === "orders" && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">My Wholesale Orders</h2>
            <p className="text-muted-foreground mt-1">Track your bulk purchases from farmers</p>
          </div>

          {ordersLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" /><p className="text-muted-foreground">Loading orders...</p></div>
          ) : (orders || []).length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No wholesale orders yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {(orders || []).map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium">{order.items?.map((item) => item.listing?.product?.name || "Product").join(", ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0)}kg from {order.seller?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₱{(order.totalCents / 100).toLocaleString()}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                        order.status === "SHIPPED" ? "bg-green-100 text-green-700" :
                        order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderModal open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null) }} order={selectedOrder} accentColor="bg-teal-600 hover:bg-teal-700" managerHref="/bulkBuyer/orders" managerLabel="View all orders" />

      {/* Listing Detail Modal */}
      <ProductModal open={!!selectedListing} onOpenChange={(open) => { if (!open) setSelectedListing(null) }} item={selectedListing} mode="listing" accentColor="bg-teal-600 hover:bg-teal-700" managerHref="/bulkBuyer/browse" managerLabel="Browse full catalog" />
    </div>
  )
}
