"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message
    toast.success("Message sent successfully!", {
      description: `Thank you ${name}! We'll get back to you at ${email} soon.`,
    })
    
    // Reset form
    e.currentTarget.reset()
    setIsSubmitting(false)
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
      <Button 
        type="submit"
        className="w-full bg-[#31E672] hover:bg-[#28c85d] text-gray-900 font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
