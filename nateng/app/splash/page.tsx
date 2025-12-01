import Link from "next/link"
import { Logo } from "@/components/logo"

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-[#31E672] flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Logo size="lg" variant="light" />
        </div>
        <p className="text-white/80 text-lg mt-4">Loading...</p>
      </div>
      <div className="absolute bottom-8">
        <Link href="/" className="text-white/60 text-sm hover:text-white">
          Continue to NatengHub
        </Link>
      </div>
    </div>
  )
}
