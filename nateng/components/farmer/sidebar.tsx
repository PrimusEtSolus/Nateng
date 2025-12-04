"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { LayoutDashboard, Leaf, Package, BarChart3, Settings, LogOut, ChevronRight, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout, getCurrentUser } from "@/lib/auth"
import { useEffect, useState } from "react"
import type { User } from "@/lib/types"

const navItems = [
  { name: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
  { name: "My Crops", href: "/farmer/crops", icon: Leaf },
  { name: "Bulk Orders", href: "/farmer/orders", icon: Package },
  { name: "Analytics", href: "/farmer/analytics", icon: BarChart3 },
  { name: "Logistics", href: "/logistics/dashboard", icon: Truck },
]

export function FarmerSidebar() {
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
        <Link href="/farmer/dashboard" className="block">
          <Logo size="md" variant="farmer" />
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-farmer-bg text-farmer text-xs font-medium rounded-md">Farmer Portal</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-farmer-bg to-amber-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-farmer rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || "F"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{user?.name || "Farmer"}</p>
            <p className="text-xs text-muted-foreground truncate">Benguet</p>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-farmer text-white shadow-md shadow-farmer/25"
                  : "text-muted-foreground hover:bg-farmer-bg hover:text-farmer",
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
          href="/farmer/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            pathname === "/farmer/settings"
              ? "bg-farmer text-white"
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
