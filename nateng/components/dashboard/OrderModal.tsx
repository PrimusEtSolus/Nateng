"use client"

import { type Order } from "@/lib/types"
import { formatDate } from "@/lib/date-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  accentColor?: string
  accentHoverColor?: string
  managerHref?: string
  managerLabel?: string
}

export function OrderModal({
  open,
  onOpenChange,
  order,
  accentColor = "bg-farmer hover:bg-farmer/90",
  managerHref = "/farmer/orders",
  managerLabel = "Open order manager",
}: OrderModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Order from {order.buyer?.name || "Customer"}</DialogTitle>
          <DialogDescription>
            {order.items?.map((item) => `${item.listing?.product?.name || "Item"} (${item.quantity}kg)`).join(", ")}
            {order.buyer?.role && ` • Buyer: ${order.buyer.role}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground uppercase">Status</p>
              <p className="font-semibold">{order.status}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground uppercase">Total value</p>
              <p className="font-semibold">₱{((order.totalCents || 0) / 100).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-muted/60 p-4">
            <p className="text-xs text-muted-foreground uppercase mb-2">Order Items</p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.listing?.product?.name || "Item"} x {item.quantity}kg</span>
                  <span className="font-medium">
                    ₱{((item.priceCents * item.quantity) / 100).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild className={`${accentColor} text-white`}>
            <Link href={managerHref}>{managerLabel}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}