import type React from "react"
import { BulkBuyerSidebar } from "@/components/bulkBuyer/sidebar"

export default function BulkBuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <BulkBuyerSidebar />
      <main className="ml-[280px] min-h-screen">{children}</main>
    </div>
  )
}