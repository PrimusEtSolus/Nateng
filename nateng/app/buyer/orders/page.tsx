"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle, Clock, Eye, MapPin, Phone, Star } from "lucide-react"

interface Order {
  id: string
  items: { name: string; quantity: number; price: number; image: string }[]
  farmer: { name: string; location: string; phone: string }
  total: number
  status: "processing" | "confirmed" | "in_transit" | "delivered"
  orderDate: string
  estimatedDelivery?: string
  deliveredDate?: string
  trackingId?: string
}

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    items: [
      { name: "Fresh Highland Tomatoes", quantity: 5, price: 75, image: "/ripe-tomatoes.png" },
      { name: "Crisp Benguet Cabbage", quantity: 3, price: 50, image: "/fresh-cabbage.png" },
    ],
    farmer: { name: "Juan Dela Cruz", location: "La Trinidad, Benguet", phone: "+63 917 123 4567" },
    total: 525,
    status: "delivered",
    orderDate: "2024-11-25",
    deliveredDate: "2024-11-28",
  },
  {
    id: "ORD-2024-002",
    items: [{ name: "Sweet Highland Carrots", quantity: 2, price: 55, image: "/bunch-of-carrots.png" }],
    farmer: { name: "Pedro Farmer", location: "Atok, Benguet", phone: "+63 918 234 5678" },
    total: 110,
    status: "in_transit",
    orderDate: "2024-11-30",
    estimatedDelivery: "2024-12-02",
    trackingId: "TRK-12345678",
  },
  {
    id: "ORD-2024-003",
    items: [
      { name: "Colorful Bell Peppers", quantity: 1, price: 140, image: "/colorful-bell-peppers.png" },
      { name: "Fresh Iceberg Lettuce", quantity: 2, price: 95, image: "/fresh-lettuce.png" },
    ],
    farmer: { name: "Maria Farmer", location: "Buguias, Benguet", phone: "+63 919 345 6789" },
    total: 330,
    status: "confirmed",
    orderDate: "2024-12-01",
    estimatedDelivery: "2024-12-04",
  },
  {
    id: "ORD-2024-004",
    items: [{ name: "Purple Eggplant", quantity: 3, price: 65, image: "/single-ripe-eggplant.png" }],
    farmer: { name: "Juan Dela Cruz", location: "La Trinidad, Benguet", phone: "+63 917 123 4567" },
    total: 195,
    status: "processing",
    orderDate: "2024-12-01",
  },
]

const statusConfig = {
  processing: { label: "Processing", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: Package },
}

export default function BuyerOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<string>("all")

  const filteredOrders = filter === "all" ? mockOrders : mockOrders.filter((order) => order.status === filter)

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
          { key: "processing", label: "Processing" },
          { key: "confirmed", label: "Confirmed" },
          { key: "in_transit", label: "In Transit" },
          { key: "delivered", label: "Delivered" },
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon
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
                        <p className="font-mono text-sm text-muted-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ordered on{" "}
                          {new Date(order.orderDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusConfig[order.status].color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig[order.status].label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-xl bg-muted border-2 border-card overflow-hidden">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
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
                          {order.items.length} item{order.items.length > 1 ? "s" : ""} from {order.farmer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.farmer.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-buyer">₱{order.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedOrder.status].color}`}
                >
                  {statusConfig[selectedOrder.status].label}
                </span>
              </div>

              {/* Order Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {["processing", "confirmed", "in_transit", "delivered"].map((step, idx) => {
                    const stepOrder = ["processing", "confirmed", "in_transit", "delivered"]
                    const currentIdx = stepOrder.indexOf(selectedOrder.status)
                    const isCompleted = idx <= currentIdx
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-buyer text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-xs mt-1 text-muted-foreground capitalize">{step.replace("_", " ")}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} kg × ₱{item.price}
                      </p>
                    </div>
                    <p className="font-medium">₱{item.quantity * item.price}</p>
                  </div>
                ))}
              </div>

              {/* Farmer Info */}
              <div className="border-t border-border pt-4 mb-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">Farmer</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-medium">{selectedOrder.farmer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{selectedOrder.farmer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedOrder.farmer.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-buyer">₱{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                {selectedOrder.status === "delivered" && (
                  <Button className="w-full bg-buyer hover:bg-buyer/90">
                    <Star className="w-4 h-4 mr-2" />
                    Leave a Review
                  </Button>
                )}
                <Button variant="outline" className="w-full bg-transparent">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Farmer
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Eye className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
