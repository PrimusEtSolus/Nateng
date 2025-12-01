"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { ShoppingBag, ShoppingCart, Heart, ClipboardList, Settings, LogOut, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout, getCurrentUser } from "@/lib/auth"
import { useCart } from "@/lib/cart-context"
import { useEffect, useState } from "react"
import type { User } from "@/lib/mock-data"

const navItems = [
  { name: "Shop", href: "/buyer/dashboard", icon: ShoppingBag },
  { name: "My Cart", href: "/buyer/cart", icon: ShoppingCart, showBadge: true },
  { name: "My Orders", href: "/buyer/orders", icon: ClipboardList },
  { name: "Favorites", href: "/buyer/favorites", icon: Heart },
]

export function BuyerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const { totalItems } = useCart()

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 shadow-sm">
      {/* Logo & Portal Label */}
      <div className="p-5 border-b border-border">
        <Logo size="md" variant="buyer" />
        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-buyer-bg text-buyer text-xs font-medium rounded-md">Buyer Portal</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-buyer-bg to-orange-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-buyer rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || "B"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{user?.name || "Buyer"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-buyer text-white shadow-md shadow-buyer/25"
                  : "text-muted-foreground hover:bg-buyer-bg hover:text-buyer",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.showBadge && totalItems > 0 && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    isActive ? "bg-white/20 text-white" : "bg-buyer text-white",
                  )}
                >
                  {totalItems}
                </span>
              )}
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/buyer/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            pathname === "/buyer/settings"
              ? "bg-buyer text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  )
}
