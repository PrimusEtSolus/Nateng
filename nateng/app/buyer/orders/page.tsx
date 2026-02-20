"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { formatDateWithMonth } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle, Clock, Eye, MapPin, Phone, Star, Loader2 } from "lucide-react"
import { MessageDialog } from "@/components/message-dialog"

interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: string
  createdAt: string
  deliveryOption?: string
  deliveryAddress?: string
  buyer: { id: number; name: string; email: string; role: string }
  seller: { id: number; name: string; email: string; role: string }
  items: Array<{
    id: number
    quantity: number
    priceCents: number
    listing: {
      id: number
      product: {
        id: number
        name: string
        description: string | null
        farmer: {
          id: number
          name: string
          email: string
        }
      }
    }
  }>
}

const getStatusConfig = (status: string, isPickupOrder: boolean) => {
  const baseConfig = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    DELIVERED: { label: isPickupOrder ? "Picked Up" : "Delivered", color: "bg-green-100 text-green-700", icon: Package },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: Package },
  }
  
  // Special handling for SHIPPED status
  if (status === "SHIPPED") {
    return {
      label: isPickupOrder ? "Ready for Pickup" : "Out for Delivery",
      color: "bg-purple-100 text-purple-700", 
      icon: Truck
    }
  }
  
  return baseConfig[status as keyof typeof baseConfig] || baseConfig.PENDING
}

export default function BuyerOrdersPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch buyer's orders
  const { data: orders, loading: ordersLoading } = useFetch<Order[]>(
    user ? `/api/orders?buyerId=${user.id}` : '',
    { skip: !user }
  )

  const filteredOrders = Array.isArray(orders) ? orders.filter((order) => {
    if (filter === "all") return true
    // Map database statuses to filter
    const statusMap: Record<string, string> = {
      "processing": "PENDING",
      "confirmed": "CONFIRMED",
      "in_transit": "SHIPPED",
      "delivered": "DELIVERED",
    }
    return order.status === statusMap[filter] || order.status === filter
  }) || [] : []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track your orders and purchase history</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All Orders" },
          { key: "PENDING", label: "Pending" },
          { key: "CONFIRMED", label: "Confirmed" },
          { key: "SHIPPED", label: "Shipped" },
          { key: "DELIVERED", label: "Delivered" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            className={filter === tab.key ? "bg-buyer hover:bg-buyer/90" : ""}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {ordersLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        {!ordersLoading && (
          <div className="lg:col-span-2 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isPickupOrder = order.deliveryOption === 'pickup' || !order.deliveryAddress
                const statusInfo = getStatusConfig(order.status, isPickupOrder)
                const StatusIcon = statusInfo.icon
                return (
                  <div
                    key={order.id}
                    className={`bg-card rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                      selectedOrder?.id === order.id ? "border-buyer shadow-md" : "border-border"
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">#{order.id}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ordered on{" "}
                            {formatDateWithMonth(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-xl bg-muted border-2 border-card flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-xl bg-muted border-2 border-card flex items-center justify-center text-sm font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""} from{" "}
                            {order.seller.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.seller.role} · {order.seller.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-buyer">₱{(order.totalCents / 100).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Order Details Panel */}
        {!ordersLoading && (
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Order Details</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(selectedOrder.status, selectedOrder.deliveryOption === 'pickup' || !selectedOrder.deliveryAddress).color}`}
                  >
                    {getStatusConfig(selectedOrder.status, selectedOrder.deliveryOption === 'pickup' || !selectedOrder.deliveryAddress).label}
                  </span>
                </div>

                {/* Order Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].map((step, idx) => {
                      const stepOrder = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]
                      const currentIdx = stepOrder.indexOf(selectedOrder.status)
                      const isCompleted = idx <= currentIdx
                      const isPickupOrder = selectedOrder.deliveryOption === 'pickup' || !selectedOrder.deliveryAddress
                      
                      // Get proper label for each step
                      const getStepLabel = (step: string) => {
                        if (step === "SHIPPED") {
                          return isPickupOrder ? "Ready for Pickup" : "Out for Delivery"
                        }
                        if (step === "DELIVERED") {
                          return isPickupOrder ? "Picked Up" : "Delivered"
                        }
                        return step.toLowerCase().replace("_", " ")
                      }
                      
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? "bg-buyer text-white" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-xs mt-1 text-muted-foreground capitalize">{getStepLabel(step)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Items</h4>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                        <Package className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.listing.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} kg × ₱{(item.priceCents / 100).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">₱{((item.priceCents * item.quantity) / 100).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Seller & Farmer Info */}
                <div className="border-t border-border pt-4 mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Seller & Farmer
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-medium">
                          {selectedOrder.seller.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedOrder.seller.name} <span className="text-xs text-muted-foreground">({selectedOrder.seller.role})</span>
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {selectedOrder.seller.email}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.items[0]?.listing.product.farmer && (
                      <div className="ml-1 border-l border-border pl-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                          Source Farmer
                        </p>
                        <p className="text-sm font-medium">{selectedOrder.items[0].listing.product.farmer.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {selectedOrder.items[0].listing.product.farmer.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold text-buyer">₱{(selectedOrder.totalCents / 100).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  {selectedOrder.status === "DELIVERED" && (
                    <Button className="w-full bg-buyer hover:bg-buyer/90">
                      <Star className="w-4 h-4 mr-2" />
                      Rate Your Order
                    </Button>
                  )}
                  <MessageDialog
                    orderId={selectedOrder.id}
                    otherUserId={selectedOrder.sellerId}
                    otherUserName={selectedOrder.seller.name}
                    trigger={
                      <Button variant="outline" className="w-full bg-transparent">
                        <Phone className="w-4 h-4 mr-2" />
                        Message {selectedOrder.seller.name}
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <Eye className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">Select an order to view details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
