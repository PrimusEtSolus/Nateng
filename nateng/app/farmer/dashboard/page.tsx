"use client"

import { useState, useEffect } from "react"
import { mockCrops, mockWholesaleOrders, type WholesaleOrder, type Crop } from "@/lib/mock-data"
import { getCurrentUser, type User } from "@/lib/auth"
import { Package, TrendingUp, Leaf, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
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

export default function FarmerDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const pendingOrders = mockWholesaleOrders.filter((o) => o.status === "pending").length
  const totalRevenue = mockWholesaleOrders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total, 0)
  const totalCrops = mockCrops.length
  const availableStock = mockCrops.reduce((sum, c) => sum + c.harvestQuantity, 0)

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

  const recentOrders = mockWholesaleOrders.slice(0, 4)

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
            className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
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
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-farmer focus-visible:ring-offset-2"
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
                    <p className="font-medium text-foreground">{order.buyerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.crop} - {order.quantity}
                      {order.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₱{order.total.toLocaleString()}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
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
                  <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Top Crops */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Your Crops</h3>
            <div className="space-y-3">
              {mockCrops.slice(0, 4).map((crop) => (
                <div
                  key={crop.id}
                  className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-farmer focus-visible:ring-offset-2"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCrop(crop)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedCrop(crop)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={crop.image || "/placeholder.svg"}
                        alt={crop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{crop.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {crop.harvestQuantity}
                        {crop.unit}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      crop.status === "available"
                        ? "bg-green-100 text-green-700"
                        : crop.status === "low_stock"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {crop.status.replace("_", " ")}
                  </span>
                </div>
              ))}
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
                <DialogTitle>Order from {selectedOrder.buyerName}</DialogTitle>
                <DialogDescription>
                  {selectedOrder.crop} • {selectedOrder.quantity}
                  {selectedOrder.unit} needed by buyer ({selectedOrder.buyerType})
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  <p className="font-semibold capitalize">{selectedOrder.status}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedOrder.orderDate}</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground uppercase">Total value</p>
                  <p className="font-semibold">₱{selectedOrder.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₱{selectedOrder.pricePerUnit}/{selectedOrder.unit}
                  </p>
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
        open={!!selectedCrop}
        onOpenChange={(open) => {
          if (!open) setSelectedCrop(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedCrop && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCrop.name} inventory</DialogTitle>
                <DialogDescription>
                  {selectedCrop.harvestQuantity}
                  {selectedCrop.unit} harvested • Status {selectedCrop.status.replace("_", " ")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">{selectedCrop.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Wholesale price</p>
                    <p className="font-semibold">₱{selectedCrop.wholesalePrice}/{selectedCrop.unit}</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Minimum order</p>
                    <p className="font-semibold">
                      {selectedCrop.minOrderQty}
                      {selectedCrop.unit}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedCrop(null)}>
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
