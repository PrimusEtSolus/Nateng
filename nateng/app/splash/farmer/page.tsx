import Link from "next/link"
import { Leaf } from "lucide-react"

export default function FarmerSplashPage() {
  return (
    <div className="min-h-screen bg-[#34D399] flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6">
          <Leaf className="w-24 h-24 text-[#064E3B] mx-auto" />
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
            <Leaf className="w-12 h-12 text-white" />
          </div>
          <span className="text-6xl md:text-7xl font-semibold text-white tracking-tight">NatengHub</span>
        </div>
        <p className="text-white/80 text-xl mt-6">Farmer Portal</p>
      </div>
      <div className="absolute bottom-8">
        <Link
          href="/farmer/dashboard"
          className="text-white bg-white/20 px-8 py-3 rounded-lg hover:bg-white/30 transition-colors font-semibold"
        >
          Enter Dashboard
        </Link>
      </div>
    </div>
  )
}
