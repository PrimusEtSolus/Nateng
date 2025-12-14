"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { ordersAPI } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Check, X, Truck, Clock, Building2, UserIcon, Loader2, Calendar, MessageSquare, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { DeliveryScheduler } from "@/components/delivery-scheduler"
import { DeliverySchedulingDialog } from "@/components/delivery-scheduling-dialog"
import { ScheduleConfirmationDialog } from "@/components/schedule-confirmation-dialog"
import { MessageDialog } from "@/components/message-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: string
  createdAt: string
  scheduledDate?: string
  scheduledTime?: string
  route?: string | null
  truckWeightKg?: number | null
  deliveryAddress?: string | null
  isExempt?: boolean | null
  exemptionType?: string | null
  isCBD?: boolean | null
  deliverySchedule?: {
    id: number
    status: string
    proposedBy: number
    confirmedBy?: number
    scheduledDate: string
    scheduledTime: string
    route?: string
    isCBD: boolean
    truckWeightKg?: number
    deliveryAddress?: string
    notes?: string
    proposer: { id: number; name: string; email: string }
    confirmer?: { id: number; name: string; email: string }
  }
  buyer: { id: number; name: string; email: string; role: string }
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

export default function FarmerOrdersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [schedulingOrderId, setSchedulingOrderId] = useState<number | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  
  // New collaborative scheduling state
  const [proposingScheduleOrderId, setProposingScheduleOrderId] = useState<number | null>(null)
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false)
  const [confirmingSchedule, setConfirmingSchedule] = useState<any>(null)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch farmer's orders (as seller)
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus}`, {
        description: `Order #${orderId} is now ${newStatus.toLowerCase()}`,
      })
      refetchOrders()
    } catch (error: any) {
      toast.error("Failed to update order status", {
        description: error.message || "Please try again",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleCancelOrder = (orderId: number) => {
    setCancelOrderId(orderId)
    setCancelDialogOpen(true)
  }

  const confirmCancelOrder = async () => {
    if (!cancelOrderId) return
    await updateOrderStatus(cancelOrderId, "CANCELLED")
    setCancelDialogOpen(false)
    setCancelOrderId(null)
  }

  // Collaborative scheduling functions
  const handleProposeSchedule = (orderId: number) => {
    setProposingScheduleOrderId(orderId)
    setSchedulingDialogOpen(true)
  }

  const handleScheduleProposed = (schedule: any) => {
    toast.success("Delivery schedule proposed", {
      description: "Waiting for the other party to confirm",
    })
    refetchOrders()
  }

  const handleReviewSchedule = (schedule: any) => {
    setConfirmingSchedule(schedule)
    setConfirmationDialogOpen(true)
  }

  const handleScheduleActionComplete = (updatedSchedule: any) => {
    const action = updatedSchedule.status === 'confirmed' ? 'confirmed' : 'rejected'
    toast.success(`Schedule ${action}`, {
      description: `Delivery schedule has been ${action}`,
    })
    refetchOrders()
  }

  // Map database statuses to display
  const pendingOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "PENDING") || [] : []
  const confirmedOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "CONFIRMED") || [] : []
  const shippedOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "SHIPPED") || [] : []
  const deliveredOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "DELIVERED") || [] : []

  const OrderCard = ({ order }: { order: Order }) => {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const isUpdating = updatingStatus === order.id
    const hasSchedule = Boolean(order.scheduledDate || order.scheduledTime)
    const isBusinessBuyer = order.buyer.role === "business"

    return (
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {order.buyer.role === "business" ? (
              <Building2 className="w-4 h-4 text-business" />
            ) : (
              <UserIcon className="w-4 h-4 text-buyer" />
            )}
            <span className="font-medium text-sm">{order.buyer.name}</span>
            <MessageDialog
              orderId={order.id}
              otherUserId={order.buyerId}
              otherUserName={order.buyer.name}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-farmer hover:bg-farmer/10"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Chat with buyer
                </Button>
              }
            />
          </div>
          </div>

        <div className="space-y-1.5 text-sm mb-3">
          <p className="font-medium text-foreground">
            {order.items.map((item) => `${item.listing.product.name} (${item.quantity}kg)`).join(", ")}
          </p>
          <div className="flex justify-between text-muted-foreground">
            <span>Total Quantity</span>
            <span className="font-medium text-foreground">{totalQuantity}kg</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total</span>
            <span className="font-semibold text-farmer">₱{(order.totalCents / 100).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Items</span>
            <span className="font-medium text-foreground">{order.items.length}</span>
          </div>
        </div>

        {order.deliverySchedule && order.deliverySchedule.status === 'proposed' && order.deliverySchedule.proposedBy !== user?.id && (
          <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-xs text-blue-900 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Calendar className="w-3 h-3" />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold">Schedule proposed by {order.deliverySchedule.proposer.name}</span>
                  <span className="text-[11px] text-blue-800/80">Review and confirm or reject this proposal.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-blue-700/80">Date</span>
                <span className="text-[11px] font-medium">
                  {new Date(order.deliverySchedule.scheduledDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-blue-700/80">Time</span>
                <span className="text-[11px] font-medium">{order.deliverySchedule.scheduledTime}</span>
              </div>
              {order.deliverySchedule.deliveryAddress && (
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[10px] uppercase tracking-wide text-blue-700/80">Address</span>
                  <span className="text-[11px] font-medium truncate" title={order.deliverySchedule.deliveryAddress}>
                    {order.deliverySchedule.deliveryAddress}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-blue-300 bg-white/80 px-3 text-[11px] font-medium text-blue-800 hover:bg-blue-600 hover:text-white"
                onClick={() => handleReviewSchedule(order.deliverySchedule)}
              >
                Review Proposal
              </Button>
            </div>
          </div>
        )}

        {order.deliverySchedule && order.deliverySchedule.status === 'confirmed' && (
          <div className="mb-3 rounded-xl border border-green-100 bg-green-50/80 p-3 text-xs text-green-900 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold">Delivery schedule confirmed</span>
                  <span className="text-[11px] text-green-800/80">Both parties have agreed on this schedule.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-green-700/80">Date</span>
                <span className="text-[11px] font-medium">
                  {new Date(order.deliverySchedule.scheduledDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-green-700/80">Time</span>
                <span className="text-[11px] font-medium">{order.deliverySchedule.scheduledTime}</span>
              </div>
              {order.deliverySchedule.deliveryAddress && (
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[10px] uppercase tracking-wide text-green-700/80">Address</span>
                  <span className="text-[11px] font-medium truncate" title={order.deliverySchedule.deliveryAddress}>
                    {order.deliverySchedule.deliveryAddress}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {order.status === "PENDING" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-farmer hover:bg-farmer-light text-white gap-1"
              onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Accept
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              onClick={() => handleCancelOrder(order.id)}
              disabled={isUpdating}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {order.status === "CONFIRMED" && !order.deliverySchedule && (
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1"
              onClick={() => handleProposeSchedule(order.id)}
            >
              <Calendar className="w-4 h-4" />
              Propose Delivery Schedule
            </Button>
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-1"
              onClick={() => updateOrderStatus(order.id, "SHIPPED")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Mark as Shipped
                </>
              )}
            </Button>
          </div>
        )}

        {order.status === "SHIPPED" && (
          <Button
            size="sm"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            onClick={() => updateOrderStatus(order.id, "DELIVERED")}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Mark as Delivered
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  const columns = [
    { title: "Pending", orders: pendingOrders, icon: Clock, color: "text-yellow-600" },
    { title: "Confirmed", orders: confirmedOrders, icon: Check, color: "text-blue-600" },
    { title: "Shipped", orders: shippedOrders, icon: Truck, color: "text-green-600" },
    { title: "Delivered", orders: deliveredOrders, icon: Package, color: "text-gray-600" },
  ]

  if (ordersLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Bulk Orders</h1>
        <p className="text-muted-foreground mt-1">Manage incoming wholesale orders from markets and businesses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {columns.map((col) => (
          <div key={col.title} className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <col.icon className={`w-5 h-5 ${col.color}`} />
              <span className="text-sm text-muted-foreground">{col.title}</span>
            </div>
            <p className="text-2xl font-bold">{col.orders.length}</p>
          </div>
        ))}
      </div>

      {/* Order Columns - Kanban Style */}
      <div className="grid grid-cols-4 gap-6">
        {columns.map((col) => (
          <div key={col.title}>
            <div className="flex items-center gap-2 mb-4">
              <col.icon className={`w-5 h-5 ${col.color}`} />
              <h2 className="font-semibold text-foreground">{col.title}</h2>
              <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {col.orders.length}
              </span>
            </div>
            <div className="space-y-4">
              {col.orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {col.orders.length === 0 && (
                <div className="bg-muted/50 rounded-xl border border-dashed border-border p-6 text-center">
                  <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No {col.title.toLowerCase()} orders</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Order"
        description={`Are you sure you want to cancel order #${cancelOrderId}? This action cannot be undone.`}
        onConfirm={confirmCancelOrder}
        variant="destructive"
      />

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
    </div>
  )
}
