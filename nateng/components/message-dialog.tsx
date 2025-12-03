"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { messagesAPI } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  orderId: number | null
  read: boolean
  createdAt: string
  sender: {
    id: number
    name: string
    email: string
  }
  receiver: {
    id: number
    name: string
    email: string
  }
}

interface MessageDialogProps {
  orderId?: number
  otherUserId: number
  otherUserName: string
  trigger?: React.ReactNode
}

export function MessageDialog({
  orderId,
  otherUserId,
  otherUserName,
  trigger,
}: MessageDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const user = getCurrentUser()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !user) return

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const data = await messagesAPI.getAll(user.id, otherUserId)
        setMessages(data)
        // Scroll to bottom after messages load
        setTimeout(() => {
          if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
            if (viewport) {
              viewport.scrollTop = viewport.scrollHeight
            }
          }
        }, 100)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [isOpen, user, otherUserId])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => {
        const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight
        }
      }, 100)
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    try {
      setSending(true)
      const message = await messagesAPI.send({
        senderId: user.id,
        receiverId: otherUserId,
        content: newMessage.trim(),
        orderId: orderId,
      })
      setMessages(prev => [...prev, message])
      setNewMessage("")
    } catch (error: any) {
      console.error("Failed to send message:", error)
      alert(error.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message {otherUserName}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Message {otherUserName}</DialogTitle>
          <DialogDescription>
            {orderId ? `Conversation about order #${orderId}` : "Send a message"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div ref={scrollRef}>
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => {
                const isSender = message.senderId === user.id
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isSender
                          ? "bg-blue-500 text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isSender ? "text-blue-100" : "text-muted-foreground"
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

