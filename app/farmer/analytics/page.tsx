"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { formatDate } from "@/lib/date-utils"
import { TrendingUp, DollarSign, Package, Users, ArrowUpRight, Calendar, BarChart3, PieChart, Eye, TrendingDown, ChevronRight, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

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
  const [selectedCrop, setSelectedCrop] = useState<any>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch farmer's orders (as seller)
  const { data: orders, loading: ordersLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  // Fetch farmer's products
  const { data: productsResponse, loading: productsLoading } = useFetch<{ products: Product[] }>(
    user ? `/api/products` : '',
    { skip: !user }
  )

  // Extract products from response
  const products = productsResponse?.products || null

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

  const completedOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "CONFIRMED" || o.status === "SHIPPED" || o.status === "DELIVERED") || [] : []
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100
  const totalOrders = Array.isArray(orders) ? orders.length || 0 : 0
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0

  // Aggregate crop sales from real data
  const cropSales: (Product & { totalRevenue: number; totalQuantity: number; orderCount: number })[] =
    Array.isArray(products) ? products.filter((p) => p.farmerId === user?.id).map((product) => {
        const productOrders = Array.isArray(orders) ? orders.filter((o) => 
          (o.status === "CONFIRMED" || o.status === "SHIPPED" || o.status === "DELIVERED") &&
          o.items.some((item) => item.listing.product.id === product.id)
        ) || [] : []
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
      .sort((a, b) => b.totalRevenue - a.totalRevenue) : []

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
  const orderCount = monthOrders.length
  return { month: monthName, revenue, orderCount }
})

// Generate buyer type distribution data
const buyerTypeData = completedOrders.reduce((acc, order) => {
  const buyerType = order.buyer.role
  const existing = acc.find(item => item.type === buyerType)
  if (existing) {
    existing.count += 1
    existing.revenue += order.totalCents / 100
  } else {
    acc.push({ type: buyerType, count: 1, revenue: order.totalCents / 100 })
  }
  return acc
}, [] as { type: string; count: number; revenue: number }[])

// Colors for pie chart
const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']

// Calculate growth rates
const currentMonth = new Date().getMonth()
const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
const currentYear = new Date().getFullYear()
const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

const currentMonthRevenue = completedOrders
  .filter(o => {
    const date = new Date(o.createdAt)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  .reduce((sum, o) => sum + o.totalCents, 0) / 100

const previousMonthRevenue = completedOrders
  .filter(o => {
    const date = new Date(o.createdAt)
    return date.getMonth() === previousMonth && date.getFullYear() === previousYear
  })
  .reduce((sum, o) => sum + o.totalCents, 0) / 100

const revenueGrowth = previousMonthRevenue > 0 
  ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
  : '0'

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
              {parseFloat(revenueGrowth) > 0 ? <ArrowUpRight className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
              {parseFloat(revenueGrowth) > 0 ? '+' : ''}{revenueGrowth}%
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
        </div>

        {/* Buyer Type Distribution */}
<div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
  <h2 className="text-lg font-semibold mb-4">Buyer Distribution</h2>
  <ResponsiveContainer width="100%" height={200}>
    <RePieChart>
      <Pie
        data={buyerTypeData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({type, percent}) => `${type} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="count"
      >
        {buyerTypeData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </RePieChart>
  </ResponsiveContainer>
</div>

{/* Top Crops */}
<div className="bg-white rounded-2xl p-6 border border-border shadow-sm mt-6">
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
  )
}
