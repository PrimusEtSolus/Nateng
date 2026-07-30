"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Store, Leaf, Check } from "lucide-react"
import type { UserRole } from "@/lib/types"

const roles: Array<{
  id: UserRole
  label: string
  description: string
  icon: typeof ShoppingCart
  iconBg: string
  iconColor: string
}> = [
  {
    id: "buyer",
    label: "Buyer",
    description: "I want to buy fresh vegetables for personal consumption",
    icon: ShoppingCart,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "bulkBuyer",
    label: "Bulk Buyer",
    description: "I own a market stall or business and want to buy wholesale to resell or consume",
    icon: Store,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    id: "farmer",
    label: "Farmer",
    description: "I grow vegetables and want to sell wholesale to businesses",
    icon: Leaf,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
]

export default function SignUpPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const handleContinue = () => {
    if (!selectedRole) return
    router.push(`/signup/${selectedRole}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <Logo size="md" variant="dark" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-12">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-slate-900 text-center mt-8 mb-12 tracking-tight">
          How will you use NatengHub?
        </h1>

        {/* Role Cards - Radio-style selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {roles.map((role) => {
            const isActive = selectedRole === role.id
            const Icon = role.icon

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`relative bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-200 border-2 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                {/* Active checkmark badge */}
                {isActive && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`w-16 h-16 ${role.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-8 h-8 ${role.iconColor}`} />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">{role.label}</h2>
                <p className="text-slate-700 text-base mb-2 flex-1 leading-relaxed">
                  {role.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Single CTA */}
        <div className="w-full max-w-5xl mt-10">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>

        <p className="text-slate-600 mt-12">
          Already have an account?{" "}
          <Link href="/login" className="underline font-medium hover:text-emerald-600">
            Log In
          </Link>
        </p>
      </main>
    </div>
  )
}