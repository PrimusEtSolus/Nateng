"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Building2 } from "lucide-react"
import { businessTypes } from "@/lib/mock-data"
import { register, getRedirectPath } from "@/lib/auth"
import { toast } from "sonner"

export default function BusinessSignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    businessType: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.businessName) {
      setError("Business name is required")
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    
    setIsLoading(true)

    try {
      const user = await register(formData.businessName, formData.email, formData.password, "business")
      if (user) {
        toast.success("Account created successfully!")
        router.push(getRedirectPath(user.role))
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-600 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/signup" className="inline-flex items-center gap-2 text-white hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <Logo size="md" variant="light" />
        </Link>
      </header>

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Business Account</h1>
          </div>
          <p className="text-center text-muted-foreground mb-8">
            For restaurants, hotels, and institutions buying wholesale for consumption
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="business@example.com"
                className="h-12 bg-muted border-border"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-foreground">
                Business Name
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="e.g., Highland Restaurant"
                className="h-12 bg-muted border-border"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-medium text-foreground">
                Business Type
              </Label>
              <select
                id="businessType"
                className="w-full h-12 px-3 bg-muted border border-border rounded-md text-foreground"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                required
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="h-12 bg-muted border-border pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="h-12 bg-muted border-border pr-12"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-lg rounded-xl mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Business Account"}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-600 font-medium hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
