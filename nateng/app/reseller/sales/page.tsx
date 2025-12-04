"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, type User } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { DollarSign, TrendingUp, ShoppingBag, Users, ArrowUpRight, Loader2 } from "lucide-react"

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
}

export default function ResellerSalesPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch reseller's sales (as seller - orders from buyers)
  const { data: salesOrders, loading: salesLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  const deliveredOrders = salesOrders?.filter((o) => o.status === "DELIVERED") || []
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
  const totalSold = deliveredOrders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Sales Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your retail sales performance</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              +12.5%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">₱{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-teal-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-teal-600">
              <ArrowUpRight className="w-4 h-4" />
              +8.2%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalSold}</p>
          <p className="text-sm text-muted-foreground mt-1">Units Sold</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
              +5 new
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">48</p>
          <p className="text-sm text-muted-foreground mt-1">Customers</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-purple-600">
              <ArrowUpRight className="w-4 h-4" />
              +15%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">4.7</p>
          <p className="text-sm text-muted-foreground mt-1">Avg. Rating</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Sales</h2>
        </div>
        {salesLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading sales data...</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {deliveredOrders.length > 0 ? (
              deliveredOrders.slice(0, 10).map((order, index) => {
                const productNames = order.items.map((item) => item.listing.product.name).join(", ")
                const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
                return (
                  <div key={order.id} className="p-4 flex items-center gap-4">
                    <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{productNames}</p>
                      <p className="text-sm text-muted-foreground">{totalQuantity}kg sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ₱{(order.totalCents / 100).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">revenue</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>No sales yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
