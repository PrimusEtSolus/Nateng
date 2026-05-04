import Link from "next/link"
import { Leaf } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#064E3B] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6" />
              <span className="text-xl font-semibold">NatengHub</span>
            </div>
            <p className="text-white/70 text-sm">
              Connecting Benguet farmers directly with buyers through a digital marketplace.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Users</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/signup/farmer" className="hover:text-white transition-colors">
                  Become a Farmer
                </Link>
              </li>
              <li>
                <Link href="/signup/buyer" className="hover:text-white transition-colors">
                  Sign Up as Buyer
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="mailto:hello@natenghub.com" className="hover:text-white transition-colors">
                  hello@natenghub.com
                </a>
              </li>
              <li>
                <a href="tel:+639123456789" className="hover:text-white transition-colors">
                  +63 912 345 6789
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/70 text-sm">
              © 2024 NatengHub. All rights reserved.
            </p>
            <p className="text-white/70 text-sm">
              Connecting Benguet Farmers to the World.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

