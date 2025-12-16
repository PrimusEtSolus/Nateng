"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState, useRef } from "react"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messageType, setMessageType] = useState("general")
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string
    const subject = formData.get("subject") as string
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          subject,
          type: messageType,
        }),
      })

      const result = await response.json()
      console.log('Contact form response:', result)

      if (response.ok) {
        if (messageType === "appeal") {
          toast.success("Appeal submitted successfully!", {
            description: `Your appeal has been received. We will review it and contact you at ${email} soon.`,
          })
        } else {
          toast.success("Message sent successfully!", {
            description: `Thank you ${name}! We'll get back to you at ${email} soon.`,
          })
        }
        
        // Reset form using ref
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        toast.error("Failed to send message", {
          description: result.error || "Please try again later.",
        })
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error("Failed to send message", {
        description: "Please try again later.",
      })
    }
    
    setIsSubmitting(false)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Message Type</label>
        <select 
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#31E672]"
        >
          <option value="general">General Inquiry</option>
          <option value="appeal">Account Appeal</option>
          <option value="support">Technical Support</option>
          <option value="business">Business Partnership</option>
        </select>
      </div>

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
          <label className="block text-sm font-medium mb-2">Email Address</label>
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
        <label className="block text-sm font-medium mb-2">Subject</label>
        <input 
          type="text" 
          name="subject"
          placeholder={messageType === "appeal" ? "Account Appeal Request" : "Message subject"} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#31E672]" 
          required
        />
      </div>

      {messageType === "appeal" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Account Appeal:</strong> Please provide details about why your account should be unbanned. Include any relevant information about your situation and what steps you've taken to address the issue.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea 
          name="message"
          placeholder={messageType === "appeal" ? "Please explain why you believe your account should be unbanned..." : "Your message"} 
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
        {isSubmitting ? "Sending..." : (messageType === "appeal" ? "Submit Appeal" : "Send Message")}
      </Button>
    </form>
  )
}
