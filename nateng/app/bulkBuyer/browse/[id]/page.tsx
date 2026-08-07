"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Loader2, ArrowLeft, Package, MapPin, User as UserIcon, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ListingDetail {
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
    imageUrl: string | null
    farmer: {
      id: number
      name: string
      email: string
      minimumOrderKg: number
    }
  }
  seller: {
    id: number
    name: string
    role: string
    email: string
    minimumOrderKg: number
    address: string | null
    city: string | null
    province: string | null
    country: string | null
  }
}

export default function BulkBuyerBrowseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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

  const { data: listing, loading, error } = useFetch<ListingDetail>(`/api/listings/${id}`)

  const handleAddToCart = async () => {
    if (!listing || !user) return
    
    const orderQuantity = parseFloat(quantity)
    if (!orderQuantity || orderQuantity <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    const minOrder = listing.seller.minimumOrderKg || listing.product.farmer.minimumOrderKg || 0
    if (minOrder > 0 && orderQuantity < minOrder) {
      toast.error(`Minimum order is ${minOrder}kg`)
      return
    }

    if (orderQuantity > listing.quantity) {
      toast.error(`Only ${listing.quantity}kg available`)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            listingId: listing.id,
            quantity: orderQuantity,
            priceCents: listing.priceCents,
          }],
          sellerId: listing.sellerId,
          notes: `Bulk order from ${listing.product.name}`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      toast.success(`Order request for ${orderQuantity}kg submitted to ${listing.product.farmer.name}!`)
      setQuantity("")
      
      // Redirect to orders page after short delay
      setTimeout(() => {
        router.push('/bulkBuyer/orders')
      }, 1500)
    } catch (err: any) {
      toast.error(err.message || "Failed to submit order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || banLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or is no longer available.</p>
          <Link href="/bulkBuyer/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/bulkBuyer/browse" className="inline-flex items-center text-teal-700 hover:text-teal-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.product.name}</h1>
              <p className="text-lg text-gray-600">From {listing.product.farmer.name}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-teal-700">₱{(listing.priceCents / 100).toFixed(2)}</p>
              <p className="text-sm text-gray-500">per kg</p>
            </div>
          </div>

          {listing.product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{listing.product.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <UserIcon className="w-5 h-5 text-teal-700 mr-2" />
                <h3 className="font-semibold text-gray-900">Seller Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Name:</span> <span className="font-medium">{listing.seller.name}</span></p>
                <p><span className="text-gray-600">Email:</span> <span className="font-medium">{listing.seller.email}</span></p>
                <p><span className="text-gray-600">Role:</span> <span className="font-medium capitalize">{listing.seller.role}</span></p>
                {listing.seller.minimumOrderKg && listing.seller.minimumOrderKg > 0 && (
                  <p><span className="text-gray-600">Min. Order:</span> <span className="font-medium">{listing.seller.minimumOrderKg}kg</span></p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-teal-700 mr-2" />
                <h3 className="font-semibold text-gray-900">Location</h3>
              </div>
              <div className="space-y-2 text-sm">
                {listing.seller.address && <p><span className="text-gray-600">Address:</span> <span className="font-medium">{listing.seller.address}</span></p>}
                {listing.seller.city && <p><span className="text-gray-600">City:</span> <span className="font-medium">{listing.seller.city}</span></p>}
                {listing.seller.province && <p><span className="text-gray-600">Province:</span> <span className="font-medium">{listing.seller.province}</span></p>}
                {listing.seller.country && <p><span className="text-gray-600">Country:</span> <span className="font-medium">{listing.seller.country}</span></p>}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{listing.quantity}kg</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  listing.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {listing.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            {listing.available && (
              <div className="bg-teal-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <ShoppingCart className="w-5 h-5 text-teal-700 mr-2" />
                  <h3 className="font-semibold text-gray-900">Place Order</h3>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="quantity" className="text-sm text-gray-700 mb-2">
                      Quantity (kg)
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder={`Max ${listing.quantity}kg`}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-12"
                      min="0"
                      max={listing.quantity}
                      step="0.1"
                    />
                  </div>
                  <div className="flex items-end">
<Button
                      onClick={handleAddToCart}
                      disabled={isSubmitting || !quantity}
                      className="h-12 px-8 bg-teal-600 hover:bg-teal-700"
                    >
                      {isSubmitting ? "Processing..." : "Order Now"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: ₱{quantity ? ((parseFloat(quantity) * listing.priceCents) / 100).toFixed(2) : '0.00'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}