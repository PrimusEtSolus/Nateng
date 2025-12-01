"use client"

import { useState } from "react"
import { mockWholesaleOrders, type WholesaleOrder } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Package, Check, X, Truck, Clock, Building2, User } from "lucide-react"

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<WholesaleOrder[]>(mockWholesaleOrders)

  const updateOrderStatus = (orderId: string, newStatus: WholesaleOrder["status"]) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
  }

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const confirmedOrders = orders.filter((o) => o.status === "confirmed")
  const readyOrders = orders.filter((o) => o.status === "ready")
  const completedOrders = orders.filter((o) => o.status === "completed")

  const OrderCard = ({ order }: { order: WholesaleOrder }) => (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {order.buyerType === "business" ? (
            <Building2 className="w-4 h-4 text-business" />
          ) : (
            <User className="w-4 h-4 text-buyer" />
          )}
          <span className="font-medium text-sm">{order.buyerName}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            order.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : order.status === "confirmed"
                ? "bg-blue-100 text-blue-700"
                : order.status === "ready"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="space-y-1.5 text-sm mb-3">
        <p className="font-medium text-foreground">{order.crop}</p>
        <div className="flex justify-between text-muted-foreground">
          <span>Quantity</span>
          <span className="font-medium text-foreground">
            {order.quantity}
            {order.unit}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Total</span>
          <span className="font-semibold text-farmer">₱{order.total.toLocaleString()}</span>
        </div>
      </div>

      {order.notes && (
        <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg mb-3 italic">&quot;{order.notes}&quot;</p>
      )}

      {order.status === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-farmer hover:bg-farmer-light text-white gap-1"
            onClick={() => updateOrderStatus(order.id, "confirmed")}
          >
            <Check className="w-4 h-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            onClick={() => updateOrderStatus(order.id, "rejected")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {order.status === "confirmed" && (
        <Button
          size="sm"
          className="w-full bg-green-600 hover:bg-green-700 text-white gap-1"
          onClick={() => updateOrderStatus(order.id, "ready")}
        >
          <Truck className="w-4 h-4" />
          Mark Ready for Pickup
        </Button>
      )}

      {order.status === "ready" && (
        <Button
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
          onClick={() => updateOrderStatus(order.id, "completed")}
        >
          <Check className="w-4 h-4" />
          Complete Order
        </Button>
      )}
    </div>
  )

  const columns = [
    { title: "Pending", orders: pendingOrders, icon: Clock, color: "text-yellow-600" },
    { title: "Confirmed", orders: confirmedOrders, icon: Check, color: "text-blue-600" },
    { title: "Ready for Pickup", orders: readyOrders, icon: Truck, color: "text-green-600" },
    { title: "Completed", orders: completedOrders, icon: Package, color: "text-gray-600" },
  ]

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
                  <p className="text-sm text-muted-foreground">No orders</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
