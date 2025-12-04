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
  const [hasFetched, setHasFetched] = useState(false)
  const user = getCurrentUser()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !user) return

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const data = await messagesAPI.getAll(user.id, otherUserId)

        // Ensure we always work with an array
        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          console.warn("Unexpected messages payload", data)
          setMessages([])
        }
        setHasFetched(true)
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
      <DialogContent className="max-w-2xl h-[560px] flex flex-col p-0 overflow-hidden">
        <DialogHeader>
          <div className="px-6 pt-5 pb-3 border-b bg-muted/40">
            <DialogTitle className="text-base font-semibold">
              Message <span className="text-foreground">{otherUserName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs mt-1">
              {orderId ? `Conversation about order #${orderId}` : "Direct message"}
            </DialogDescription>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <div ref={scrollRef}>
            {!hasFetched && loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium mb-1">No messages yet</p>
                <p className="text-xs">Start the conversation by sending a message below.</p>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {messages.map((message) => {
                  const isSender = message.senderId === user.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-3 py-2.5 shadow-sm ${
                          isSender
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-snug break-words">{message.content}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isSender ? "text-blue-100/90" : "text-muted-foreground"
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
        <form onSubmit={handleSend} className="flex items-center gap-2 px-6 py-3 border-t bg-background">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="rounded-full h-9 w-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

