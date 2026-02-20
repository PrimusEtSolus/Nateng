"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Store } from "lucide-react"
import { register, getRedirectPath } from "@/lib/auth"
import { toast } from "sonner"
import { TermsAndConditions } from "@/components/terms-and-conditions"

export default function ResellerSignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    stallLocation: "",
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
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      setError("Email address is required")
      return
    }
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address (e.g., user@example.com)")
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
    
    if (!termsAccepted) {
      setError("You must accept the terms and conditions to continue")
      return
    }
    
    setIsLoading(true)

    try {
      const user = await register(formData.businessName, formData.email, formData.password, "reseller", formData.stallLocation)
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
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-teal-600 flex flex-col">
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
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-teal-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reseller Account</h1>
          </div>
          <p className="text-center text-muted-foreground mb-8">
            For market stall owners and stores buying wholesale to resell to consumers
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
                placeholder="store@example.com"
                className="h-12 bg-muted border-border"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-foreground">
                Store/Market Name
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="e.g., Green Market Co"
                className="h-12 bg-muted border-border"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stallLocation" className="text-sm font-medium text-foreground">
                Market/Stall Location
              </Label>
              <Input
                id="stallLocation"
                type="text"
                placeholder="e.g., Baguio City Public Market, Stall 45"
                className="h-12 bg-muted border-border"
                value={formData.stallLocation}
                onChange={(e) => setFormData({ ...formData, stallLocation: e.target.value })}
                required
              />
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
              disabled={isLoading || !termsAccepted}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-lg rounded-xl mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Reseller Account"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="terms-checkbox" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>
          </div>

          <p className="text-center mt-6 text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 font-medium hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </main>

      <TermsAndConditions
        isOpen={showTerms}
        userRole="reseller"
        onAccept={() => {
          setTermsAccepted(true)
          setShowTerms(false)
        }}
        onDecline={() => {
          setTermsAccepted(false)
          setShowTerms(false)
        }}
      />
    </div>
  )
}
