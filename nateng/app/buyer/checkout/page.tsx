"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Wallet, Building2, CheckCircle, MapPin, Truck } from "lucide-react"
import Link from "next/link"

export default function BuyerCheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  })

  const deliveryFee = totalPrice >= 500 ? 0 : 50
  const grandTotal = totalPrice + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setOrderPlaced(true)
    clearCart()
  }

  if (orderPlaced) {
    return (
      <div className="p-8">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. You will receive a confirmation shortly.
          </p>
          <div className="bg-muted p-4 rounded-xl mb-6">
            <p className="text-sm text-muted-foreground">Order Reference</p>
            <p className="text-xl font-mono font-bold">#ORD-{Date.now().toString().slice(-8)}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/buyer/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
            <Link href="/buyer/dashboard">
              <Button className="bg-buyer hover:bg-buyer-light text-white">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    router.push("/buyer/cart")
    return null
  }

  return (
    <div className="p-8">
      <Link
        href="/buyer/cart"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-buyer-bg rounded-lg">
                  <MapPin className="w-5 h-5 text-buyer" />
                </div>
                <h2 className="text-lg font-semibold">Delivery Address</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+63 917 123 4567"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Input
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House/Unit No., Street, Barangay"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Baguio City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Gate code, landmarks, etc."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-buyer-bg rounded-lg">
                  <Wallet className="w-5 h-5 text-buyer" />
                </div>
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-buyer has-[:checked]:bg-buyer-bg/50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-buyer has-[:checked]:bg-buyer-bg/50">
                  <RadioGroupItem value="gcash" id="gcash" />
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">GCash</p>
                    <p className="text-sm text-muted-foreground">Pay with your GCash wallet</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-buyer has-[:checked]:bg-buyer-bg/50">
                  <RadioGroupItem value="bank" id="bank" />
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">Transfer to our bank account</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}kg x ₱{item.product.pricePerKg}
                      </p>
                    </div>
                    <p className="text-sm font-medium">₱{(item.product.pricePerKg * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₱{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryFee === 0 ? "FREE" : `₱${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-buyer">₱{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-buyer hover:bg-buyer-light text-white h-12 gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    Place Order
                    <CreditCard className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
