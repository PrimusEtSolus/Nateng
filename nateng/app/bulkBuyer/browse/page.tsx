"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Loader2, Package, Search } from "lucide-react"
import Link from "next/link"

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
  seller: {
    id: number
    name: string
    role: string
  }
}

export default function BulkBuyerBrowsePage() {
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

  // Fetch available listings - filtered for bulk buyers
  const { data: listings = [], loading: listingsLoading, error: listingsError } = useFetch<Listing[]>(
    '/api/listings?available=true&userRole=bulkBuyer'
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Buy Wholesale</h1>
        <p className="text-muted-foreground mt-1">Purchase fresh produce from farmers in bulk</p>
      </div>

      {listingsLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : (listings || []).length === 0 ? (
        <div className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No products available for wholesale purchase</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(listings || []).map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{listing.product.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                From {listing.product.farmer.name}
              </p>
              <div className="flex items-between justify-between">
                <div>
                  <p className="text-2xl font-bold text-teal-600">₱{(listing.priceCents / 100).toFixed(2)}/kg</p>
                  <p className="text-xs text-muted-foreground">{listing.quantity}kg available</p>
                </div>
                <Link href={`/bulkBuyer/browse/${listing.id}`}>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    View
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}