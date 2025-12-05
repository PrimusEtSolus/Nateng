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
import { DeliveryScheduler } from "@/components/delivery-scheduler"
import { MessageDialog } from "@/components/message-dialog"
import { toast } from "sonner"
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Loader2, PackageCheck } from "lucide-react"

export default function BusinessOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "shipped" | "delivered">("all")
  const [schedulingOrderId, setSchedulingOrderId] = useState<number | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

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

                {hasSchedule && order.status !== "DELIVERED" && (
                  <div className="mb-3 rounded-xl border border-business/10 bg-business/5 px-4 py-3 text-xs text-business space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-business/10 text-business">
                          <Truck className="w-3 h-3" />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-business">Pickup schedule confirmed</span>
                          <span className="text-[11px] text-business/80">Your seller has a pickup schedule for this order.</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-business/70">Date</span>
                        <span className="text-[11px] font-medium">
                          {order.scheduledDate
                            ? new Date(order.scheduledDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-business/70">Time</span>
                        <span className="text-[11px] font-medium">{order.scheduledTime || "—"}</span>
                      </div>
                      {order.deliveryAddress && (
                        <div className="flex flex-col gap-0.5 col-span-2">
                          <span className="text-[10px] uppercase tracking-wide text-business/70">Address</span>
                          <span
                            className="text-[11px] font-medium truncate"
                            title={order.deliveryAddress || ''}
                          >
                            {order.deliveryAddress}
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
                  {(order.status?.toUpperCase() === "SHIPPED" || order.status?.toUpperCase() === "CONFIRMED") && (
                    <Dialog
                      open={scheduleDialogOpen && schedulingOrderId === order.id}
                      onOpenChange={(open) => {
                        setScheduleDialogOpen(open)
                        if (!open) setSchedulingOrderId(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant={hasSchedule ? "outline" : "default"}
                          className={
                            hasSchedule
                              ? "gap-2 border-business/40 text-business hover:bg-business-bg"
                              : "gap-2 bg-green-600 hover:bg-green-700 text-white"
                          }
                          onClick={() => {
                            setSchedulingOrderId(order.id)
                            setScheduleDialogOpen(true)
                          }}
                        >
                          <Truck className="w-4 h-4" />
                          {hasSchedule ? "View / Edit Pickup" : "Arrange Pickup"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Arrange Pickup - Order #{order.id}</DialogTitle>
                        </DialogHeader>
                        <DeliveryScheduler
                          orderId={order.id}
                          initialSchedule={
                            hasSchedule
                              ? {
                                  scheduledDate: order.scheduledDate || undefined,
                                  scheduledTime: order.scheduledTime || undefined,
                                  route: order.route || undefined,
                                  isCBD: order.isCBD ?? false,
                                  truckWeightKg: order.truckWeightKg ?? undefined,
                                  deliveryAddress: order.deliveryAddress || undefined,
                                  isExempt: order.isExempt ?? false,
                                  exemptionType: order.exemptionType || undefined,
                                }
                              : undefined
                          }
                          onSchedule={async (scheduleData) => {
                            try {
                              const response = await fetch(`/api/orders/${order.id}/schedule`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(scheduleData),
                              })
                              if (!response.ok) {
                                const error = await response.json().catch(() => ({}))
                                throw new Error(error.error || "Failed to arrange pickup")
                              }
                              toast.success("Pickup arranged successfully!")
                              setScheduleDialogOpen(false)
                              setSchedulingOrderId(null)
                            } catch (error: any) {
                              toast.error(error.message || "Failed to arrange pickup")
                            }
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
