import type React from "react"
import { ResellerSidebar } from "@/components/reseller/sidebar"

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResellerSidebar />
      <main className="ml-[280px]">{children}</main>
    </div>
  )
}
