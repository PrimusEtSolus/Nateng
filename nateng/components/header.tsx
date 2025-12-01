"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="w-full bg-[#059669]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="md" variant="light" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold text-[#064E3B] hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-lg font-semibold text-[#064E3B] hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-lg font-semibold text-[#064E3B] hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
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
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-[#064E3B]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-lg font-semibold text-[#064E3B] py-2">
                Home
              </Link>
              <Link href="/about" className="text-lg font-semibold text-[#064E3B] py-2">
                About
              </Link>
              <Link href="/contact" className="text-lg font-semibold text-[#064E3B] py-2">
                Contact
              </Link>
            </nav>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="ghost" className="bg-white/45 text-white font-semibold" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-white text-[#31E672] font-semibold" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
