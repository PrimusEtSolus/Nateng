"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { formatDate } from "@/lib/date-utils"
import { TrendingUp, DollarSign, Package, Users, ArrowUpRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: string
  createdAt: string
  buyer: { id: number; name: string; role: string }
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

interface Product {
  id: number
  name: string
  description: string | null
  farmerId: number
}

export default function FarmerAnalyticsPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch farmer's orders (as seller)
  const { data: orders, loading: ordersLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch farmer's products
  const { data: products, loading: productsLoading } = useFetch<Product[]>(
    user ? `/api/products` : '',
    { skip: !user }
  )

  if (ordersLoading || productsLoading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  const completedOrders = orders?.filter((o) => o.status === "DELIVERED") || []
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
  const totalOrders = orders?.length || 0
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0

  // Aggregate crop sales from real data
  const cropSales: (Product & { totalRevenue: number; totalQuantity: number; orderCount: number })[] =
    (products || [])
      .filter((p) => p.farmerId === user?.id)
      .map((product) => {
        const productOrders = orders?.filter((o) => 
          o.items.some((item) => item.listing.product.id === product.id)
        ) || []
        const revenue = productOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
        const quantity = productOrders.reduce((sum, o) => 
          sum + o.items
            .filter((item) => item.listing.product.id === product.id)
            .reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
        return {
          ...product,
          totalRevenue: revenue,
          totalQuantity: quantity,
          orderCount: productOrders.length,
        }
      })
      .filter((crop) => crop.orderCount > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // Generate monthly data from real orders
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const monthOrders = completedOrders.filter((o) => {
      const orderDate = new Date(o.createdAt)
      return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
    })
    const revenue = monthOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
    return { month: monthName, revenue }
  })

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 1)

  const uniqueBuyers = new Set(completedOrders.map((o) => o.buyerId)).size

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your sales performance and trends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              +24%
            </span>
          </div>
          <p className="text-3xl font-bold">₱{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">₱{avgOrderValue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Avg Order Value</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              +3
            </span>
          </div>
          <p className="text-3xl font-bold">{uniqueBuyers}</p>
          <p className="text-sm text-muted-foreground mt-1">Active Buyers</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Revenue Overview</h2>
          <div className="flex items-end gap-4 h-64">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-farmer to-farmer-light rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-sm text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Crops */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top Selling Crops</h2>
          <div className="space-y-4">
            {cropSales.slice(0, 5).map((crop, index) => (
              <div key={crop.id} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-farmer-bg text-farmer text-sm font-medium rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{crop.name}</p>
                  <p className="text-xs text-muted-foreground">{crop.orderCount} orders</p>
                </div>
                <p className="font-semibold text-sm text-farmer">₱{crop.totalRevenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
