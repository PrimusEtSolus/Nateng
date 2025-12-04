"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { ordersAPI } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Check, X, Truck, Clock, Building2, UserIcon, Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { DeliveryScheduler } from "@/components/delivery-scheduler"
import { MessageDialog } from "@/components/message-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: string
  createdAt: string
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

  // Map database statuses to display
  const pendingOrders = orders?.filter((o) => o.status === "PENDING") || []
  const confirmedOrders = orders?.filter((o) => o.status === "CONFIRMED") || []
  const shippedOrders = orders?.filter((o) => o.status === "SHIPPED") || []
  const deliveredOrders = orders?.filter((o) => o.status === "DELIVERED") || []

  const OrderCard = ({ order }: { order: Order }) => {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const isUpdating = updatingStatus === order.id

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
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  Message
                </Button>
              }
            />
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              order.status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : order.status === "CONFIRMED"
                  ? "bg-blue-100 text-blue-700"
                  : order.status === "SHIPPED"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>
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

        {order.status === "CONFIRMED" && (
          <div className="space-y-2">
            <Dialog open={scheduleDialogOpen && schedulingOrderId === order.id} onOpenChange={(open) => {
              setScheduleDialogOpen(open)
              if (!open) setSchedulingOrderId(null)
            }}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1"
                  onClick={() => {
                    setSchedulingOrderId(order.id)
                    setScheduleDialogOpen(true)
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Delivery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule Delivery - Order #{order.id}</DialogTitle>
                </DialogHeader>
                <DeliveryScheduler
                  orderId={order.id}
                  onSchedule={async (scheduleData) => {
                    try {
                      const response = await fetch(`/api/orders/${order.id}/schedule`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(scheduleData),
                      })
                      if (!response.ok) throw new Error('Failed to schedule delivery')
                      toast.success("Delivery scheduled successfully!")
                      setScheduleDialogOpen(false)
                      setSchedulingOrderId(null)
                    } catch (error: any) {
                      toast.error(error.message || "Failed to schedule delivery")
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
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
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        onConfirm={confirmCancelOrder}
        variant="destructive"
      />
    </div>
  )
}
