"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function BulkBuyerCartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-16 px-4">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-teal-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Start browsing wholesale products from farmers to add items</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">{items.length} item(s) in your cart</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Are you sure you want to clear your cart?")) {
                clearCart()
                toast.success("Cart cleared")
              }
            }}
            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => {
            const itemId = item.listingId || index
            const productName = item.productName || "Product"
            const sellerName = item.sellerName || "Seller"
            const pricePerKg = item.priceCents ? item.priceCents / 100 : 0
            const itemTotal = pricePerKg * item.quantity

            return (
              <div key={itemId} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{productName}</h3>
                    <p className="text-sm text-gray-600">From {sellerName}</p>
                    <p className="text-lg font-bold text-teal-700 mt-2">₱{pricePerKg.toFixed(2)}/kg</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(itemId, Math.max(0.1, item.quantity - 0.1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity.toFixed(1)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (value <= 0) {
                          removeFromCart(itemId)
                          return
                        }
                        updateQuantity(itemId, value)
                      }}
                      className="w-20 text-center"
                      min="0.1"
                      step="0.1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(itemId, item.quantity + 0.1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="ml-2 text-sm text-gray-500">kg</span>
                  </div>
                  <p className="text-lg font-semibold text-teal-700">₱{itemTotal.toFixed(2)}</p>
                </div>
              </div>
            )
          })}

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-xl font-bold text-gray-900">
                  {items.reduce((sum, item) => sum + item.quantity, 0).toFixed(1)}kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-teal-700">₱{totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <Link href="/bulkBuyer/checkout">
              <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

