"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { register, getRedirectPath } from "@/lib/auth"
import { toast } from "sonner"
import { TermsAndConditions } from "@/components/terms-and-conditions"

const BENGUET_MUNICIPALITIES = [
  "Atok",
  "Bakun",
  "Bokod",
  "Buguias",
  "Itogon",
  "Kabayan",
  "Kapangan",
  "Kibungan",
  "La Trinidad",
  "Mankayan",
  "Sablan",
  "Tuba",
  "Tublay",
]

export default function FarmerSignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    municipality: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.name) {
      setError("Name is required")
      return
    }
    
    // Mobile number validation
    const mobileRegex = /^09\d{9}$/
    if (!formData.mobileNumber) {
      setError("Mobile number is required")
      return
    }
    if (!mobileRegex.test(formData.mobileNumber)) {
      setError("Please enter a valid mobile number (e.g., 09123456789)")
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
      const user = await register(formData.name, formData.mobileNumber, formData.password, "farmer", undefined, formData.municipality)
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
    <div className="min-h-screen bg-[#50EAB2] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/signup" className="inline-flex items-center gap-2 text-white hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <Logo size="md" variant="light" />
        </Link>
      </header>

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg bg-white rounded-[50px] p-8 md:p-12 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-semibold text-center text-foreground mb-8">Farmer Form</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="h-12 bg-muted border-border text-lg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-lg text-foreground">
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Enter your mobile number (e.g., 09123456789)"
                className="h-12 bg-muted border-border text-lg"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipality" className="text-lg text-foreground">
                Municipality
              </Label>
              <Select
                value={formData.municipality}
                onValueChange={(value) => setFormData({ ...formData, municipality: value })}
              >
                <SelectTrigger className="h-12 bg-muted border-border text-lg">
                  <SelectValue placeholder="Select your municipality" />
                </SelectTrigger>
                <SelectContent>
                  {BENGUET_MUNICIPALITIES.map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="h-12 bg-muted border-border text-lg pr-12"
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
              <Label htmlFor="confirmPassword" className="text-lg text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="h-12 bg-muted border-border text-lg pr-12"
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
              className="w-full h-14 bg-[#854D0E] hover:bg-[#A16207] text-white font-semibold text-xl rounded-full mt-4"
            >
              {isLoading ? "Creating Account..." : "Create Farmer Account"}
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

          <p className="text-center mt-6 text-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium hover:text-[#854D0E]">
              Log In
            </Link>
          </p>
        </div>
      </main>

      <TermsAndConditions
        isOpen={showTerms}
        userRole="farmer"
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
