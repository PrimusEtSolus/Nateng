"use client"

import { useState, useEffect } from "react"
import { mockWholesaleOrders, getWholesaleCrops, mockRetailProducts } from "@/lib/mock-data"
import { getCurrentUser, type User } from "@/lib/auth"
import { Package, TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, Store, Users } from "lucide-react"
import Link from "next/link"

export default function ResellerDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const orders = mockWholesaleOrders.filter((o) => o.buyerId === "reseller-1")
  const crops = getWholesaleCrops()
  const myProducts = mockRetailProducts.filter((p) => p.resellerId === "reseller-1")

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length
  const totalSpent = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total, 0)
  const totalSales = myProducts.reduce((sum, p) => sum + p.soldCount * p.pricePerKg, 0)

  const stats = [
    {
      label: "Total Revenue",
      value: `₱${totalSales.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Products Listed",
      value: myProducts.length.toString(),
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
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.businessName || "Reseller"}</h1>
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
          <div className="divide-y divide-border">
            {myProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.availableKg}kg available</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₱{product.pricePerKg}/kg</p>
                  <p className="text-sm text-muted-foreground">{product.soldCount} sold</p>
                </div>
              </div>
            ))}
          </div>
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
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{order.crop}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.quantity}
                      {order.unit} from {order.farmerName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/reseller/orders"
              className="block text-center text-sm font-medium text-teal-600 mt-4 hover:text-teal-700"
            >
              View all orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
