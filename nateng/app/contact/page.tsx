import { Header } from "@/components/header"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Mail, Phone, Clock, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <p className="text-muted-foreground mb-8">
                Reach out to us through any of these channels. We're here to help!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-border hover:shadow-md transition-all card-hover">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-muted-foreground">
                    Benguet Highlands<br />
                    Philippines
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-border hover:shadow-md transition-all card-hover">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a 
                    href="mailto:hello@natenghub.com" 
                    className="text-green-600 hover:text-green-700 hover:underline"
                  >
                    hello@natenghub.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-border hover:shadow-md transition-all card-hover">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a 
                    href="tel:+639123456789" 
                    className="text-green-600 hover:text-green-700 hover:underline"
                  >
                    +63 912 345 6789
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-border hover:shadow-md transition-all card-hover">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Need Immediate Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    For urgent matters, please call us directly or send an email with "URGENT" in the subject line.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-2">How do I sign up as a farmer?</h3>
              <p className="text-sm text-muted-foreground">
                Click on "Sign Up" and select "Farmer" as your role. Fill in your details and start listing your produce!
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-2">How does delivery work?</h3>
              <p className="text-sm text-muted-foreground">
                We use a smart logistics system that complies with Baguio City truck ban regulations. Delivery schedules are optimized for efficiency.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We currently support cash on delivery and bank transfers. More payment options coming soon!
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-2">Can I track my order?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Once your order is confirmed, you can track its status in your orders page.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

