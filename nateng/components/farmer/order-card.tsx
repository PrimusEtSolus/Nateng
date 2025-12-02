import type { WholesaleOrder } from "@/lib/mock-data"

interface OrderCardProps {
  order: WholesaleOrder
}

const statusColors = {
  pending: { bg: "bg-yellow-300", text: "pending" },
  confirmed: { bg: "bg-indigo-400", text: "confirmed" },
  ready: { bg: "bg-green-400", text: "ready" },
  completed: { bg: "bg-green-500", text: "completed" },
  rejected: { bg: "bg-red-400", text: "rejected" },
}

export function OrderCard({ order }: OrderCardProps) {
  const status = statusColors[order.status]

  return (
    <div className="bg-white rounded-lg border border-black/40 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-black">{order.buyerName}</span>
        <span className={`${status.bg} px-3 py-0.5 rounded-full text-sm text-black`}>{status.text}</span>
      </div>
      <p className="text-sm text-black">{order.crop}</p>
      <div className="flex justify-between text-sm">
        <span className="text-black">Order Size</span>
        <span className="text-black">{order.quantity}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-black">Total</span>
        <span className="text-black">{order.total}</span>
      </div>
    </div>
  )
}
