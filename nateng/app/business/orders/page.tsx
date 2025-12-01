"use client"

import { useState } from "react"
import { mockWholesaleOrders, type WholesaleOrder } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone } from "lucide-react"

export default function BusinessOrdersPage() {
  const [orders] = useState<WholesaleOrder[]>(mockWholesaleOrders)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "ready" | "completed">("all")

  const filteredOrders = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab)

  const tabs = [
    { key: "all", label: "All Orders", count: orders.length },
    { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
    { key: "confirmed", label: "Confirmed", count: orders.filter((o) => o.status === "confirmed").length },
    { key: "ready", label: "Ready", count: orders.filter((o) => o.status === "ready").length },
    { key: "completed", label: "Completed", count: orders.filter((o) => o.status === "completed").length },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "ready":
        return <Truck className="w-4 h-4" />
      case "completed":
        return <Package className="w-4 h-4" />
      default:
        return <XCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-700 border-green-200"
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-red-100 text-red-700 border-red-200"
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
        {filteredOrders.map((order) => (
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
                    <h3 className="font-semibold text-lg">{order.crop}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order #{order.id} | {order.orderDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-business">₱{order.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {order.quantity}
                  {order.unit} @ ₱{order.pricePerUnit}/{order.unit}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{order.farmerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Contact Farmer</span>
                </div>
              </div>
              {order.status === "ready" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  <Truck className="w-4 h-4" />
                  Arrange Pickup
                </Button>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-1">No orders found</h3>
            <p className="text-muted-foreground">
              {activeTab === "all" ? "Start browsing wholesale products" : `No ${activeTab} orders`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
