"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { RetailProduct } from "./mock-data"

export interface CartItem {
  // Support both old format (RetailProduct) and new format (Listing)
  product?: RetailProduct
  listingId?: number
  sellerId?: number
  productName: string
  sellerName: string
  quantity: number
  priceCents: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem | { listingId: number; productName: string; sellerName: string; quantity: number; priceCents: number } | RetailProduct, quantity?: number) => void
  removeFromCart: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_KEY = "natenghub_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) {
        try {
          setItems(JSON.parse(stored))
        } catch {
          setItems([])
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }
  }, [items])

  const addToCart = (itemOrProduct: CartItem | { listingId: number; productName: string; sellerName: string; quantity: number; priceCents: number } | RetailProduct, quantity: number = 1) => {
    setItems((prev) => {
      // Handle new listing format
      if ('listingId' in itemOrProduct && typeof itemOrProduct.listingId === 'number') {
        const existing = prev.find((item) => item.listingId === itemOrProduct.listingId)
        if (existing) {
          return prev.map((item) =>
            item.listingId === itemOrProduct.listingId 
              ? { ...item, quantity: item.quantity + quantity } 
              : item,
          )
        }
        return [...prev, { ...itemOrProduct, quantity }]
      }
      
      // Handle old RetailProduct format (backward compatibility)
      if ('id' in itemOrProduct && typeof itemOrProduct.id === 'string' && 'pricePerKg' in itemOrProduct) {
        const product = itemOrProduct as RetailProduct
        const existing = prev.find((item) => item.product?.id === product.id)
        if (existing) {
          return prev.map((item) =>
            item.product?.id === product.id 
              ? { ...item, quantity: item.quantity + quantity } 
              : item,
          )
        }
        return [...prev, { 
          product, 
          productName: product.name,
          sellerName: product.farmerName || "Unknown",
          priceCents: product.pricePerKg * 100,
          quantity 
        }]
      }
      
      // Handle CartItem format
      const item = itemOrProduct as CartItem
      const existing = prev.find((i) => 
        (item.listingId && i.listingId === item.listingId) ||
        (item.product?.id && i.product?.id === item.product.id)
      )
      if (existing) {
        return prev.map((i) =>
          (item.listingId && i.listingId === item.listingId) || (item.product?.id && i.product?.id === item.product.id)
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const removeFromCart = (id: string | number) => {
    setItems((prev) => prev.filter((item) => {
      if (typeof id === 'number') {
        return item.listingId !== id
      }
      return item.product?.id !== id
    }))
  }

  const updateQuantity = (id: string | number, quantity: number) => {
    // Enforce minimum order of 0.2kg for buyer portal
    const MIN_QUANTITY = 0.2
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    if (quantity < MIN_QUANTITY) {
      // Don't update if below minimum, let the UI handle validation
      return
    }
    setItems((prev) => prev.map((item) => {
      if (typeof id === 'number' && item.listingId === id) {
        return { ...item, quantity }
      }
      if (typeof id === 'string' && item.product?.id === id) {
        return { ...item, quantity }
      }
      return item
    }))
  }

  const clearCart = () => setItems([])

  const totalItems = Math.round(items.reduce((sum, item) => sum + item.quantity, 0) * 10) / 10
  const totalPrice = items.reduce((sum, item) => {
    if (item.priceCents) {
      return sum + (item.priceCents * item.quantity / 100)
    }
    if (item.product?.pricePerKg) {
      return sum + (item.product.pricePerKg * item.quantity)
    }
    return sum
  }, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
