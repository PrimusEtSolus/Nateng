"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { login, getRedirectPath } from "@/lib/auth"
import { TwoFactorVerification } from "@/components/two-factor-verification"
import { TwoFactorSetup } from "@/components/two-factor-setup"
import { MockAuthentication } from "@/components/mock-authentication"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [showMockAuth, setShowMockAuth] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Email/Mobile validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const mobileRegex = /^09\d{9}$/
    
    if (!formData.email) {
      setError("Email address or mobile number is required")
      return
    }
    
    const isEmail = emailRegex.test(formData.email)
    const isMobile = mobileRegex.test(formData.email)
    
    if (!isEmail && !isMobile) {
      setError("Please enter a valid email address (user@example.com) or mobile number (09123456789)")
      return
    }

    if (!formData.password) {
      setError("Password is required")
      return
    }

    setIsLoading(true)

    try {
      const user = await login(formData.email, formData.password)
      if (user) {
        // Check if user has 2FA enabled
        const response = await fetch('/api/two-factor/status')
        const twoFactorData = await response.json()
        
        if (twoFactorData.success && twoFactorData.status.enabled) {
          // User has 2FA enabled - show verification screen
          setPendingUser(user)
          setShowTwoFactor(true)
        } else {
          // User doesn't have 2FA - check authentication options
          if (user.role !== 'admin') { // Don't force auth on admin
            // Check if user has ever set up 2FA before
            const hasSetup2FA = localStorage.getItem(`2fa-setup-${user.id}`)
            const setupStatus = localStorage.getItem(`2fa-setup-${user.id}`)
            
            if (!hasSetup2FA && setupStatus !== 'skipped') {
              // First time user - show authentication options
              setPendingUser(user)
              setShowMockAuth(true)
              setIsLoading(false)
            } else {
              // User previously set up or skipped - proceed with normal login
              router.push(getRedirectPath(user.role))
            }
          } else {
            // Admin user - proceed with normal login
            router.push(getRedirectPath(user.role))
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleTwoFactorSuccess = () => {
    setShowTwoFactor(false)
    setPendingUser(null)
    setIsLoading(false)
    router.push(getRedirectPath(pendingUser.role))
  }

  const handleTwoFactorSetup = () => {
    setShowTwoFactorSetup(true)
    setShowTwoFactor(false)
  }

  const handleTwoFactorSetupComplete = () => {
    setShowTwoFactorSetup(false)
    setPendingUser(null)
    setIsLoading(false)
    
    // Mark that user has set up 2FA
    if (pendingUser) {
      localStorage.setItem(`2fa-setup-${pendingUser.id}`, 'true')
    }
    
    // After setting up 2FA, proceed with normal login
    router.push(getRedirectPath(pendingUser.role))
  }

  const handleMockAuthSuccess = () => {
    setShowMockAuth(false)
    setPendingUser(null)
    setIsLoading(false)
    
    // Mark that user has completed authentication
    if (pendingUser) {
      localStorage.setItem(`2fa-setup-${pendingUser.id}`, 'true')
    }
    
    router.push(getRedirectPath(pendingUser.role))
  }

  return (
    <div className="min-h-screen bg-[#50EAB2] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <Logo size="md" variant="light" />
        </Link>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg bg-white rounded-[50px] p-8 md:p-12 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-center text-foreground mb-8">LOGIN</h1>

          {!showTwoFactor && !showTwoFactorSetup && !showMockAuth ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg text-foreground">
                  Email Address or Mobile Number
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter email or mobile number"
                  className="h-14 bg-muted border-border text-lg"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-14 bg-muted border-border text-lg pr-12"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[#34D399] hover:bg-[#10B981] text-white font-semibold text-xl rounded-full mt-8"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          ) : null}

          <p className="text-center mt-6 text-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="underline font-medium hover:text-[#34D399]">
              Sign Up
            </Link>
          </p>
        </div>
      </main>

      {/* 2FA Verification Modal */}
      {showTwoFactor && pendingUser && (
        <TwoFactorVerification
          isOpen={showTwoFactor}
          onClose={() => setShowTwoFactor(false)}
          onSuccess={handleTwoFactorSuccess}
          userId={pendingUser.id}
          userName={pendingUser.name}
        />
      )}

      {/* Mock Authentication Modal */}
      {showMockAuth && pendingUser && (
        <MockAuthentication
          isOpen={showMockAuth}
          onClose={() => setShowMockAuth(false)}
          onSuccess={handleMockAuthSuccess}
          userName={pendingUser.name}
        />
      )}

      {/* 2FA Setup Modal */}
      {showTwoFactorSetup && pendingUser && (
        <TwoFactorSetup
          isOpen={showTwoFactorSetup}
          onClose={() => setShowTwoFactorSetup(false)}
          onComplete={handleTwoFactorSetupComplete}
        />
      )}
    </div>
  )
}
