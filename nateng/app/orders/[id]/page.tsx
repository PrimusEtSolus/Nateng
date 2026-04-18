"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }

        // Redirect to user-specific order page based on role
        const orderId = params.id
        switch (user.role) {
          case "farmer":
            router.push(`/farmer/orders#${orderId}`)
            break
          case "buyer":
            router.push(`/buyer/orders#${orderId}`)
            break
          case "business":
            router.push(`/business/orders#${orderId}`)
            break
          case "reseller":
            router.push(`/reseller/orders#${orderId}`)
            break
          default:
            router.push("/")
        }
      } catch (error) {
        console.error("Error redirecting:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    redirectBasedOnRole()
  }, [router, params.id])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
