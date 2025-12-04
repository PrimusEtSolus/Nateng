"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { LayoutDashboard, ShoppingBag, Package, Store, Settings, LogOut, ChevronRight, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout, getCurrentUser } from "@/lib/auth"
import { useEffect, useState } from "react"
import type { User } from "@/lib/types"

const navItems = [
  { name: "Dashboard", href: "/reseller/dashboard", icon: LayoutDashboard },
  { name: "Buy Wholesale", href: "/reseller/wholesale", icon: ShoppingBag },
  { name: "My Inventory", href: "/reseller/inventory", icon: Store },
  { name: "Orders", href: "/reseller/orders", icon: Package },
  { name: "Sales", href: "/reseller/sales", icon: TrendingUp },
]

export function ResellerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

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
        <Link href="/reseller/dashboard" className="block">
          <Logo size="md" variant="reseller" />
        </Link>
        <div className="mt-3">
          <span className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full">
            Reseller Portal
          </span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {user?.businessName?.charAt(0) || "R"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{user?.businessName || "My Store"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.name || "Owner"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25"
                  : "text-muted-foreground hover:bg-teal-50 hover:text-teal-700",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/reseller/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            pathname === "/reseller/settings"
              ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  )
}
