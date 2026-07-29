"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { Loader2, ArrowLeft, ShoppingCart, MapPin, User as UserIcon, CreditCard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface CartItem {
  id: number
  listingId: number
  quantity: number
  listing: {
    id: number
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
}

export default function BulkBuyerCheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { banStatus, isLoading: banLoading } = useBanEnforcement()

  const { data: cartItems = [], loading: cartLoading, error: cartError } = useFetch<CartItem[]>('/api/cart')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'bulkBuyer') {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }

  const total = cartItems.reduce((sum, item) => sum + (item.listing.priceCents * item.quantity), 0)
  const totalKg = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setIsSubmitting(true)
    try {
      // Group items by seller
      const itemsBySeller = cartItems.reduce((acc, item) => {
        const sellerId = item.listing.seller.id
        if (!acc[sellerId]) {
          acc[sellerId] = {
            sellerId,
            items: []
          }
        }
        acc[sellerId].items.push({
          listingId: item.listingId,
          quantity: item.quantity
        })
        return acc
      }, {} as any)

      // Create orders for each seller
      const orderPromises = Object.values(itemsBySeller).map(async (orderGroup: any) => {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sellerId: orderGroup.sellerId,
            items: orderGroup.items
          }),
          credentials: 'include'
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create order')
        }

        return response.json()
      })

      await Promise.all(orderPromises)

      // Clear cart
      await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include'
      })

      toast.success("Order(s) placed successfully!")
      router.push('/bulkBuyer/orders')
    } catch (error: any) {
      toast.error(error.message || "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartLoading || banLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    )
  }

  if (cartError || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checking out</p>
          <Link href="/bulkBuyer/browse">
            <Button className="bg-teal-600 hover:bg-teal-700">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/bulkBuyer/cart">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">{cartItems.length} item(s) • {totalKg.toFixed(1)}kg total</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-700" />
              Order Summary
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.listing.product.name}</p>
                    <p className="text-sm text-gray-600">From {item.listing.product.farmer.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity}kg × ₱{(item.listing.priceCents / 100).toFixed(2)}/kg</p>
                  </div>
                  <p className="font-semibold text-teal-700">₱{((item.listing.priceCents * item.quantity) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-teal-700" />
              Seller Information
            </h2>
            <div className="space-y-3">
              {Object.entries(
                cartItems.reduce((acc, item) => {
                  const sellerId = item.listing.seller.id
                  if (!acc[sellerId]) {
                    acc[sellerId] = item.listing.seller
                  }
                  return acc
                }, {} as any)
              ).map(([sellerId, seller]: [string, any]) => (
                <div key={sellerId} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{seller.name}</p>
                  <p className="text-sm text-gray-600">{seller.email}</p>
                  {seller.address && <p className="text-sm text-gray-500">{seller.address}</p>}
                  {seller.city && <p className="text-sm text-gray-500">{seller.city}, {seller.province}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              Delivery Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  placeholder="Enter delivery address"
                  className="mt-1"
                  defaultValue={user?.address || ''}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="mt-1"
                    defaultValue={user?.city || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    placeholder="Province"
                    className="mt-1"
                    defaultValue={user?.province || 'Benguet'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-700" />
              Payment Method
            </h2>
            <p className="text-gray-600">Cash on Delivery</p>
          </div>

          {/* Total and Submit */}
          <div className="bg-teal-50 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-xl font-bold text-gray-900">{totalKg.toFixed(1)}kg</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-teal-700">₱{(total / 100).toFixed(2)}</p>
              </div>
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}