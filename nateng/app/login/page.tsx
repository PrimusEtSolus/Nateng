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

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await login(formData.email, formData.password)
      if (user) {
        router.push(getRedirectPath(user.role))
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
      setIsLoading(false)
    }
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg text-foreground">
                Email Address / Mobile Number
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or mobile"
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

          <p className="text-center mt-6 text-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="underline font-medium hover:text-[#34D399]">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
