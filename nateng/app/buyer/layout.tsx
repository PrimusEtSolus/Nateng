import type React from "react"
import { BuyerSidebar } from "@/components/buyer/sidebar"
import { CartProvider } from "@/lib/cart-context"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-muted/30">
        <BuyerSidebar />
        <main className="ml-[280px] min-h-screen">{children}</main>
      </div>
    </CartProvider>
  )
}
