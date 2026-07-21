"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Loader2, Package, Store } from "lucide-react"

interface Listing {
  id: number
  productId: number
  sellerId: number
  priceCents: number
  quantity: number
  available: boolean
  product: {
    id: number
    name: string
    description: string | null
    farmer: {
      id: number
      name: string
      email: string
    }
  }
}

export default function BulkBuyerInventoryPage() {
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

  // Fetch reseller's listings (inventory)
  const { data: myListings, loading: listingsLoading } = useFetch<Listing[]>(
    user ? `/api/listings?sellerId=${user.id}` : '',
    { skip: !user }
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Inventory</h1>
        <p className="text-muted-foreground mt-1">Products available for retail sale</p>
      </div>

      {listingsLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      ) : (myListings || []).length === 0 ? (
        <div className="p-8 text-center">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No inventory yet. Buy wholesale to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(myListings || []).map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{listing.product.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {listing.quantity}kg available
              </p>
              <div className="flex items-between justify-between">
                <p className="text-2xl font-bold text-teal-600">₱{(listing.priceCents / 100).toFixed(2)}/kg</p>
                <span className={`px-2 py-1 rounded-full text-xs ${listing.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {listing.available ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}