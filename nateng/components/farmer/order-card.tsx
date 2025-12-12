import type { Order } from "@prisma/client"

interface OrderCardProps {
  order: Order & {
    buyer: { name: string }
    items: Array<{
      id: number
      quantity: number
      listing: {
        product: { name: string }
      }
    }>
  }
}

const statusColors = {
  pending: { bg: "bg-yellow-300", text: "pending" },
  confirmed: { bg: "bg-indigo-400", text: "confirmed" },
  ready: { bg: "bg-green-400", text: "ready" },
  completed: { bg: "bg-green-500", text: "completed" },
  rejected: { bg: "bg-red-400", text: "rejected" },
}

export function OrderCard({ order }: OrderCardProps) {
  const status = statusColors[order.status as keyof typeof statusColors]

  // Get first item's product name for display
  const productName = order.items[0]?.listing?.product?.name || 'Unknown Product'
  // Calculate total quantity from all items
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-lg border border-black/40 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-black">{order.buyer.name}</span>
        <span className={`${status.bg} px-3 py-0.5 rounded-full text-sm text-black`}>{status.text}</span>
      </div>
      <p className="text-sm text-black">{productName}</p>
      <div className="flex justify-between text-sm">
        <span className="text-black">Order Size</span>
        <span className="text-black">{totalQuantity}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-black">Total</span>
        <span className="text-black">${(order.totalCents / 100).toFixed(2)}</span>
      </div>
    </div>
  )
}
