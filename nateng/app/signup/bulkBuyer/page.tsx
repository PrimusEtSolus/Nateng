"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BulkBuyerSignupRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/signup/bulkBuyer")
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Redirecting...</p>
    </div>
  )
}