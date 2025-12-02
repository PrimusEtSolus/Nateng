"use client"

import { Button } from "@/components/ui/button"

export function ContactForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    
    // Show success message (in production, send to backend)
    alert(`Thank you for contacting us, ${name}! We'll get back to you at ${email} soon.`)
    
    // Reset form
    e.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input 
            type="text" 
            name="name"
            placeholder="Your name" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#31E672]" 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input 
            type="email" 
            name="email"
            placeholder="your@email.com" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#31E672]" 
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea 
          name="message"
          placeholder="Your message" 
          rows={4} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#31E672]"
          required
        ></textarea>
      </div>
      <Button className="w-full bg-[#31E672] hover:bg-[#28c85d] text-gray-900 font-semibold">
        Send Message
      </Button>
    </form>
  )
}
