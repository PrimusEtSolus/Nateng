"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User, type Product, type Order } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import BannedUserDashboard from "@/components/banned-user-dashboard"
import { Package, TrendingUp, Leaf, DollarSign, BarChart3, LayoutDashboard, Clock, Check, Truck, Loader2, Search, Edit2, Trash2, Plus, X, Building2, UserIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatCardSkeleton } from "@/components/loading-skeletons"
import { StatCard } from "@/components/dashboard/StatCard"
import { OrderList } from "@/components/dashboard/OrderList"
import { ProductGrid } from "@/components/dashboard/ProductGrid"
import { OrderModal } from "@/components/dashboard/OrderModal"
import { ProductModal } from "@/components/dashboard/ProductModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { productsAPI, listingsAPI } from "@/lib/api-client"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"

type TabName = "overview" | "crops" | "orders" | "analytics"

const farmerTabs = [
  { id: "overview" as TabName, label: "Overview", icon: LayoutDashboard },
  { id: "crops" as TabName, label: "My Crops", icon: Leaf },
  { id: "orders" as TabName, label: "Orders", icon: Package },
  { id: "analytics" as TabName, label: "Analytics", icon: BarChart3 },
]

// Reusable tab button component
function TabButton({ tab, isActive, onClick }: { tab: { id: TabName; label: string; icon: any }; isActive: boolean; onClick: () => void }) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-farmer text-white shadow-md shadow-farmer/25"
          : "text-muted-foreground hover:bg-farmer-bg hover:text-farmer"
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
    </button>
  )
}

export default function FarmerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabName>("overview")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
// Check if user is banned and enforce restrictions
  useBanEnforcement()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'farmer') {
        router.push('/login')
        return
      }
      
      // Check if user is banned
      if (currentUser.isBanned) {
        setUser(currentUser)
        return
      }
      
      setUser(currentUser)
    }
    loadUser()
  }, [router])

  // Fetch farmer's products
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

  // Fetch pending orders
  const { data: pendingOrders, loading: pendingOrdersLoading, refetch: refetchOrders } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}&status=PENDING&limit=4` : '',
    { skip: !user }
  )

  // Fetch completed orders (CONFIRMED,SHIPPED,DELIVERED) server-side for revenue
  const { data: completedOrders, loading: completedOrdersLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}&status=CONFIRMED,SHIPPED,DELIVERED` : '',
    { skip: !user }
  )

  // Fetch all orders for orders tab kanban display - use server-side status filtering
