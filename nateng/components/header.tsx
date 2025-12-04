"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, logout, getRedirectPath } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { NotificationBell } from "./notifications"

function getDashboardPath(role: string): string {
  return getRedirectPath(role as any) || "/"
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser> | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/")
  }

  return (
    <header className="w-full bg-[#059669]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link 
            href={mounted && user ? getDashboardPath(user.role) : "/"} 
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Logo size="md" variant="light" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold text-[#064E3B] hover:text-white transition-all duration-200 hover:scale-105">
              Home
            </Link>
            <Link href="/about" className="text-lg font-semibold text-[#064E3B] hover:text-white transition-all duration-200 hover:scale-105">
              About
            </Link>
            <Link href="/contact" className="text-lg font-semibold text-[#064E3B] hover:text-white transition-all duration-200 hover:scale-105">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {!mounted ? (
              <div className="w-32 h-10 bg-white/20 animate-pulse rounded" />
            ) : user ? (
              <>
                <NotificationBell />
                <Button
                  variant="ghost"
                  className="bg-white/45 text-white font-semibold text-sm px-4 hover:bg-white/60"
                  asChild
                >
                  <Link href={getDashboardPath(user.role)}>Dashboard</Link>
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{user.name}</span>
                  <Button
                    variant="ghost"
                    className="bg-white/45 text-white font-semibold text-sm px-4 hover:bg-white/60"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="bg-white/45 text-white font-semibold text-lg px-6 hover:bg-white/60 shadow-md"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="bg-white text-[#31E672] font-semibold text-lg px-6 hover:bg-white/90" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-[#064E3B] hover:bg-white/20 rounded-lg transition-colors" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/" 
                className="text-lg font-semibold text-[#064E3B] py-2 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-lg font-semibold text-[#064E3B] py-2 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-lg font-semibold text-[#064E3B] py-2 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="bg-white/45 text-white font-semibold" 
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href={getDashboardPath(user.role)}>Dashboard</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="bg-white/45 text-white font-semibold" 
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="bg-white/45 text-white font-semibold" 
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button 
                    className="bg-white text-[#31E672] font-semibold" 
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
