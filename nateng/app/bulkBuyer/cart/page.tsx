"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { Loader2, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
      farmer: {
        id: number
        name: string
      }
    }
  }
}

export default function BulkBuyerCartPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { data: cartItems = [], loading: cartLoading, error: cartError, refetch } = useFetch<CartItem[]>('/api/cart')

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
    setIsLoading(false)
  }

  const updateQuantity = async (listingId: number, newQuantity: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, quantity: newQuantity }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to update cart')
      }

      refetch()
      toast.success('Cart updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cart')
    }
  }

  const removeItem = async (listingId: number) => {
    try {
      const response = await fetch(`/api/cart?listingId=${listingId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to remove item')
      }

      refetch()
      toast.success('Item removed from cart')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item')
    }
  }

  const handleCheckout = () => {
    router.push('/buyer/checkout')
  }

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    )
  }

  if (cartError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load cart</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  const total = cartItems?.reduce((sum, item) => sum + (item.listing.priceCents * item.quantity), 0) || 0
  const totalKg = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">{cartItems.length} item(s) • {totalKg.toFixed(1)}kg total</p>
          </div>
          <Link href="/bulkBuyer/browse">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start browsing wholesale products to add items to your cart</p>
            <Link href="/bulkBuyer/browse">
              <Button className="bg-teal-600 hover:bg-teal-700">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.listing.product.name}</h3>
                    <p className="text-sm text-gray-600">From {item.listing.product.farmer.name}</p>
                    <p className="text-lg font-bold text-teal-700 mt-2">₱{(item.listing.priceCents / 100).toFixed(2)}/kg</p>
                    {item.listing.quantity < item.quantity && (
                      <p className="text-sm text-red-600 mt-1">Only {item.listing.quantity}kg available</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.listingId, Math.max(0.1, item.quantity - 0.1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.listingId, parseFloat(e.target.value) || 0)}
                        className="w-20 text-center border rounded-lg py-2"
                        min="0.1"
                        max={item.listing.quantity}
                        step="0.1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.listingId, Math.min(item.listing.quantity, item.quantity + 0.1))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.listingId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                  <p className="text-xl font-bold text-gray-900">{totalKg.toFixed(1)}kg</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-teal-700">₱{(total / 100).toFixed(2)}</p>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}