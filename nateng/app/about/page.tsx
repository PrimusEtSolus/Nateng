import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Leaf } from "lucide-react"
import { Leaf, Users, TrendingUp, Award, Target, Heart } from "lucide-react"
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
              NatengHub is dedicated to reducing information asymmetry in Benguet's agricultural sector, 
              optimizing logistics through smart scheduling, and creating a multi-actor ecosystem that 
              connects farmers, resellers, businesses, and consumers. We aim to improve farmer income 
              by reducing middleman layers and providing direct market access.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all card-hover">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Farmer First</h3>
              <p className="text-muted-foreground">
                We prioritize the welfare and income of local farmers, ensuring they receive fair prices 
                and direct access to markets.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all card-hover">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-muted-foreground">
                Building a collaborative ecosystem where farmers, buyers, and businesses work together 
                for mutual benefit and sustainable growth.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all card-hover">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                Leveraging technology and data analytics to optimize logistics, reduce waste, and 
                improve the entire agricultural value chain.
              </p>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <Leaf className="w-10 h-10 text-green-600" />
                <h3 className="text-2xl font-semibold">Digital Marketplace</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A comprehensive platform where farmers can list their produce, set prices, and connect 
                directly with buyers, businesses, and resellers. No more middlemen, no more uncertainty.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <Award className="w-10 h-10 text-blue-600" />
                <h3 className="text-2xl font-semibold">Smart Logistics</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our truck ban-compliant delivery scheduling system ensures timely deliveries while 
                avoiding fines. We optimize routes and consolidate orders for maximum efficiency.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <TrendingUp className="w-10 h-10 text-amber-600" />
                <h3 className="text-2xl font-semibold">Market Intelligence</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Farmers get access to demand forecasting and crop programming dashboards, helping them 
                make informed decisions about what to plant and when to harvest.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <Users className="w-10 h-10 text-purple-600" />
                <h3 className="text-2xl font-semibold">Multi-Actor Ecosystem</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We support farmers, buyers, businesses, and resellers with role-specific portals, 
                enabling each actor to operate efficiently within the agricultural value chain.
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
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

