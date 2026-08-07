"use client"

import { Package, Clock, CheckCircle, Truck, PackageCheck } from "lucide-react"
import { type Order } from "@/lib/types"
import { OrderCardSkeleton } from "@/components/loading-skeletons"
import { EmptyState } from "@/components/empty-state"
import { type LucideIcon } from "lucide-react"

interface OrderListProps {
  orders: Order[]
  loading: boolean
  onOrderClick: (order: Order) => void
  emptyState: {
    icon: LucideIcon
    title: string
    description: string
  }
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
  accentColor?: string
  maxItems?: number
}

function getStatusBadge(status: string) {
  const config: Record<string, { bg: string; text: string; border: string; icon: LucideIcon }> = {
    PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
    CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle },
    SHIPPED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: Truck },
    DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: PackageCheck },
  }
  const fallback = { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: Package }
  return config[status] || fallback
}

export function OrderList({
  orders,
  loading,
  onOrderClick,
  emptyState,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  accentColor = "text-farmer",
  maxItems = 4,
}: OrderListProps) {
  const displayOrders = orders.slice(0, maxItems)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className={`text-sm font-medium ${accentColor} hover:opacity-80 transition-colors`}
          >
            {viewAllLabel}
          </a>
        )}
      </div>

      {loading ? (
        <div className="p-6 space-y-4">
          {Array.from({ length: Math.min(3, maxItems) }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={emptyState.icon}
            title={emptyState.title}
            description={emptyState.description}
          />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayOrders.map((order) => {
            const firstItem = order.items?.[0]
            const productName = firstItem?.listing?.product?.name || "Order"
            const statusBadge = getStatusBadge(order.status)
            const StatusIcon = statusBadge.icon

            return (
              <div
                key={order.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 hover:translate-x-1"
                role="button"
                tabIndex={0}
                onClick={() => onOrderClick(order)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onOrderClick(order)
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {order.buyer?.name || order.seller?.name || productName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.map((item) =>
                        `${item.listing?.product?.name || "Item"} (${item.quantity}kg)`
                      ).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ₱{((order.totalCents || 0) / 100).toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {order.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}