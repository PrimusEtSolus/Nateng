"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { getCurrentUser } from "@/lib/auth"
import { ordersAPI } from "@/lib/api-client"
import { Loader2, ArrowLeft, ShoppingCart, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { type User } from "@/lib/types"

export default function BulkBuyerCheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'bulkBuyer') {
        router.push('/login')
        return
      }
      setUser(currentUser)
      setDeliveryAddress(currentUser.address || "")
    }
    loadUser()
  }, [router])

  const totalKg = items.reduce((sum, item) => sum + item.quantity, 0)

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order")
      router.push("/login")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setIsSubmitting(true)
    try {
      // Group items by seller (one order per seller)
      const itemsBySeller = items.reduce((acc, item) => {
        if (!item.listingId || !item.sellerId) {
          throw new Error("Invalid cart item: missing listingId or sellerId")
        }
        const sellerId = item.sellerId
        if (!acc[sellerId]) {
          acc[sellerId] = []
        }
        acc[sellerId].push({
          listingId: item.listingId,
          quantity: item.quantity,
        })
        return acc
      }, {} as Record<number, Array<{ listingId: number; quantity: number }>>)

      // Create orders for each seller
      const orderPromises = Object.entries(itemsBySeller).map(([sellerId, orderItems]) =>
        ordersAPI.create({
          buyerId: user.id,
          sellerId: Number(sellerId),
          items: orderItems,
          deliveryAddress: deliveryAddress || null,
        })
      )

      if (orderPromises.length === 0) {
        throw new Error("No valid items to order")
      }

      const orders = await Promise.all(orderPromises)

      clearCart()

      if (orders.length > 1) {
        toast.success(`${orders.length} wholesale orders placed successfully!`)
      } else {
        toast.success("Wholesale order placed successfully!")
      }
      router.push('/bulkBuyer/orders')
    } catch (error: any) {
      toast.error(error.message || "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-16 px-4">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-teal-700" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checking out</p>
          <Link href="/bulkBuyer/browse">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
            <p className="text-gray-600 mt-1">{items.length} item(s) • {totalKg.toFixed(1)}kg total</p>
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
              {items.map((item, index) => {
                const itemId = item.listingId || index
                const pricePerKg = item.priceCents ? item.priceCents / 100 : 0
                return (
                  <div key={itemId} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName || "Product"}</p>
                      <p className="text-sm text-gray-600">From {item.sellerName || "Seller"}</p>
                      <p className="text-sm text-gray-500">{item.quantity}kg × ₱{pricePerKg.toFixed(2)}/kg</p>
                    </div>
                    <p className="font-semibold text-teal-700">₱{(pricePerKg * item.quantity).toFixed(2)}</p>
                  </div>
                )
              })}
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
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" className="mt-1" defaultValue={user?.city || ''} />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" placeholder="Province" className="mt-1" defaultValue={user?.province || 'Benguet'} />
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
                <p className="text-3xl font-bold text-teal-700">₱{totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
