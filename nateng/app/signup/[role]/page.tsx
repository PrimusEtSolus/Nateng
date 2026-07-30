"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, ShoppingCart, Store, Leaf } from "lucide-react"
import { register } from "@/lib/auth"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"

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

export default function SignupAuthPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form data — only auth fields, no profile fields
  const [formData, setFormData] = useState({
    email: "",      // Used for buyer/bulkBuyer (email) or farmer (mobile number)
    password: "",
    confirmPassword: "",
  })

  // Validate role
  if (!validRoles.includes(role as UserRole)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Invalid Role</h1>
          <p className="text-slate-600 mb-6">The role "{role}" is not valid.</p>
          <Link href="/signup">
            <Button>Back to Role Selection</Button>
          </Link>
        </div>
      </div>
    )
  }

  const userRole = role as UserRole
  const config = roleConfig[userRole]!
  const isFarmer = userRole === "farmer"
  const Icon = config.icon

  // Label for the identifier field
  const identifierLabel = isFarmer ? "Mobile Number" : "Email Address"
  const identifierPlaceholder = isFarmer ? "09XXXXXXXXX" : "Enter your email address"
  const identifierType = isFarmer ? "tel" : "email"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Identifier validation
    if (isFarmer) {
      // Mobile number validation: /^09\d{9}$/
      const mobileRegex = /^09\d{9}$/
      if (!mobileRegex.test(formData.email)) {
        setError("Please enter a valid mobile number (e.g., 09123456789)")
        return
      }
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
        return
      }
    }

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      // Register with placeholder name — profile completed in onboarding step
      const user = await register(
        "New User",           // placeholder name — will be set in onboarding
        formData.email,       // email or mobile number
        formData.password,
        userRole
      )

      if (user) {
        toast.success("Account created! Let's set up your profile.")
        router.push(`/onboarding/${userRole}`)
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/signup" className="inline-flex items-center gap-2 text-slate-700 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <Logo size="md" variant="dark" />
        </Link>
      </header>

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg bg-white rounded-2xl p-8 md:p-12 shadow-md border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 ${config.iconBg} rounded-2xl flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">{config.label} Sign Up</h1>
              <p className="text-sm text-slate-500 mt-1">Step 1 of 2 — Create your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}

            {/* Identifier field — Mobile for farmer, Email for buyer/bulkBuyer */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base text-slate-900">
                {identifierLabel}
              </Label>
              <Input
                id="email"
                type={identifierType}
                placeholder={identifierPlaceholder}
                className="h-12 bg-slate-50 border-slate-200 text-base"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {isFarmer && (
                <p className="text-xs text-slate-500">Format: 09 followed by 9 digits (e.g., 09123456789)</p>
              )}
            </div>

            {/* Password field with visibility toggle */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base text-slate-900">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 8 characters)"
                  className="h-12 bg-slate-50 border-slate-200 text-base pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base text-slate-900">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="h-12 bg-slate-50 border-slate-200 text-base"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 ${config.accentColor} text-white font-semibold text-base rounded-xl mt-4`}
            >
              {isLoading ? "Creating account..." : "Continue"}
            </Button>
          </form>

          <p className="text-center mt-6 text-slate-600 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium hover:text-emerald-600">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}