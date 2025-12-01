"use client"

import { mockWholesaleOrders } from "@/lib/mock-data"
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react"

export default function ResellerOrdersPage() {
  const orders = mockWholesaleOrders.filter((o) => o.buyerId === "reseller-1")

  const statusConfig = {
    pending: { icon: Clock, color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    confirmed: { icon: CheckCircle, color: "bg-blue-100 text-blue-700", label: "Confirmed" },
    ready: { icon: Truck, color: "bg-green-100 text-green-700", label: "Ready for Pickup" },
    completed: { icon: CheckCircle, color: "bg-gray-100 text-gray-700", label: "Completed" },
    rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track your wholesale orders from farmers</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status]
          const StatusIcon = status.icon

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
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{order.crop}</h3>
                    <p className="text-muted-foreground">
                      {order.quantity}
                      {order.unit} from {order.farmerName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Order #{order.id} - {order.orderDate}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">₱{order.total.toLocaleString()}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${status.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </span>
                </div>
              </div>
              {order.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Note:</span> {order.notes}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
