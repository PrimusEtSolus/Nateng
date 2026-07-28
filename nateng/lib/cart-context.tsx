"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  listingId: number
  sellerId?: number
  productName: string
  sellerName: string
  quantity: number
  priceCents: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (listingId: number) => void
  updateQuantity: (listingId: number, quantity: number) => void
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

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.listingId === item.listingId)
      if (existing) {
        return prev.map((i) =>
          i.listingId === item.listingId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        )
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (listingId: number) => {
    setItems((prev) => prev.filter((item) => item.listingId !== listingId))
  }

  const updateQuantity = (listingId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(listingId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.listingId === listingId ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => setItems([])

  const totalItems = Math.round(items.reduce((sum, item) => sum + item.quantity, 0) * 10) / 10
  const totalPrice = items.reduce((sum, item) => sum + (item.priceCents * item.quantity / 100), 0)

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