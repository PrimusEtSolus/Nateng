"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Users, ShoppingCart, TrendingUp, Package, Search, Eye, DollarSign, Activity } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalOrders: number
    totalRevenue: number
    totalListings: number
    ordersGrowth: number
    revenueGrowth: number
  }
  dailyStats: Array<{
    date: string
    totalUsers: number
    activeUsers: number
    totalOrders: number
    totalRevenue: number
    totalListings: number
  }>
  topProducts: Array<{
    productId: string
    productName: string
    views: number
  }>
  topSearches: Array<{
    searchTerm: string
    count: number
  }>
  userActivity: Array<{
    eventType: string
    count: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?period=${period}`)
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analytics Unavailable</h2>
          <p className="text-muted-foreground">Unable to load analytics data</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (cents: number) => {
    return `₱${(cents / 100).toLocaleString()}`
  }

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}%`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your platform performance and user activity</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.activeUsers} active this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={data.overview.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatGrowth(data.overview.ordersGrowth)}
              </span>{' '}
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={data.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatGrowth(data.overview.revenueGrowth)}
              </span>{' '}
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active product listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue & Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders Trend</CardTitle>
            <CardDescription>Daily performance over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any, name: string) => [
                    name === 'Revenue' ? formatCurrency(value) : value,
                    name
                  ]}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stroke="#8884d8" 
                  name="Revenue"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="totalOrders" 
                  stroke="#82ca9d" 
                  name="Orders"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Events by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.userActivity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ eventType, count }) => `${eventType}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.userActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Top Products by Views
            </CardTitle>
            <CardDescription>Most viewed products this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-muted-foreground">ID: {product.productId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.views.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Top Search Terms
            </CardTitle>
            <CardDescription>Most popular search queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topSearches.slice(0, 5).map((search, index) => (
                <div key={search.searchTerm} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="font-medium">{search.searchTerm}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{search.count.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">searches</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
