"use client"

import { useState, useEffect } from "react"
import { mockWholesaleOrders, getWholesaleCrops, type WholesaleOrder } from "@/lib/mock-data"
import { getCurrentUser, type User } from "@/lib/auth"
import { Package, TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, Clock } from "lucide-react"
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

type WholesaleCrop = ReturnType<typeof getWholesaleCrops>[number]

export default function BusinessDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const orders = mockWholesaleOrders.filter((o) => o.buyerId === "business-1")
  const crops = getWholesaleCrops()
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<WholesaleCrop | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length
  const totalSpent = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length

  const stats = [
    {
      label: "Total Spent",
      value: `₱${totalSpent.toLocaleString()}`,
      change: "+8.2%",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Active Orders",
      value: pendingOrders.toString(),
      change: `${pendingOrders} in progress`,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Products Sourced",
      value: totalOrders.toString(),
      change: "This month",
      icon: ShoppingBag,
      color: "bg-purple-500",
    },
    {
      label: "Suppliers",
      value: "3",
      change: "+1 new",
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
          {user?.businessType === "reseller"
            ? "Manage your wholesale purchases for resale"
            : "Source fresh produce for your business"}
        </p>
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
            {orders.slice(0, 4).map((order) => (
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
                    <p className="font-medium text-foreground">{order.crop}</p>
                    <p className="text-sm text-muted-foreground">
                      from {order.farmerName} - {order.quantity}
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
            {orders.length === 0 && (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
                <Link href="/business/browse" className="text-business font-medium text-sm mt-2 inline-block">
                  Browse wholesale products
                </Link>
              </div>
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
                  <p className="text-xs text-muted-foreground">{pendingOrders} in progress</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Available Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Fresh Wholesale</h3>
            <div className="space-y-3">
              {crops.slice(0, 4).map((crop) => (
                <div
                  key={crop.id}
                  className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-business focus-visible:ring-offset-2"
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
                        Min: {crop.minOrderQty}
                        {crop.unit}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-business">
                    ₱{crop.wholesalePrice}/{crop.unit}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/business/browse"
              className="block text-center text-sm font-medium text-business mt-4 hover:text-business-light"
            >
              View all products
            </Link>
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
                <DialogTitle>Wholesale order {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  {selectedOrder.crop} from {selectedOrder.farmerName} • {selectedOrder.quantity}
                  {selectedOrder.unit}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase">Supplier</p>
                    <p className="font-semibold">{selectedOrder.farmerName}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.orderDate}</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <p className="font-semibold capitalize">{selectedOrder.status}</p>
                    <p className="text-xs text-muted-foreground">Total ₱{selectedOrder.total.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.notes || "No special instructions supplied"}
                  </p>
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
        open={!!selectedCrop}
        onOpenChange={(open) => {
          if (!open) setSelectedCrop(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedCrop && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCrop.name}</DialogTitle>
                <DialogDescription>
                  From {selectedCrop.farmerName} • Minimum order {selectedCrop.minOrderQty}
                  {selectedCrop.unit}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border overflow-hidden">
                  <img src={selectedCrop.image || "/placeholder.svg"} alt={selectedCrop.name} />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available</span>
                    <strong>{selectedCrop.harvestQuantity} {selectedCrop.unit}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <strong>₱{selectedCrop.wholesalePrice}/{selectedCrop.unit}</strong>
                  </div>
                  <p className="text-muted-foreground text-sm">{selectedCrop.description}</p>
                </div>
              </div>

              <DialogFooter className="sm:justify-between sm:flex-row">
                <Button variant="outline" onClick={() => setSelectedCrop(null)}>
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
