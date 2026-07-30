"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ShoppingCart, Store, Leaf, Loader2 } from "lucide-react"
import { getCurrentUser, getRedirectPath } from "@/lib/auth"
import { toast } from "sonner"
import type { UserRole, User } from "@/lib/types"

const validRoles: UserRole[] = ["buyer", "bulkBuyer", "farmer"]

interface RoleConfig {
  label: string
  icon: typeof ShoppingCart
  iconBg: string
  iconColor: string
  accentColor: string
}

const roleConfig: Partial<Record<UserRole, RoleConfig>> = {
  buyer: {
    label: "Buyer",
    icon: ShoppingCart,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accentColor: "bg-orange-500 hover:bg-orange-600",
  },
  bulkBuyer: {
    label: "Bulk Buyer",
    icon: Store,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    accentColor: "bg-teal-500 hover:bg-teal-600",
  },
  farmer: {
    label: "Farmer",
    icon: Leaf,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    accentColor: "bg-amber-500 hover:bg-amber-600",
  },
}

export default function OnboardingPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState("")

  // Form data — role-specific profile fields
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    municipality: "",
  })

  // Validate role
  if (!validRoles.includes(role as UserRole)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Invalid Role</h1>
          <p className="text-slate-600 mb-6">The role "{role}" is not valid.</p>
          <Link href="/signup">
            <Button>Back to Sign Up</Button>
          </Link>
        </div>
      </div>
    )
  }

  const userRole = role as UserRole
  const config = roleConfig[userRole]!
  const Icon = config.icon

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)
      setAuthChecking(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate name (required for all roles)
    if (!formData.name.trim()) {
      setError("Please enter your full name")
      return
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long")
      return
    }

    // Role-specific validation
    if (userRole === "bulkBuyer") {
      if (!formData.businessName.trim()) {
        setError("Please enter your business name")
        return
      }
      if (!formData.address.trim()) {
        setError("Please enter your business address")
        return
      }
    }

    if (userRole === "farmer") {
      if (!formData.municipality.trim()) {
        setError("Please enter your municipality")
        return
      }
    }

    if (!user) {
      setError("Authentication error. Please log in again.")
      return
    }

    setIsLoading(true)

    try {
      // Build update payload based on role
      const updateData: Record<string, string> = {
        name: formData.name.trim(),
      }

      if (userRole === "bulkBuyer") {
        updateData.businessName = formData.businessName.trim()
        updateData.address = formData.address.trim()
        updateData.city = formData.address.trim()
        updateData.province = "Benguet"
        updateData.country = "Philippines"
      }

      if (userRole === "farmer") {
        updateData.address = formData.municipality.trim()
        updateData.city = formData.municipality.trim()
        updateData.province = "Benguet"
        updateData.country = "Philippines"
      }

      if (userRole === "buyer") {
        updateData.city = "Baguio"
        updateData.province = "Benguet"
        updateData.country = "Philippines"
      }

      // Send PATCH request to update user profile
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update profile" }))
        throw new Error(errorData.error || "Failed to update profile")
      }

      toast.success("Profile completed! Welcome to NatengHub.")
      router.push(getRedirectPath(userRole))
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <Logo size="md" variant="dark" />
        </Link>
      </header>

      {/* Onboarding Form */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg bg-white rounded-2xl p-8 md:p-12 shadow-md border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 ${config.iconBg} rounded-2xl flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Complete Your Profile</h1>
              <p className="text-sm text-slate-500 mt-1">Step 2 of 2 — {config.label} onboarding</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}

            {/* Full Name — required for all roles */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base text-slate-900">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="h-12 bg-slate-50 border-slate-200 text-base"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Bulk Buyer: Business Name */}
            {userRole === "bulkBuyer" && (
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-base text-slate-900">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Enter your business or stall name"
                  className="h-12 bg-slate-50 border-slate-200 text-base"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>
            )}

            {/* Bulk Buyer: Location/Address */}
            {userRole === "bulkBuyer" && (
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base text-slate-900">
                  Location / Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your business address"
                  className="h-12 bg-slate-50 border-slate-200 text-base"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            )}

            {/* Farmer: Municipality */}
            {userRole === "farmer" && (
              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-base text-slate-900">
                  Municipality
                </Label>
                <Input
                  id="municipality"
                  type="text"
                  placeholder="Enter your municipality (e.g., La Trinidad)"
                  className="h-12 bg-slate-50 border-slate-200 text-base"
                  value={formData.municipality}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 ${config.accentColor} text-white font-semibold text-base rounded-xl mt-4`}
            >
              {isLoading ? "Saving profile..." : "Complete Setup"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}