"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Loader2, Package, TrendingUp } from "lucide-react"

interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: string
  createdAt: string
  items: Array<{
    id: number
    quantity: number
    priceCents: number
    listing: {
      id: number
      product: {
        id: number
        name: string
      }
    }
  }>
  buyer?: {
    id: number
    name: string
    email: string
  } | null
}

export default function BulkBuyerSalesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  
  // Check if user is banned and enforce restrictions
  const { banStatus, isLoading: banLoading } = useBanEnforcement()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'bulkBuyer') {
        router.push('/login')
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [router])

  // Fetch sales (orders where user is seller)
  const { data: salesOrders, loading: salesLoading } = useFetch<Order[]>(
    user ? `/api/orders?sellerId=${user.id}` : '',
    { skip: !user }
  )

  const totalSales = Array.isArray(salesOrders) 
    ? salesOrders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + o.totalCents, 0) || 0 
    : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Sales</h1>
        <p className="text-muted-foreground mt-1">Track your retail sales to buyers</p>
      </div>

      {salesLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground">Loading sales...</p>
        </div>
      ) : (salesOrders || []).length === 0 ? (
        <div className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No sales yet</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
            <p className="text-3xl font-bold text-emerald-600">₱{(totalSales / 100).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {(salesOrders || []).map((order) => (
                <div
                  key={order.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {order.items.map((item) => item.listing.product.name).join(", ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}kg to {order.buyer?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₱{(order.totalCents / 100).toLocaleString()}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      order.status === "SHIPPED" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}