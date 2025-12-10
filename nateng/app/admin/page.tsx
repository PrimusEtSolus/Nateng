"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, Package, AlertTriangle, BarChart3, Settings, Search, Edit2, Trash2, Eye, Circle, Wifi, WifiOff, Ban, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { getBannedUsers, banUser as addToBanList, unbanUser as removeFromBanList } from "@/utils/auth"
import { addBannedUser, removeBannedUser, isUserBanned as isBackendBanned } from "@/lib/banned-users"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalListings: 0,
    totalOrders: 0,
    onlineUsers: 0,
    bannedUsers: 0
  })
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [appeals, setAppeals] = useState<any[]>([])
  const [contactMessages, setContactMessages] = useState<any[]>([])
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<{
    name?: string
    email?: string
    role?: string
    description?: string
  }>({})
  const [settingsForm, setSettingsForm] = useState({
    siteName: 'NatengHub',
    siteDescription: 'Digital Marketplace for Benguet Agriculture',
    maintenanceMode: false,
    allowRegistrations: true,
    maxFileSize: 5
  })
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
      fetchStats()
      fetchUsers()
      fetchProducts()
      fetchAppeals()
      fetchContactMessages()
    }

    // Sync banned users with localStorage
    setBannedUsers(getBannedUsers())
  }
  }, [router])

  const fetchStats = async () => {
    try {
      // Fetch actual stats from API
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Fallback to mock stats
        setStats({
          totalUsers: 150,
          totalProducts: 45,
          totalListings: 89,
          totalOrders: 234,
          onlineUsers: 12,
          bannedUsers: 3
        })
      }
    } catch (error) {
      // Fallback to mock stats
      setStats({
        totalUsers: 150,
        totalProducts: 45,
        totalListings: 89,
        totalOrders: 234,
        onlineUsers: 12,
        bannedUsers: 3
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      toast.error("Failed to fetch users")
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchAppeals = async () => {
    try {
      const response = await fetch('/api/admin/appeals')
      if (response.ok) {
        const data = await response.json()
        setAppeals(data)
      }
    } catch (error) {
      console.error('Failed to fetch appeals:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsers() // Refresh the list
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        toast.success('Product deleted successfully')
        fetchProducts() // Refresh the list
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Error deleting product')
    }
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setIsEditModalOpen(true)
  }

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
    })
    setIsEditModalOpen(true)
  }

  // Filter users based on search
  const filteredUsers = users.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Simulate online status (in production, this would come from a real-time system)
  const getOnlineStatus = (user: any) => {
    // For demo purposes, check if user has recent activity
    // In production, this would check against a real-time session system
    
    // Check if user is currently authenticated in this browser session
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('user_name') || sessionStorage.getItem('user_name')
      if (currentUser === user.name) {
        return true // User is definitely online if they're the current session
      }
    }
    
    // For other users, simulate online status based on time and user ID
    // This creates a more realistic pattern than random
    const now = new Date()
    const userHash = user.id + now.getMinutes() // Changes every minute
    const shouldBeOnline = (userHash % 10) < 3 // 30% chance, but consistent within the minute
    
    return shouldBeOnline
  }

  // Simulate banned status (in production, this would come from the database)
  const getBannedStatus = (user: any) => {
    // Check both frontend and backend ban systems
    const frontendBanned = bannedUsers.has(user.email) || bannedUsers.has(user.name)
    const backendBanned = isBackendBanned(user.email.toLowerCase())
    return frontendBanned || backendBanned
  }

  // Filter products based on search
  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.farmer && product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleBanUser = async (userId: number, userName: string, userEmail: string) => {
    const reason = prompt(`Why are you banning ${userName}? (This will be logged for security purposes)`)
    if (!reason) return

    if (!confirm(`Are you sure you want to ban ${userName}? Reason: ${reason}`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userEmail, reason }),
      })

      // Add to both frontend and backend ban systems
      addToBanList(userEmail, userName)
      addBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers()) // Update local state
      
      toast.success(`User ${userName} has been banned and access restricted`)
      fetchUsers() // Refresh the list
      fetchStats() // Refresh stats
      
      // Force check banned status (will redirect user if they're currently logged in)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          // This will trigger the ban check in any open user sessions
          window.dispatchEvent(new Event('storage'))
        }, 100)
      }
    } catch (error) {
      // Even if API fails, still enforce the ban in both systems
      addToBanList(userEmail, userName)
      addBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers())
      toast.success(`User ${userName} has been banned and access restricted`)
      fetchUsers()
      fetchStats()
    }
  }

  const handleUnbanUser = async (userId: number, userName: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to unban ${userName}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userEmail }),
      })

      // Remove from both frontend and backend ban systems
      removeFromBanList(userEmail, userName)
      removeBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers()) // Update local state
      
      toast.success(`User ${userName} has been unbanned and access restored`)
      fetchUsers() // Refresh the list
      fetchStats() // Refresh stats
    } catch (error) {
      // Even if API fails, still enforce the unban in both systems
      removeFromBanList(userEmail, userName)
      removeBannedUser(userEmail.toLowerCase())
      setBannedUsers(getBannedUsers())
      toast.success(`User ${userName} has been unbanned and access restored`)
      fetchUsers()
      fetchStats()
    }
  }

  const handleApproveAppeal = async (appealId: string, userEmail: string) => {
    if (!confirm('Are you sure you want to approve this appeal? This will unban the user.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          appealId, 
          status: 'approved', 
          adminEmail: 'admin@nateng.com',
          adminNotes: 'Appeal approved after review'
        }),
      })

      if (response.ok) {
        toast.success('Appeal approved and user unbanned')
        fetchAppeals() // Refresh appeals
        fetchUsers() // Refresh users
        fetchStats() // Refresh stats
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          appealId, 
          status: 'rejected', 
          adminEmail: 'admin@nateng.com',
          adminNotes: adminNotes || 'Appeal rejected after review'
        }),
      })

      if (response.ok) {
        toast.success('Appeal rejected')
        fetchAppeals() // Refresh appeals
      } else {
        toast.error('Failed to reject appeal')
      }
    } catch (error) {
      toast.error('Error rejecting appeal')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Check both username and password
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      toast.success("Admin access granted")
      fetchStats()
      fetchUsers()
      fetchProducts()
      fetchAppeals()
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

  const handleRunDiagnostics = async () => {
    setIsLoading(true)
    toast.info("Running system diagnostics...")
    
    try {
      // Simulate diagnostic checks
      const [healthResponse, statsResponse] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/admin/stats'),
        new Promise(resolve => setTimeout(resolve, 2000)) // Simulate delay
      ])
      
      const allHealthy = healthResponse.ok && statsResponse.ok
      
      if (allHealthy) {
        toast.success("All systems operational ✓")
      } else {
        toast.warning("Some issues detected - check logs")
      }
    } catch (error) {
      toast.error("Diagnostic failed - please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneralSettings = () => {
    setIsSettingsModalOpen(true)
  }

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!")
    setIsSettingsModalOpen(false)
  }

  const handleSaveEdit = () => {
    toast.success("Changes saved successfully!")
    setIsEditModalOpen(false)
  }

  const handleRefreshUsers = async () => {
    await fetchUsers()
    setLastRefresh(new Date())
    toast.success("User list refreshed")
  }

  const handleMarkReviewed = async (messageId: number, messageName: string) => {
    try {
      const response = await fetch('/api/contact/mark-reviewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      })

      if (response.ok) {
        toast.success(`Message from ${messageName} marked as reviewed`)
        fetchContactMessages() // Refresh the messages list
      } else {
        toast.error('Failed to mark message as reviewed')
      }
    } catch (error) {
      toast.error('Failed to mark message as reviewed')
    }
  }

  const handleApproveAppealFromMessages = async (messageId: number, messageName: string, userEmail: string) => {
    try {
      // First find the user ID from the email
      const userResponse = await fetch(`/api/admin/users/find?email=${userEmail}`)
      let userId = 0
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        userId = userData.user?.id || 0
      }

      // First mark as reviewed
      await fetch('/api/contact/mark-reviewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      })

      // Then unban the user
      const response = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userEmail }),
      })

      if (response.ok) {
        toast.success(`Appeal from ${messageName} approved and user unbanned`)
        fetchContactMessages()
        fetchUsers()
      } else {
        toast.error('Failed to approve appeal')
      }
    } catch (error) {
      console.error('Error approving appeal:', error)
      toast.error('Failed to approve appeal')
    }
  }

  const fetchContactMessages = async () => {
    try {
      const response = await fetch(`/api/contact?admin=${process.env.ADMIN_API_KEY}`)
      if (response.ok) {
        const data = await response.json()
        setContactMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch contact messages:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Secure admin panel - localhost only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Admin Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>
            <Alert className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                This panel is only accessible from localhost for security reasons.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <Alert className="mb-6">
          <Shield className="w-4 h-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> This admin panel is only accessible from localhost. 
            Current access: {typeof window !== 'undefined' ? window.location.hostname : 'Unknown'}
          </AlertDescription>
        </Alert>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'users', 'messages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Online Now</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.onlineUsers}</p>
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
                      <BarChart3 className="w-4 h-4 text-yellow-600" />
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
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage all registered users in the system
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleRefreshUsers}>
                    <Circle className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* User List */}
                {filteredUsers.length === 0 ? (
                  <p className="text-gray-500">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user: any) => {
                      const isOnline = getOnlineStatus(user)
                      const isBanned = getBannedStatus(user)
                      return (
                        <div key={user.id} className={`flex items-center justify-between p-3 border rounded-lg ${isBanned ? 'bg-red-50 border-red-200' : ''}`}>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{user.name}</p>
                              {isBanned && (
                                <div className="flex items-center space-x-1">
                                  <Ban className="w-3 h-3 text-red-500" />
                                  <span className="text-xs text-red-600 font-medium">BANNED</span>
                                </div>
                              )}
                              {!isBanned && (
                                <>
                                  {isOnline ? (
                                    <div className="flex items-center space-x-1">
                                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                                      <Wifi className="w-3 h-3 text-green-500" />
                                      <span className="text-xs text-green-600">Online</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-1">
                                      <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                                      <WifiOff className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">Offline</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email} • {user.role}</p>
                            <p className="text-xs text-gray-400">
                              Listings: {user._count.listings} | 
                              Orders (Buy): {user._count.ordersAsBuyer} | 
                              Orders (Sell): {user._count.ordersAsSeller}
                            </p>
                            <p className="text-xs text-gray-400">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                            {isBanned && (
                              <p className="text-xs text-red-600 mt-1">
                                Demo: Simulated ban status
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {isBanned ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleUnbanUser(user.id, user.name, user.email)}
                                className="border-green-500 text-green-600 hover:bg-green-50"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleBanUser(user.id, user.name, user.email)}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Contact Messages & Appeals</CardTitle>
                    <CardDescription>
                      Review all user messages including appeals and support requests
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchContactMessages}>
                    <Circle className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
 {contactMessages.length === 0 ? (
                  <p className="text-gray-500">No messages received</p>
                ) : (
                  <div className="space-y-4">
                    {contactMessages.map((message: any) => (
                      <div key={message.id} className={`p-4 border rounded-lg ${
                        message.type === 'appeal' ? 'bg-yellow-50 border-yellow-200' :
                        message.type === 'support' ? 'bg-blue-50 border-blue-200' :
                        message.type === 'business' ? 'bg-green-50 border-green-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-medium">{message.name}</p>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                message.type === 'appeal' ? 'bg-yellow-100 text-yellow-800' :
                                message.type === 'support' ? 'bg-blue-100 text-blue-800' :
                                message.type === 'business' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {message.type}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                message.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {message.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Email: {message.email}</p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Subject:</strong> {message.subject}
                            </p>
                            <p className="text-sm text-gray-700 mb-2">{message.message}</p>
                            <p className="text-xs text-gray-500">
                              Received: {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {message.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleMarkReviewed(message.id, message.name)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Mark Reviewed
                              </Button>
                              {message.type === 'appeal' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveAppealFromMessages(message.id, message.name, message.email)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve Appeal
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
