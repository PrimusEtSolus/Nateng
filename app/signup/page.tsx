import Link from "next/link"
import { Logo } from "@/components/logo"
import { ArrowLeft, ShoppingCart, Store, Leaf, Building2 } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#34D399] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          <Logo size="md" variant="light" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-12">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-white text-center mt-8 mb-12 tracking-tight">
          How will you use NatengHub?
        </h1>

        {/* Role Cards - 4 cards in grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {/* Buyer Card */}
          <div className="bg-white rounded-[40px] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#064E3B] mb-2">Buyer</h2>
            <p className="text-[#064E3B]/70 text-sm mb-6 flex-1">
              I want to buy fresh vegetables for personal consumption
            </p>
            <Link
              href="/signup/buyer"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors text-center"
            >
              Join as Buyer
            </Link>
          </div>

          {/* Reseller Card */}
          <div className="bg-white rounded-[40px] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#064E3B] mb-2">Reseller</h2>
            <p className="text-[#064E3B]/70 text-sm mb-6 flex-1">
              I own a market stall and want to buy wholesale to resell
            </p>
            <Link
              href="/signup/reseller"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors text-center"
            >
              Join as Reseller
            </Link>
          </div>

          {/* Business Card */}
          <div className="bg-white rounded-[40px] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#064E3B] mb-2">Business</h2>
            <p className="text-[#064E3B]/70 text-sm mb-6 flex-1">
              Restaurant, hotel, or institution buying wholesale for consumption
            </p>
            <Link
              href="/signup/business"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors text-center"
            >
              Join as Business
            </Link>
          </div>

          {/* Farmer Card */}
          <div className="bg-white rounded-[40px] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-amber-700" />
            </div>
            <h2 className="text-2xl font-semibold text-[#064E3B] mb-2">Farmer</h2>
            <p className="text-[#064E3B]/70 text-sm mb-6 flex-1">
              I grow vegetables and want to sell wholesale to businesses
            </p>
            <Link
              href="/signup/farmer"
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors text-center"
            >
              Join as Farmer
            </Link>
          </div>
        </div>

        <p className="text-white mt-12">
          Already have an account?{" "}
          <Link href="/login" className="underline font-medium hover:opacity-80">
            Log In
          </Link>
        </p>
      </main>
    </div>
  )
}
