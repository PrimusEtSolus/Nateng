import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Users, TrendingUp, Target, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            About NatengHub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connecting Benguet farmers directly with buyers, markets, and businesses through a digital marketplace that empowers local agriculture.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <Target className="w-10 h-10 text-green-600" />
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              NatengHub connects Benguet farmers directly with buyers, reducing middleman layers and 
              improving farmer income through a digital marketplace and smart logistics system.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Farmer First</h3>
              <p className="text-muted-foreground">
                We prioritize the welfare and income of local farmers, ensuring they receive fair prices 
                and direct access to markets.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-muted-foreground">
                Building a collaborative ecosystem where farmers, buyers, and businesses work together 
                for mutual benefit.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                Leveraging technology to optimize logistics, reduce waste, and improve the agricultural value chain.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join the NatengHub Community</h2>
          <p className="text-lg mb-8 text-green-50">
            Whether you're a farmer, buyer, business, or reseller, we have a place for you.
          </p>
          <Button size="lg" className="bg-white text-green-600 hover:bg-green-50" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  )
}