const { data: pendingOrdersFull } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}&status=PENDING` : '',
    { skip: !user }
  )
  const { data: confirmedOrders } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}&status=CONFIRMED` : '',
    { skip: !user }
  )
  const { data: shippedOrders } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}&status=SHIPPED` : '',
    { skip: !user }
  )
  const { data: deliveredOrders } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}&status=DELIVERED` : '',
    { skip: !user }
  )

  // Compute overview stats from server-filtered data
  const totalRevenue = Array.isArray(completedOrders)
    ? completedOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
    : 0

  const deliveredRevenueTotal = Array.isArray(deliveredOrders)
    ? deliveredOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
    : 0

  const totalCrops = Array.isArray(products) ? products.length : 0
  const availableStock = listings?.reduce((sum: number, l: any) => sum + (l.available ? l.quantity : 0), 0) || 0
  const pendingCount = Array.isArray(pendingOrders) ? pendingOrders.length : 0

  const stats = [
    { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, change: `₱${deliveredRevenueTotal.toLocaleString()} delivered`, increasing: true, icon: DollarSign, color: "bg-emerald-500", href: "/farmer/orders" },
    { label: "Pending Orders", value: pendingCount.toString(), change: `${pendingCount} new`, increasing: true, icon: Package, color: "bg-amber-500", href: "/farmer/orders" },
    { label: "Active Crops", value: totalCrops.toString(), change: "Growing", increasing: false, icon: Leaf, color: "bg-green-500", href: "/farmer/crops" },
    { label: "Available Stock", value: `${availableStock}kg`, change: "In listings", increasing: true, icon: TrendingUp, color: "bg-blue-500", href: "/farmer/analytics" },
  ]

  const isLoading = productsLoading || listingsLoading || completedOrdersLoading || pendingOrdersLoading

  // ===== CROPS TAB STATE =====
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newCrop, setNewCrop] = useState({ name: "", description: "", priceCents: "", quantity: "", imageUrl: "" })
  const [editCrop, setEditCrop] = useState({ name: "", description: "", priceCents: "", quantity: "", imageUrl: "" })

  const filteredCrops = Array.isArray(products) ? products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) : []

  const handleAddCrop = async () => {
    if (!user || !newCrop.name || !newCrop.priceCents || !newCrop.quantity) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsCreating(true)
    try {
      const product = await productsAPI.create({ name: newCrop.name, description: newCrop.description || null, farmerId: user.id, imageUrl: newCrop.imageUrl || null })
      await listingsAPI.create({ productId: product.id, sellerId: user.id, priceCents: Math.round(Number(newCrop.priceCents) * 100), quantity: Number(newCrop.quantity), available: true })
      toast.success("Crop and listing created successfully!")
      setIsAddModalOpen(false)
      setNewCrop({ name: "", description: "", priceCents: "", quantity: "", imageUrl: "" })
      refetchProducts()
    } catch (error: any) {
      toast.error(error.message || "Failed to create crop")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditCrop = (product: Product) => {
    const listing = (product as any).listings?.[0]
    setEditingProduct(product)
    setEditCrop({
      name: product.name,
      description: product.description || "",
      priceCents: listing ? (listing.priceCents / 100).toString() : "",
      quantity: listing ? listing.quantity.toString() : "",
      imageUrl: product.imageUrl || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateCrop = async () => {
    if (!user || !editingProduct || !editCrop.name || !editCrop.priceCents || !editCrop.quantity) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsUpdating(true)
    try {
      await productsAPI.update(editingProduct.id, { name: editCrop.name, description: editCrop.description || null, imageUrl: editCrop.imageUrl || null })
      const existingListings = (editingProduct as any).listings || []
      if (existingListings.length > 0) {
        await listingsAPI.update(existingListings[0].id, { priceCents: Math.round(Number(editCrop.priceCents) * 100), quantity: Number(editCrop.quantity) })
      } else {
        await listingsAPI.create({ productId: editingProduct.id, sellerId: user.id, priceCents: Math.round(Number(editCrop.priceCents) * 100), quantity: Number(editCrop.quantity), available: true })
      }
      toast.success("Crop updated successfully!")
      setIsEditModalOpen(false)
      setEditingProduct(null)
      setEditCrop({ name: "", description: "", priceCents: "", quantity: "", imageUrl: "" })
      refetchProducts()
    } catch (error: any) {
      toast.error(error.message || "Failed to update crop")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCrop = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await productsAPI.delete(id)
      toast.success("Product deleted successfully")
      refetchProducts()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product")
    }
  }

// ===== ORDERS TAB STATE =====
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const { ordersAPI } = await import("@/lib/api-client")
      await ordersAPI.updateStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      refetchOrders()
    } catch (error: any) {
      toast.error("Failed to update order status", { description: error.message || "Please try again" })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const confirmCancelOrder = async () => {
    if (!cancelOrderId) return
    await updateOrderStatus(cancelOrderId, "CANCELLED")
    setCancelDialogOpen(false)
    setCancelOrderId(null)
  }

  // ===== ANALYTICS TAB STATE =====
  const totalRevenueAnalytics = Array.isArray(completedOrders) ? completedOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100 : 0
  const totalOrdersCount = (Array.isArray(pendingOrdersFull) ? pendingOrdersFull.length : 0) + (Array.isArray(confirmedOrders) ? confirmedOrders.length : 0) + (Array.isArray(shippedOrders) ? shippedOrders.length : 0) + (Array.isArray(deliveredOrders) ? deliveredOrders.length : 0)
  const avgOrderValue = Array.isArray(completedOrders) && completedOrders.length > 0 ? Math.round(totalRevenueAnalytics / completedOrders.length) : 0
  const uniqueBuyers = Array.isArray(completedOrders) ? new Set(completedOrders.map((o) => o.buyerId)).size : 0

  const cropSales = Array.isArray(products) && Array.isArray(completedOrders) ? products.filter((p) => p.farmerId === user?.id).map((product) => {
    const productOrders = completedOrders.filter((o) => o.items.some((item) => item.listing?.product?.id === product.id))
    const revenue = productOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
    const quantity = productOrders.reduce((sum, o) => sum + o.items.filter((item) => item.listing?.product?.id === product.id).reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
    return { ...product, totalRevenue: revenue, totalQuantity: quantity, orderCount: productOrders.length }
  }).filter((crop) => crop.orderCount > 0).sort((a, b) => b.totalRevenue - a.totalRevenue) : []

  const monthlyData = Array.isArray(completedOrders) ? Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const monthOrders = completedOrders.filter((o) => {
      const orderDate = new Date(o.createdAt)
      return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
    })
    const revenue = monthOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
    return { month: monthName, revenue, orderCount: monthOrders.length }
  }) : []

const buyerTypeData = Array.isArray(completedOrders) ? completedOrders.reduce((acc, order) => {
    const buyerType = order.buyer?.role || 'unknown'
    const existing = acc.find(item => item.type === buyerType)
    if (existing) { existing.count += 1; existing.revenue += order.totalCents / 100 }
    else { acc.push({ type: buyerType, count: 1, revenue: order.totalCents / 100 }) }
    return acc
  }, [] as { type: string; count: number; revenue: number }[]) : []

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']

  const currentMonth = new Date().getMonth()
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const currentYear = new Date().getFullYear()
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const currentMonthRevenue = Array.isArray(completedOrders) ? completedOrders.filter(o => { const d = new Date(o.createdAt); return d.getMonth() === currentMonth && d.getFullYear() === currentYear }).reduce((sum, o) => sum + o.totalCents, 0) / 100 : 0
  const previousMonthRevenue = Array.isArray(completedOrders) ? completedOrders.filter(o => { const d = new Date(o.createdAt); return d.getMonth() === previousMonth && d.getFullYear() === previousYear }).reduce((sum, o) => sum + o.totalCents, 0) / 100 : 0
  const revenueGrowth = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1) : '0'

  return (
    <>
      {user?.isBanned && <BannedUserDashboard />}
      
      {!user?.isBanned && (
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0] || "Farmer"}</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your farm today</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
            {farmerTabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
          </div>

          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === "overview" && (
            <div>
              {isLoading && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
                  </div>
                </div>
              )}

              {!isLoading && (
                <>
                  <div className="mb-8">
                    <OrderList
                      orders={Array.isArray(pendingOrders) ? pendingOrders : []}
                      loading={pendingOrdersLoading}
                      onOrderClick={setSelectedOrder}
                      emptyState={{ icon: Package, title: "No pending orders", description: "You're all caught up! When buyers place orders, they'll appear here." }}
                      title="Pending Orders"
                      subtitle="Orders waiting for your confirmation"
                      viewAllHref="/farmer/orders"
                      viewAllLabel="View all orders"
                      accentColor="text-farmer"
                      maxItems={4}
                    />
                  </div>

                  <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Link href="/farmer/crops" className="flex items-center gap-3 p-3 rounded-xl bg-farmer-bg hover:bg-amber-100 transition-colors group">
                          <div className="p-2 bg-farmer rounded-lg group-hover:scale-105 transition-transform"><Leaf className="w-5 h-5 text-white" /></div>
                          <div><p className="font-medium text-foreground">Add New Crop</p><p className="text-xs text-muted-foreground">List your harvest</p></div>
                        </Link>
                        <Link href="/farmer/orders" className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors group">
                          <div className="p-2 bg-foreground rounded-lg group-hover:scale-105 transition-transform"><Package className="w-5 h-5 text-white" /></div>
                          <div><p className="font-medium text-foreground">Manage Orders</p><p className="text-xs text-muted-foreground">{pendingCount} pending</p></div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                      <StatCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} increasing={stat.increasing} icon={stat.icon} color={stat.color} href={stat.href} />
                    ))}
                  </div>

                  <div className="max-w-md">
                    <ProductGrid
                      items={Array.isArray(products) ? products : []}
                      loading={productsLoading}
                      onItemClick={(item) => setSelectedProduct(item as Product)}
                      emptyState={{ icon: Leaf, title: "No products yet", description: "Add your first crop to start selling on NatengHub.", action: { label: "Add Crop", onClick: () => setActiveTab("crops") } }}
                      variant="list"
                      title="Your Products"
                      subtitle="Manage your crops and listings"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== CROPS TAB ===== */}
          {activeTab === "crops" && (
            <div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">My Crops</h2>
                  <p className="text-muted-foreground mt-1">Manage your crop inventory and wholesale pricing</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-farmer hover:bg-farmer-light text-white gap-2">
                      <Plus className="w-5 h-5" /> Add Crop
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-125">
                    <DialogHeader><DialogTitle>Add New Crop</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="crop-name">Crop Name</Label>
                        <Input id="crop-name" value={newCrop.name} onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })} placeholder="e.g. Tomatoes" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="crop-quantity">Quantity (kg)</Label>
                          <Input id="crop-quantity" type="number" value={newCrop.quantity} onChange={(e) => setNewCrop({ ...newCrop, quantity: e.target.value })} placeholder="500" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="crop-price">Price (₱/kg)</Label>
                          <Input id="crop-price" type="number" step="0.01" value={newCrop.priceCents} onChange={(e) => setNewCrop({ ...newCrop, priceCents: e.target.value })} placeholder="60.00" required />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="crop-desc">Description</Label>
                        <Input id="crop-desc" value={newCrop.description} onChange={(e) => setNewCrop({ ...newCrop, description: e.target.value })} placeholder="Fresh from Benguet highlands..." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setNewCrop({ name: "", description: "", priceCents: "", quantity: "", imageUrl: "" }) }} disabled={isCreating}>Cancel</Button>
                      <Button onClick={handleAddCrop} className="bg-farmer hover:bg-farmer-light" disabled={isCreating}>{isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Add Crop"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="Search crops..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>

              {productsLoading ? (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" /><p className="text-muted-foreground">Loading products...</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCrops.map((product) => {
                    const totalQuantity = ((product as any).listings || []).reduce((sum: number, l: any) => sum + (l.available ? l.quantity : 0), 0)
                    const hasAvailable = ((product as any).listings || []).some((l: any) => l.available && l.quantity > 0)
                    const avgPrice = ((product as any).listings || []).length > 0 ? ((product as any).listings || []).reduce((sum: number, l: any) => sum + l.priceCents, 0) / ((product as any).listings || []).length / 100 : 0

                    return (
                      <div key={product.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-muted relative flex items-center justify-center">
                          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-muted-foreground" />}
                          <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${hasAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            {hasAvailable ? "Available" : "Out of Stock"}
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "No description"}</p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditCrop(product)} className="p-2 hover:bg-muted rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                              <button onClick={() => handleDeleteCrop(product.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Available Stock</span><span className="font-medium">{totalQuantity} kg</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-medium text-farmer">₱{avgPrice.toFixed(2)}/kg</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Listings</span><span className="font-medium">{((product as any).listings || []).length}</span></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredCrops.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-1">No products found</h3>
                      <p className="text-muted-foreground">{searchTerm ? "Try a different search term" : "Add your first product to get started"}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Crop Modal */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-125">
                  <DialogHeader><DialogTitle>Edit Crop</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label htmlFor="edit-name">Crop Name</Label><Input id="edit-name" value={editCrop.name} onChange={(e) => setEditCrop({ ...editCrop, name: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label htmlFor="edit-quantity">Quantity (kg)</Label><Input id="edit-quantity" type="number" value={editCrop.quantity} onChange={(e) => setEditCrop({ ...editCrop, quantity: e.target.value })} /></div>
                      <div className="grid gap-2"><Label htmlFor="edit-price">Price (₱/kg)</Label><Input id="edit-price" type="number" step="0.01" value={editCrop.priceCents} onChange={(e) => setEditCrop({ ...editCrop, priceCents: e.target.value })} /></div>
                    </div>
                    <div className="grid gap-2"><Label htmlFor="edit-desc">Description</Label><Input id="edit-desc" value={editCrop.description} onChange={(e) => setEditCrop({ ...editCrop, description: e.target.value })} /></div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingProduct(null) }} disabled={isUpdating}>Cancel</Button>
                    <Button onClick={handleUpdateCrop} className="bg-farmer hover:bg-farmer-light" disabled={isUpdating}>{isUpdating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Update Crop"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ===== ORDERS TAB ===== */}
          {activeTab === "orders" && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Bulk Orders</h2>
                <p className="text-muted-foreground mt-1">Manage incoming wholesale orders from markets and businesses</p>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { title: "Pending", orders: pendingOrdersFull ?? [], icon: Clock, color: "text-yellow-600" },
                  { title: "Confirmed", orders: confirmedOrders ?? [], icon: Check, color: "text-blue-600" },
                  { title: "Shipped", orders: shippedOrders ?? [], icon: Truck, color: "text-green-600" },
                  { title: "Delivered", orders: deliveredOrders ?? [], icon: Package, color: "text-gray-600" },
                ].map((col) => (
                  <div key={col.title} className="bg-white rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <col.icon className={`w-5 h-5 ${col.color}`} />
                      <span className="text-sm text-muted-foreground">{col.title}</span>
                    </div>
                    <p className="text-2xl font-bold">{col.orders.length}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-6">
                {[
                  { title: "Pending", orders: pendingOrdersFull ?? [], icon: Clock, color: "text-yellow-600" },
                  { title: "Confirmed", orders: confirmedOrders ?? [], icon: Check, color: "text-blue-600" },
                  { title: "Shipped", orders: shippedOrders ?? [], icon: Truck, color: "text-green-600" },
                  { title: "Delivered", orders: deliveredOrders ?? [], icon: Package, color: "text-gray-600" },
                ].map((col) => (
                  <div key={col.title}>
                    <div className="flex items-center gap-2 mb-4">
                      <col.icon className={`w-5 h-5 ${col.color}`} />
                      <h2 className="font-semibold text-foreground">{col.title}</h2>
                      <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">{col.orders.length}</span>
                    </div>
                    <div className="space-y-4">
                      {col.orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl border border-border p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
{order.buyer?.role === "bulkBuyer" ? <Building2 className="w-4 h-4 text-business" /> : <UserIcon className="w-4 h-4 text-buyer" />}
                              <span className="font-medium text-sm">{order.buyer?.name || "Unknown"}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-sm mb-3">
                            <p className="font-medium text-foreground">{order.items.map((item) => `${item.listing?.product?.name || "Product"} (${item.quantity}kg)`).join(", ")}</p>
                            <div className="flex justify-between text-muted-foreground"><span>Total</span><span className="font-semibold text-farmer">₱{(order.totalCents / 100).toLocaleString()}</span></div>
                          </div>
                          {order.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 bg-farmer hover:bg-farmer-light text-white gap-1" onClick={() => updateOrderStatus(order.id, "CONFIRMED")} disabled={updatingStatus === order.id}>
                                {updatingStatus === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Accept</>}
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setCancelOrderId(order.id); setCancelDialogOpen(true) }} disabled={updatingStatus === order.id}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {order.status === "CONFIRMED" && (
                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => updateOrderStatus(order.id, "SHIPPED")} disabled={updatingStatus === order.id}>
                              {updatingStatus === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Truck className="w-4 h-4" /> Mark as Shipped</>}
                            </Button>
                          )}
                          {order.status === "SHIPPED" && (
                            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => updateOrderStatus(order.id, "DELIVERED")} disabled={updatingStatus === order.id}>
                              {updatingStatus === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Mark as Delivered</>}
                            </Button>
                          )}
                        </div>
                      ))}
                      {col.orders.length === 0 && (
                        <div className="bg-muted/50 rounded-xl border border-dashed border-border p-6 text-center">
                          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No {col.title.toLowerCase()} orders</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <ConfirmationDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} title="Cancel Order" description={`Are you sure you want to cancel order #${cancelOrderId}?`} onConfirm={confirmCancelOrder} variant="destructive" />
            </div>
          )}

          {/* ===== ANALYTICS TAB ===== */}
          {activeTab === "analytics" && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
                <p className="text-muted-foreground mt-1">Track your sales performance and trends</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
                    <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                      {parseFloat(revenueGrowth) > 0 ? '+' : ''}{revenueGrowth}%
                    </span>
                  </div>
                  <p className="text-3xl font-bold">₱{totalRevenueAnalytics.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl"><Package className="w-6 h-6 text-blue-600" /></div>
                  </div>
                  <p className="text-3xl font-bold">{totalOrdersCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl"><TrendingUp className="w-6 h-6 text-purple-600" /></div>
                  </div>
                  <p className="text-3xl font-bold">₱{avgOrderValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Avg Order Value</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 rounded-xl"><UserIcon className="w-6 h-6 text-amber-600" /></div>
                  </div>
                  <p className="text-3xl font-bold">{uniqueBuyers}</p>
                  <p className="text-sm text-muted-foreground mt-1">Active Buyers</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-semibold mb-6">Revenue Overview</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Buyer Distribution</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie data={buyerTypeData} cx="50%" cy="50%" labelLine={false} label={({type, percent}) => `${type} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="count">
                        {buyerTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm mt-6">
                <h2 className="text-lg font-semibold mb-4">Top Selling Crops</h2>
                <div className="space-y-4">
                  {cropSales.slice(0, 5).map((crop, index) => (
                    <div key={crop.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-farmer-bg text-farmer text-sm font-medium rounded-full flex items-center justify-center">{index + 1}</span>
                      <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{crop.name}</p><p className="text-xs text-muted-foreground">{crop.orderCount} orders</p></div>
                      <p className="font-semibold text-sm text-farmer">₱{crop.totalRevenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Order Modal */}
          <OrderModal open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null) }} order={selectedOrder} accentColor="bg-farmer hover:bg-farmer/90" managerHref="/farmer/orders" managerLabel="Open order manager" />

          {/* Product Modal */}
          <ProductModal open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null) }} item={selectedProduct} mode="product" accentColor="bg-farmer hover:bg-farmer/90" managerHref="/farmer/crops" managerLabel="Go to crop manager" />
        </div>
      )}
    </>
  )
}
