import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Package, TrendingUp, Users, ArrowRight, Leaf, ShoppingCart, Truck, Award } from "lucide-react"

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="md" variant="dark" />
            <span className="font-bold text-lg">NatengHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium text-gray-600 hover:text-gray-900">Home</a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900">About</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900">Contact</a>
          </div>
          <Link href="/login">
            <Button className="bg-[#31E672] hover:bg-[#28c85d] text-gray-900 font-semibold">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen bg-gradient-to-br from-[#31E672] via-[#50EAB2] to-emerald-300">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 80 Q 50 20 80 80%22 stroke=%22rgba(255,255,255,0.1)%22 stroke-width=%222%22 fill=%22none%22/%3E%3C/svg%3E')] opacity-30"></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Fresh From The Highlands
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-12 font-light">
              Connect directly with highland farmers and access the freshest vegetables, delivered to your door
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-[#31E672] hover:bg-gray-100 font-bold text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <a href="#about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8">
                  Learn More
                </Button>
              </a>
            </div>

            {/* Hero Image Placeholder */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-8 border-white/20 backdrop-blur-sm">
              <img 
                src="https://images.unsplash.com/photo-1488459716781-831267d37b90?w=800&h=400&fit=crop"
                alt="Highland vegetables and farmers market"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#31E672] mb-2">500+</div>
              <p className="text-gray-600 font-medium">Active Farmers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#31E672] mb-2">1000+</div>
              <p className="text-gray-600 font-medium">Fresh Products</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#31E672] mb-2">50k+</div>
              <p className="text-gray-600 font-medium">Happy Customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">About NatengHub</h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Leaf className="w-8 h-8 text-[#31E672]" />
                Our Mission
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                NatengHub connects highland farmers with buyers, cutting out middlemen to ensure fair prices and maximum freshness. We believe in supporting local agriculture while providing access to the finest highland produce.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Based in the scenic highlands of the Philippines, we're dedicated to building a sustainable marketplace that benefits everyone in the supply chain.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#31E672]/10 to-emerald-100 p-6 rounded-lg">
                <Package className="w-10 h-10 text-[#31E672] mb-4" />
                <h4 className="font-bold mb-2">Quality Assured</h4>
                <p className="text-sm text-gray-600">Hand-picked fresh produce from verified farmers</p>
              </div>
              <div className="bg-gradient-to-br from-[#31E672]/10 to-emerald-100 p-6 rounded-lg">
                <Truck className="w-10 h-10 text-[#31E672] mb-4" />
                <h4 className="font-bold mb-2">Fast Delivery</h4>
                <p className="text-sm text-gray-600">Same-day delivery to your location</p>
              </div>
              <div className="bg-gradient-to-br from-[#31E672]/10 to-emerald-100 p-6 rounded-lg">
                <TrendingUp className="w-10 h-10 text-[#31E672] mb-4" />
                <h4 className="font-bold mb-2">Fair Prices</h4>
                <p className="text-sm text-gray-600">Direct from farm to save you money</p>
              </div>
              <div className="bg-gradient-to-br from-[#31E672]/10 to-emerald-100 p-6 rounded-lg">
                <Award className="w-10 h-10 text-[#31E672] mb-4" />
                <h4 className="font-bold mb-2">Sustainability</h4>
                <p className="text-sm text-gray-600">Supporting eco-friendly farming practices</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gray-50 rounded-2xl p-12">
            <h3 className="text-2xl font-bold mb-8">Why Choose Us?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#31E672]/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#31E672]" />
                  </div>
                  <h4 className="font-bold text-lg">Community Driven</h4>
                </div>
                <p className="text-gray-600">Supporting local farmers and communities in the highlands</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#31E672]/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#31E672]" />
                  </div>
                  <h4 className="font-bold text-lg">Local Sourcing</h4>
                </div>
                <p className="text-gray-600">100% fresh produce from verified highland farms</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#31E672]/20 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-[#31E672]" />
                  </div>
                  <h4 className="font-bold text-lg">Easy Ordering</h4>
                </div>
                <p className="text-gray-600">Simple platform designed for all users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-[#31E672]/5 to-emerald-100/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Get In Touch</h2>
          <p className="text-center text-gray-600 text-lg mb-12">Have questions? We'd love to hear from you.</p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <MapPin className="w-12 h-12 text-[#31E672] mx-auto mb-4" />
              <h4 className="font-bold mb-2">Location</h4>
              <p className="text-gray-600">Benguet Highlands<br />Philippines</p>
            </div>

            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <Leaf className="w-12 h-12 text-[#31E672] mx-auto mb-4" />
              <h4 className="font-bold mb-2">Email</h4>
              <p className="text-gray-600"><a href="mailto:hello@natenghub.com" className="text-[#31E672] hover:underline">hello@natenghub.com</a></p>
            </div>

            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <Package className="w-12 h-12 text-[#31E672] mx-auto mb-4" />
              <h4 className="font-bold mb-2">Support</h4>
              <p className="text-gray-600"><a href="tel:+639123456789" className="text-[#31E672] hover:underline">+63 912 345 6789</a></p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-12 border border-gray-200">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#31E672] text-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of customers enjoying fresh highland produce</p>
          <Link href="/signup">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg px-8">
              Create Your Account Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="md" variant="light" />
              <p className="mt-4 text-sm">Connecting highland farmers with customers nationwide</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Farmers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/farmer/dashboard" className="hover:text-white">Dashboard</a></li>
                <li><a href="/farmer/crops" className="hover:text-white">Manage Crops</a></li>
                <li><a href="/farmer/orders" className="hover:text-white">Orders</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/buyer/dashboard" className="hover:text-white">Dashboard</a></li>
                <li><a href="/business/browse" className="hover:text-white">Browse Products</a></li>
                <li><a href="/buyer/orders" className="hover:text-white">My Orders</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm">&copy; 2024 NatengHub. All rights reserved. Bringing fresh highland produce to your table.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
