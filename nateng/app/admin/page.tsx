"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, Package, BarChart3, Search, Edit2, Trash2, Plus, Database, Table, Eye, Settings, Ban, ShieldCheck, MessageSquare, AlertTriangle, Wifi, WifiOff, Circle, Calendar, Truck, TrendingUp, PieChart } from "lucide-react"
import { toast } from "sonner"
import { getBannedUsers, banUser as addToBanList, unbanUser as removeFromBanList } from "@/utils/auth"
import { addBannedUser, removeBannedUser, isUserBanned as isBackendBanned } from "@/lib/banned-users"
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [appeals, setAppeals] = useState<any[]>([])
  const [contactMessages, setContactMessages] = useState<any[]>([])
  const [deliverySchedules, setDeliverySchedules] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRevenue: [],
    userRoles: [],
    topProducts: [],
    orderStatuses: []
  })
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalListings: 0,
    totalOrders: 0,
    onlineUsers: 0,
    bannedUsers: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if running on localhost
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        toast.error("Access denied. Admin panel is only available on localhost.")
        router.push('/')
        return
      }

      // Check if already authenticated
      const auth = localStorage.getItem('admin_auth')
      if (auth === 'true') {
        setIsAuthenticated(true)
        fetchData()
      }
    }
  }, [router])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch data from database
      const [usersData, productsData, listingsData, ordersData, appealsData, messagesData, statsData, schedulesData] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/products'),
        fetch('/api/listings'),
        fetch('/api/orders'),
        fetch('/api/admin/appeals'),
        fetch('/api/contact'),
        fetch('/api/admin/stats'),
        fetch('/api/delivery-schedule')
      ])

      if (usersData.ok) {
        const usersResult = await usersData.json()
        setUsers(Array.isArray(usersResult) ? usersResult : [])
      } else {
        setUsers([])
      }

      if (productsData.ok) {
        const productsResult = await productsData.json()
        setProducts(Array.isArray(productsResult) ? productsResult : [])
      } else {
        setProducts([])
      }

      if (listingsData.ok) {
        const listingsResult = await listingsData.json()
        setListings(Array.isArray(listingsResult) ? listingsResult : [])
      } else {
        setListings([])
      }

      if (ordersData.ok) {
        const ordersResult = await ordersData.json()
        setOrders(Array.isArray(ordersResult) ? ordersResult : [])
      } else {
        setOrders([])
      }

      if (appealsData.ok) {
        const appealsResult = await appealsData.json()
        setAppeals(Array.isArray(appealsResult) ? appealsResult : [])
      } else {
        setAppeals([])
      }

      if (messagesData.ok) {
        const messagesResult = await messagesData.json()
        setContactMessages(Array.isArray(messagesResult.messages) ? messagesResult.messages : [])
      } else {
        setContactMessages([])
      }

      if (statsData.ok) {
        const statsResult = await statsData.json()
        setStats(statsResult)
      } else {
        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalListings: listings.length,
          totalOrders: orders.length,
          onlineUsers: 0,
          bannedUsers: 0
        })
      }

      if (schedulesData.ok) {
        const schedulesResult = await schedulesData.json()
        setDeliverySchedules(Array.isArray(schedulesResult) ? schedulesResult : [])
      } else {
        setDeliverySchedules([])
      }

      // Process analytics data
      processAnalyticsData(users, products, orders)

      // Sync banned users with localStorage
      setBannedUsers(getBannedUsers())
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Failed to fetch data")
      // Reset to empty arrays on error
      setUsers([])
      setProducts([])
      setListings([])
      setOrders([])
      setAppeals([])
      setContactMessages([])
      setDeliverySchedules([])
      setAnalyticsData({
        monthlyRevenue: [],
        userRoles: [],
        topProducts: [],
        orderStatuses: []
      })
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalListings: 0,
        totalOrders: 0,
        onlineUsers: 0,
        bannedUsers: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalyticsData = (users: any[], products: any[], orders: any[]) => {
    // Process monthly revenue data
    const monthlyRevenue = orders.reduce((acc: any[], order) => {
      const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      const existingMonth = acc.find(item => item.month === month)
      if (existingMonth) {
        existingMonth.revenue += order.totalCents / 100
        existingMonth.orders += 1
      } else {
        acc.push({ month, revenue: order.totalCents / 100, orders: 1 })
      }
      return acc
    }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    // Process user roles data
    const userRoles = users.reduce((acc: any[], user) => {
      const existingRole = acc.find(item => item.role === user.role)
      if (existingRole) {
        existingRole.count += 1
      } else {
        acc.push({ role: user.role, count: 1 })
      }
      return acc
    }, [])

    // Process top products
    const productSales = orders.reduce((acc: any[], order) => {
      order.items.forEach((item: any) => {
        const productName = item.listing.product.name
        const existingProduct = acc.find(item => item.name === productName)
        if (existingProduct) {
          existingProduct.quantity += item.quantity
          existingProduct.revenue += (item.quantity * item.priceCents) / 100
        } else {
          acc.push({ 
            name: productName, 
            quantity: item.quantity, 
            revenue: (item.quantity * item.priceCents) / 100 
          })
        }
      })
      return acc
    }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    // Process order statuses
    const orderStatuses = orders.reduce((acc: any[], order) => {
      const existingStatus = acc.find(item => item.status === order.status)
      if (existingStatus) {
        existingStatus.count += 1
      } else {
        acc.push({ status: order.status, count: 1 })
      }
      return acc
    }, [])

    setAnalyticsData({
      monthlyRevenue,
      userRoles,
      topProducts: productSales,
      orderStatuses
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Hardcoded admin credentials
    if (username === "admin" && password === "admin123") {
      localStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      toast.success("Admin access granted")
      fetchData()
    } else {
      toast.error("Invalid username or password")
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
    setUsername("")
    setPassword("")
    toast.success("Logged out successfully")
  }

  const handleBanUser = async (userId: number, userName: string, userEmail: string) => {
    const reason = prompt(`Why are you banning ${userName}? (This will be logged for security purposes)`)
    if (!reason) return

    if (!confirm(`Are you sure you want to ban ${userName}? Reason: ${reason}`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail, reason })
      })

      // Add to both frontend and backend ban systems
      addToBanList(userEmail, userName)
      addBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers())
      
      toast.success(`User ${userName} has been banned and access restricted`)
      fetchData()
      
      // Force check banned status (will redirect user if they're currently logged in)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new Event('storage'))
        }, 100)
      }
    } catch (error) {
      // Even if API fails, still enforce the ban in both systems
      addToBanList(userEmail, userName)
      addBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers())
      toast.success(`User ${userName} has been banned and access restricted`)
      fetchData()
    }
  }

  const handleUnbanUser = async (userId: number, userName: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to unban ${userName}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail })
      })

      // Remove from both frontend and backend ban systems
      removeFromBanList(userEmail, userName)
      removeBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers())
      
      toast.success(`User ${userName} has been unbanned and access restored`)
      fetchData()
    } catch (error) {
      // Even if API fails, still enforce the unban in both systems
      removeFromBanList(userEmail, userName)
      removeBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers())
      toast.success(`User ${userName} has been unbanned and access restored`)
      fetchData()
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchData()
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const handleApproveAppeal = async (appealId: string, userEmail: string) => {
    if (!confirm('Are you sure you want to approve this appeal? This will unban the user.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appealId, 
          status: 'approved', 
          adminEmail: 'admin@nateng.com',
          adminNotes: 'Appeal approved after review'
        }),
      })

      if (response.ok) {
        toast.success('Appeal approved and user unbanned')
        fetchData()
      } else {
        toast.error('Failed to approve appeal')
      }
    } catch (error) {
      toast.error('Error approving appeal')
    }
  }

  const handleRejectAppeal = async (appealId: string) => {
    const adminNotes = prompt('Reason for rejecting this appeal (optional):')
    
    try {
      const response = await fetch('/api/admin/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appealId, 
          status: 'rejected', 
          adminEmail: 'admin@nateng.com',
          adminNotes: adminNotes || 'Appeal rejected after review'
        }),
      })

      if (response.ok) {
        toast.success('Appeal rejected')
        fetchData()
      } else {
        toast.error('Failed to reject appeal')
      }
    } catch (error) {
      toast.error('Error rejecting appeal')
    }
  }

  const handleMarkReviewed = async (messageId: number, messageName: string) => {
    try {
      const response = await fetch('/api/contact/mark-reviewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      })

      if (response.ok) {
        toast.success(`Message from ${messageName} marked as reviewed`)
        fetchData()
      } else {
        toast.error('Failed to mark message as reviewed')
      }
    } catch (error) {
      toast.error('Failed to mark message as reviewed')
    }
  }

  // Simulate online status
  const getOnlineStatus = (user: any) => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('user_name') || sessionStorage.getItem('user_name')
      if (currentUser === user.name) {
        return true
      }
    }
    
    const now = new Date()
    const userHash = user.id + now.getMinutes()
    const shouldBeOnline = (userHash % 10) < 3
    
    return shouldBeOnline
  }

  // Check banned status
  const getBannedStatus = (user: any) => {
    const frontendBanned = bannedUsers.has(user.email) || bannedUsers.has(user.name)
    const backendBanned = isBackendBanned(user.email.toLowerCase())
    return frontendBanned || backendBanned
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Database Admin Panel - Prisma Studio Integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Access Database Admin"}
              </Button>
            </form>
            <Alert className="mt-4">
              <Database className="w-4 h-4" />
              <AlertDescription>
                Direct database access with Prisma Studio integration
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter functions
  const filteredUsers = Array.isArray(users) ? users.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredProducts = Array.isArray(products) ? products.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredListings = Array.isArray(listings) ? listings.filter((listing: any) =>
    listing.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredOrders = Array.isArray(orders) ? orders.filter((order: any) =>
    order.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredSchedules = Array.isArray(deliverySchedules) ? deliverySchedules.filter((schedule: any) =>
    schedule.proposer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.orderId?.toString().includes(searchTerm.toLowerCase())
  ) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Database Admin</h1>
              <span className="text-sm text-gray-500">Prisma Studio Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:5555', '_blank')}>
                <Eye className="w-4 h-4 mr-1" />
                Open Prisma Studio
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search across all tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tab Navigation - Prisma Studio Style */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3, count: null },
              { id: 'users', name: 'User', icon: Users, count: filteredUsers.length },
              { id: 'products', name: 'Product', icon: Package, count: filteredProducts.length },
              { id: 'listings', name: 'Listing', icon: Table, count: filteredListings.length },
              { id: 'orders', name: 'Order', icon: Settings, count: filteredOrders.length },
              { id: 'schedules', name: 'Schedules', icon: Calendar, count: deliverySchedules.length },
              { id: 'appeals', name: 'Appeals', icon: AlertTriangle, count: appeals.length },
              { id: 'messages', name: 'Messages', icon: MessageSquare, count: contactMessages.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Ban className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Banned Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.bannedUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Table className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Listings</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalListings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Settings className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Delivery Schedules</p>
                      <p className="text-2xl font-semibold text-gray-900">{deliverySchedules.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Messages</p>
                      <p className="text-2xl font-semibold text-gray-900">{contactMessages.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Table</span>
              </CardTitle>
              <CardDescription>
                Manage all user records in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredUsers.map((user: any) => (
                  <div key={user.id} className={`flex items-center justify-between p-4 border rounded-lg ${user.isBanned ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{user.name}</p>
                        {user.isBanned && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">BANNED</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email} • {user.role}</p>
                      <p className="text-xs text-gray-400">ID: {user.id} • Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      {user.isBanned ? (
                        <Button variant="outline" size="sm" onClick={() => handleUnbanUser(user.id, user.name, user.email)}>
                          <Shield className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleBanUser(user.id, user.name, user.email)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'products' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Product Table</span>
              </CardTitle>
              <CardDescription>
                View all product records in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.description}</p>
                      <p className="text-xs text-gray-400">ID: {product.id} • Farmer ID: {product.farmerId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'listings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Table className="w-5 h-5" />
                <span>Listing Table</span>
              </CardTitle>
              <CardDescription>
                View all listing records in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredListings.map((listing: any) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <p className="font-medium">{listing.product?.name}</p>
                      <p className="text-sm text-gray-500">Seller: {listing.seller?.name}</p>
                      <p className="text-xs text-gray-400">ID: {listing.id} • Price: ${listing.priceCents / 100} • Qty: {listing.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'orders' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Order Table</span>
              </CardTitle>
              <CardDescription>
                View all order records in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">Buyer: {order.buyer?.name} • Seller: {order.seller?.name}</p>
                      <p className="text-xs text-gray-400">Total: ${order.totalCents / 100} • Status: {order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'appeals' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Appeal Management</span>
              </CardTitle>
              <CardDescription>
                Manage user ban appeals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {appeals.map((appeal: any) => (
                  <div key={appeal.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <p className="font-medium">{appeal.userName}</p>
                      <p className="text-sm text-gray-500">{appeal.userEmail}</p>
                      <p className="text-xs text-gray-400">Reason: {appeal.reason}</p>
                      <p className="text-xs text-gray-400">Status: {appeal.status}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleApproveAppeal(appeal.id, appeal.userEmail)}>
                        <ShieldCheck className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRejectAppeal(appeal.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'schedules' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Delivery Schedule Oversight</span>
              </CardTitle>
              <CardDescription>
                Monitor all delivery schedules and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredSchedules.map((schedule: any) => (
                  <div key={schedule.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                    schedule.status === 'confirmed' ? 'bg-green-50 border-green-200' : 
                    schedule.status === 'proposed' ? 'bg-blue-50 border-blue-200' : 
                    schedule.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">Order #{schedule.orderId}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          schedule.status === 'proposed' ? 'bg-blue-100 text-blue-800' : 
                          schedule.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Proposed by: {schedule.proposer?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Date: {new Date(schedule.scheduledDate).toLocaleDateString()} at {schedule.scheduledTime}
                      </p>
                      {schedule.deliveryAddress && (
                        <p className="text-xs text-gray-400">Address: {schedule.deliveryAddress}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredSchedules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No delivery schedules found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'messages' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Contact Messages</span>
              </CardTitle>
              <CardDescription>
                Manage contact form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contactMessages.map((message: any) => (
                  <div key={message.id} className={`flex items-center justify-between p-4 border rounded-lg ${message.isReviewed ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="flex-1">
                      <p className="font-medium">{message.name}</p>
                      <p className="text-sm text-gray-500">{message.email}</p>
                      <p className="text-xs text-gray-400">{message.message}</p>
                      <p className="text-xs text-gray-400">Status: {message.isReviewed ? 'Reviewed' : 'Pending'}</p>
                    </div>
                    <div className="flex space-x-2">
                      {!message.isReviewed && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkReviewed(message.id, message.name)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
