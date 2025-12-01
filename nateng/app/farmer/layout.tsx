import type React from "react"
import { FarmerSidebar } from "@/components/farmer/sidebar"

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <FarmerSidebar />
      <main className="ml-[280px] min-h-screen">{children}</main>
    </div>
  )
}
