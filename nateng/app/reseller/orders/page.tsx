"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import type { Order } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { formatDate } from "@/lib/date-utils"
import { ordersAPI } from "@/lib/api-client"
import { Package, Clock, CheckCircle, Truck, XCircle, Loader2, MessageSquare, UserIcon, Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageDialog } from "@/components/message-dialog"
import { toast } from "sonner"

export default function ResellerOrdersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch reseller's orders (as seller - orders from buyers)
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

  const statusConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
    PENDING: { icon: Clock, color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    CONFIRMED: { icon: CheckCircle, color: "bg-blue-100 text-blue-700", label: "Confirmed" },
    SHIPPED: { icon: Truck, color: "bg-green-100 text-green-700", label: "Shipped" },
    DELIVERED: { icon: CheckCircle, color: "bg-gray-100 text-gray-700", label: "Delivered" },
    CANCELLED: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Cancelled" },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Buyer Orders</h1>
        <p className="text-muted-foreground mt-1">Manage orders from buyers purchasing your products</p>
      </div>

      {/* Loading State */}
      {ordersLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      )}

      {/* Orders List */}
      {!ordersLoading && (
        <div className="space-y-4">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING
              const StatusIcon = status.icon
              const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
              const isPickupOrder = order.deliveryOption === 'pickup' || !order.deliveryAddress

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-teal-50 rounded-xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {order.items.map((item) => item.listing?.product?.name || "Product").join(", ")}
                          </h3>
                          <MessageDialog
                            orderId={order.id}
                            otherUserId={order.buyerId}
                            otherUserName={order.buyer?.name || 'Unknown buyer'}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] text-teal-600 hover:bg-teal-50"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Chat
                              </Button>
                            }
                          />
                        </div>
                        <p className="text-muted-foreground">
                          {totalQuantity}kg ordered by {order.buyer?.name || 'Unknown buyer'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Order #{order.id} - {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">₱{(order.totalCents / 100).toLocaleString()}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${status.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Items:</span>
                    </p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.listing?.product?.name || "Product"} x {item.quantity}kg</span>
                          <span className="font-medium">₱{(item.priceCents * item.quantity / 100).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Delivery/Pickup Information */}
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {isPickupOrder ? (
                        <>
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Pickup Order</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Delivery Order</span>
                        </>
                      )}
                    </div>
                    {isPickupOrder ? (
                      <p className="text-xs text-muted-foreground">
                        Customer will pick up this order from your location
                      </p>
                    ) : order.deliveryAddress ? (
                      <p className="text-xs text-muted-foreground">
                        Deliver to: {order.deliveryAddress}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Delivery address will be provided
                      </p>
                    )}
                  </div>
                  
                  {/* Order Actions */}
                  <div className="mt-4 pt-4 border-t border-border">
                    {order.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-1"
                          onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                          disabled={updatingStatus === order.id}
                        >
                          {updatingStatus === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Accept Order
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                          disabled={updatingStatus === order.id}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    {order.status === "CONFIRMED" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          Order is ready for {isPickupOrder ? "pickup" : "delivery"}
                        </p>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white gap-1"
                          onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                          disabled={updatingStatus === order.id}
                        >
                          {updatingStatus === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Truck className="w-4 h-4" />
                              Mark as {isPickupOrder ? "Ready for Pickup" : "Out for Delivery"}
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
                        disabled={updatingStatus === order.id}
                      >
                        {updatingStatus === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Mark as {isPickupOrder ? "Picked Up" : "Delivered"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-border">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No orders from buyers yet. Add products to inventory to receive orders!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
