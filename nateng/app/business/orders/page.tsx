"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { ordersAPI } from "@/lib/api-client"
import type { Order } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeliverySchedulingDialog } from "@/components/delivery-scheduling-dialog"
import { ScheduleConfirmationDialog } from "@/components/schedule-confirmation-dialog"
import { ViewScheduleDialog } from "@/components/view-schedule-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { MessageDialog } from "@/components/message-dialog"
import { toast } from "sonner"
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Loader2, PackageCheck, Calendar } from "lucide-react"

export default function BusinessOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "shipped" | "delivered">("all")
  const [schedulingOrderId, setSchedulingOrderId] = useState<number | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  
  // New collaborative scheduling state
  const [proposingScheduleOrderId, setProposingScheduleOrderId] = useState<number | null>(null)
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false)
  const [confirmingSchedule, setConfirmingSchedule] = useState<any>(null)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [viewingSchedule, setViewingSchedule] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // Inventory state for Move to Inventory functionality
  const [inventory, setInventory] = useState<any[]>([])
  
  // Helper function to generate inventory IDs
  const generateInventoryId = () => {
    return `inventory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Fetch orders for the logged-in business user
  const { data: orders = [], loading: ordersLoading, error: ordersError } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'business') {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }, [router])

  // Collaborative scheduling functions
  const handleProposeSchedule = (orderId: number) => {
    setProposingScheduleOrderId(orderId)
    setSchedulingDialogOpen(true)
  }

  const handleScheduleProposed = (schedule: any) => {
    toast.success("Pickup schedule proposed", {
      description: "Waiting for the seller to confirm",
    })
    // Refetch orders to update the UI
    window.location.reload()
  }

  const handleReviewSchedule = (schedule: any) => {
    console.log('handleReviewSchedule called with:', schedule)
    
    // Add comprehensive validation
    if (!schedule) {
      console.error('Schedule is null/undefined')
      toast.error("No schedule data available", {
        description: "The delivery schedule information is missing"
      })
      return
    }
    
    if (!schedule.id) {
      console.error('Schedule missing ID field:', schedule)
      console.log('Schedule keys:', Object.keys(schedule))
      
      // Try to find schedule by orderId if available
      if (schedule.orderId) {
        console.log('Attempting to find schedule by orderId:', schedule.orderId)
        // We'll handle this in the dialog with fallback logic
        setConfirmingSchedule(schedule)
        setConfirmationDialogOpen(true)
        return
      }
      
      toast.error("Invalid schedule data", {
        description: "The schedule information is missing required ID field"
      })
      return
    }
    
    console.log('Valid schedule with ID:', schedule.id)
    setConfirmingSchedule(schedule)
    setConfirmationDialogOpen(true)
  }

  const handleMoveToInventory = (order: Order) => {
    // Extract product information from the order
    const product = order.items?.[0]?.listing?.product
    if (!product) {
      toast.error("No product information found", {
        description: "Cannot add this order to inventory"
      })
      return
    }

    // Get quantity from order items
    const quantity = order.items?.[0]?.quantity || 0
    
    if (quantity <= 0) {
      toast.error("Invalid quantity", {
        description: "Cannot add zero quantity to inventory"
      })
      return
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Add ${quantity}kg of ${product.name} to your inventory?`
    )
    
    if (confirmed) {
      // Add to inventory by calling the same logic as handleAddStock
      const existingItem = inventory.find((item) => item.name.toLowerCase() === product.name.toLowerCase())
      const today = new Date().toISOString().split("T")[0]
      const supplier = order.seller?.name || "Unknown Supplier"
      
      if (existingItem) {
        // Update existing item
        setInventory((prev) =>
          prev.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  inStock: item.inStock + quantity,
                  lastUpdated: today,
                  lastOrderDate: today,
                  supplier: supplier,
                }
              : item,
          ),
        )
        toast.success("Stock updated", {
          description: `${quantity}kg added to ${existingItem.name}. Total: ${existingItem.inStock + quantity}kg`
        })
      } else {
        // Create new item
        const newItem = {
          id: generateInventoryId(),
          name: product.name,
          inStock: quantity,
          unit: "kg",
          reorderLevel: 20, // Default reorder level
          supplier: supplier,
          lastOrderDate: today,
          image: (product as any).imageUrl || "/placeholder.svg",
          lastUpdated: today,
        }
        setInventory((prev) => [...prev, newItem])
        toast.success("New item added", {
          description: `${quantity}kg of ${product.name} added to inventory.`
        })
      }
    }
  }

  const handleViewSchedule = (schedule: any) => {
    setViewingSchedule(schedule)
    setViewDialogOpen(true)
  }

  const handleScheduleActionComplete = (updatedSchedule: any) => {
    const action = updatedSchedule.status === 'confirmed' ? 'confirmed' : 'rejected'
    toast.success(`Schedule ${action}`, {
      description: `Pickup schedule has been ${action}`,
    })
    // Refetch orders to update the UI
    window.location.reload()
  }

  // Filter orders by status
  const ordersData = orders || []
  const filteredOrders = activeTab === "all" 
    ? ordersData 
    : ordersData.filter((o) => {
        const status = o.status?.toUpperCase()
        if (activeTab === "pending") return status === "PENDING"
        if (activeTab === "confirmed") return status === "CONFIRMED"
        if (activeTab === "shipped") return status === "SHIPPED"
        if (activeTab === "delivered") return status === "DELIVERED"
        return true
      })

  const tabs = [
    { key: "all", label: "All Orders", count: ordersData.length },
    { key: "pending", label: "Pending", count: ordersData.filter((o) => o.status?.toUpperCase() === "PENDING").length },
    { key: "confirmed", label: "Confirmed", count: ordersData.filter((o) => o.status?.toUpperCase() === "CONFIRMED").length },
    { key: "shipped", label: "Shipped", count: ordersData.filter((o) => o.status?.toUpperCase() === "SHIPPED").length },
    { key: "delivered", label: "Delivered", count: ordersData.filter((o) => o.status?.toUpperCase() === "DELIVERED").length },
  ]

  const getStatusIcon = (status: string) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case "PENDING":
        return <Clock className="w-3 h-3" />
      case "CONFIRMED":
        return <CheckCircle className="w-3 h-3" />
      case "SHIPPED":
        return <Truck className="w-3 h-3" />
      case "DELIVERED":
      case "COMPLETED":
        return <PackageCheck className="w-3 h-3" />
      default:
        return <XCircle className="w-3 h-3" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "SHIPPED":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-red-50 text-red-700 border-red-200"
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track and manage your wholesale purchases</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={activeTab === tab.key ? "bg-business hover:bg-business-light" : ""}
          >
            {tab.label}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? "bg-white/20" : "bg-muted"
              }`}
            >
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersLoading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="font-medium text-lg mb-1">Loading orders...</h3>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-1">No orders found</h3>
            <p className="text-muted-foreground">
              {activeTab === "all" ? "Start browsing wholesale products" : `No ${activeTab} orders`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const firstItem = order.items?.[0]
            const productName = firstItem?.listing?.product?.name || "Order"
            const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
            const sellerName = order.seller?.name || "Unknown"
            const hasSchedule = Boolean(order.scheduledDate || order.scheduledTime)
            const latestSchedule = order.deliverySchedule // Get the schedule (singular)
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-business-bg rounded-xl flex items-center justify-center">
                      <Package className="w-8 h-8 text-business" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{productName}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status || "")}`}
                        >
                          {getStatusIcon(order.status || "")}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Order #{order.id} | {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-business">
                      ₱{((order.totalCents || 0) / 100).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {totalQuantity}kg • {order.items?.length || 0} item(s)
                    </p>
                  </div>
                </div>


                {latestSchedule && latestSchedule.status === 'proposed' && latestSchedule.proposedBy !== user?.id && (
                  <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-xs text-blue-900 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <Calendar className="w-3 h-3" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold">Pickup proposed by {latestSchedule.proposer.name}</span>
                          <span className="text-[11px] text-blue-800/80">Review and confirm or reject this proposal.</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-blue-700/80">Date</span>
                        <span className="text-[11px] font-medium">
                          {new Date(latestSchedule.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-blue-700/80">Time</span>
                        <span className="text-[11px] font-medium">{latestSchedule.scheduledTime}</span>
                      </div>
                      {latestSchedule.deliveryAddress && (
                        <div className="flex flex-col gap-0.5 col-span-2">
                          <span className="text-[10px] uppercase tracking-wide text-blue-700/80">Address</span>
                          <span className="text-[11px] font-medium truncate" title={latestSchedule.deliveryAddress}>
                            {latestSchedule.deliveryAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-blue-300 bg-white/80 px-3 text-[11px] font-medium text-blue-800 hover:bg-blue-600 hover:text-white"
                        onClick={() => {
                          console.log('Review button clicked, schedule:', latestSchedule)
                          handleReviewSchedule(latestSchedule)
                        }}
                      >
                        Review Proposal
                      </Button>
                    </div>
                  </div>
                )}

                {latestSchedule && latestSchedule.status === 'confirmed' && (
                  <div className="mb-3 rounded-xl border border-green-100 bg-green-50/80 p-3 text-xs text-green-900 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold">Pickup schedule confirmed</span>
                          <span className="text-[11px] text-green-800/80">Both parties have agreed on this schedule.</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-green-300 bg-white/80 px-3 text-[11px] font-medium text-green-800 hover:bg-green-600 hover:text-white"
                        onClick={() => handleViewSchedule(latestSchedule)}
                      >
                        View Schedule
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-green-700/80">Date</span>
                        <span className="text-[11px] font-medium">
                          {new Date(latestSchedule.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-green-700/80">Time</span>
                        <span className="text-[11px] font-medium">{latestSchedule.scheduledTime}</span>
                      </div>
                      {latestSchedule.deliveryAddress && (
                        <div className="flex flex-col gap-0.5 col-span-2">
                          <span className="text-[10px] uppercase tracking-wide text-green-700/80">Address</span>
                          <span className="text-[11px] font-medium truncate" title={latestSchedule.deliveryAddress}>
                            {latestSchedule.deliveryAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{sellerName}</span>
                    </div>
                    <MessageDialog
                      orderId={order.id}
                      otherUserId={order.sellerId}
                      otherUserName={sellerName}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-business hover:bg-business-bg"
                        >
                          Chat with seller
                        </Button>
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Show Move to Inventory for delivered orders */}
                    {order.status?.toUpperCase() === "DELIVERED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={() => handleMoveToInventory(order)}
                      >
                        <PackageCheck className="w-4 h-4" />
                        Move to Inventory
                      </Button>
                    )}
                    {(order.status?.toUpperCase() === "CONFIRMED" && !latestSchedule) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleProposeSchedule(order.id)}
                      >
                        <Truck className="w-4 h-4" />
                        Propose Pickup Schedule
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Collaborative Scheduling Dialogs */}
      {proposingScheduleOrderId && (
        <DeliverySchedulingDialog
          open={schedulingDialogOpen}
          onOpenChange={setSchedulingDialogOpen}
          order={orders?.find(o => o.id === proposingScheduleOrderId)}
          user={user}
          onScheduleProposed={handleScheduleProposed}
        />
      )}

      {confirmingSchedule && (
        <ScheduleConfirmationDialog
          open={confirmationDialogOpen}
          onOpenChange={setConfirmationDialogOpen}
          schedule={confirmingSchedule}
          user={user}
          onActionComplete={handleScheduleActionComplete}
        />
      )}

      {viewingSchedule && (
        <ViewScheduleDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          schedule={viewingSchedule}
          user={user}
        />
      )}
    </div>
  )
}
