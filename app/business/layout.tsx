import type React from "react"
import { BusinessSidebar } from "@/components/business/sidebar"

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <BusinessSidebar />
      <main className="ml-[280px] min-h-screen">{children}</main>
    </div>
  )
}
