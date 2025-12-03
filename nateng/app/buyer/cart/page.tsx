"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function BuyerCartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-24 h-24 bg-buyer-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-buyer" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Start shopping for fresh vegetables from Benguet farmers</p>
          <Link href="/buyer/dashboard">
            <Button className="bg-buyer hover:bg-buyer-light text-white">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const deliveryFee = totalPrice >= 500 ? 0 : 50
  const grandTotal = totalPrice + deliveryFee

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">{items.length} items in your cart</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (confirm("Are you sure you want to clear your cart?")) {
              clearCart()
            }
          }}
          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => {
            // Support both old format (product) and new format (listingId)
            const itemId = item.listingId || item.product?.id || index
            const productName = item.productName || item.product?.name || "Product"
            const sellerName = item.sellerName || item.product?.farmerName || "Seller"
            const pricePerKg = item.priceCents ? item.priceCents / 100 : (item.product?.pricePerKg || 0)
            const totalPrice = pricePerKg * item.quantity

            return (
              <div key={itemId} className="bg-white rounded-2xl border border-border p-4 shadow-sm flex gap-4 hover:shadow-md transition-all card-hover">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{productName}</h3>
                      <p className="text-sm text-muted-foreground">Sold by {sellerName}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(itemId)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}kg</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-buyer">
                        ₱{totalPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">₱{pricePerKg.toFixed(2)}/kg</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">₱{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">₱{deliveryFee}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-buyer">₱{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <Input placeholder="Enter promo code" />
              <Button variant="outline" className="w-full bg-transparent">
                Apply Code
              </Button>
            </div>

            <Link href="/buyer/checkout">
              <Button className="w-full bg-buyer hover:bg-buyer-light text-white gap-2 h-12">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground text-center mt-4">Free delivery on orders above ₱500</p>
          </div>
        </div>
      </div>
    </div>
  )
}
