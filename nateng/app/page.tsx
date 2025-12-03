import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Leaf, ShoppingCart, Store, TrendingUp, Users, Truck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#50EAB2]">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 md:py-32 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight text-balance max-w-4xl mx-auto leading-tight">
            Fresh Vegetables From Benguet Farmers
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#064E3B] max-w-2xl mx-auto">
            Connect directly with local farmers for wholesale fresh produce. Buy, sell, and grow your agricultural
            business.
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              className="bg-white text-[#10B981] font-semibold text-xl px-8 py-6 rounded-xl shadow-lg hover:bg-white/90 hover:scale-105 transition-all"
              asChild
            >
              <Link href="/signup">Start Buying</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 card-hover">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
              <Leaf className="w-8 h-8 text-[#064E3B]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">For Farmers</h3>
            <p className="text-[#064E3B]">
              List your crops and connect with wholesale buyers directly. Set your prices and manage orders efficiently.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 card-hover">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
              <Store className="w-8 h-8 text-[#064E3B]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">For Markets</h3>
            <p className="text-[#064E3B]">
              Source fresh vegetables at wholesale prices. Build relationships with trusted local farmers.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 card-hover">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
              <ShoppingCart className="w-8 h-8 text-[#064E3B]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">For Buyers</h3>
            <p className="text-[#064E3B]">
              Shop for fresh produce from multiple farmers. Enjoy competitive prices and quality vegetables.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#064E3B] text-center mb-12">Growing Together</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-6 h-6 text-[#34D399]" />
                  <span className="text-4xl font-bold text-[#064E3B]">500+</span>
                </div>
                <p className="text-muted-foreground">Active Farmers</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Truck className="w-6 h-6 text-[#34D399]" />
                  <span className="text-4xl font-bold text-[#064E3B]">10K+</span>
                </div>
                <p className="text-muted-foreground">Orders Delivered</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6 text-[#34D399]" />
                  <span className="text-4xl font-bold text-[#064E3B]">₱50M+</span>
                </div>
                <p className="text-muted-foreground">Farmer Earnings</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
