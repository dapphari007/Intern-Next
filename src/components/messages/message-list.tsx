"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  Mail, 
  MailOpen, 
  Reply, 
  Trash2,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MessageUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface Message {
  id: string
  subject: string
  content: string
  type: string
  isRead: boolean
  createdAt: Date
  sender: MessageUser
  receiver: MessageUser | null
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  type: "sent" | "received"
}

export function MessageList({ messages, currentUserId, type }: MessageListProps) {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to mark message as read")
      }

      toast({
        title: "Success",
        description: "Message marked as read",
      })

      // Refresh the page to update the read status
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return
    }

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }

      toast({
        title: "Success",
        description: "Message deleted successfully",
      })

      // Refresh the page to remove the deleted message
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const toggleExpanded = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId)
    
    // Mark as read when expanding a received message
    if (type === "received") {
      const message = messages.find(m => m.id === messageId)
      if (message && !message.isRead) {
        handleMarkAsRead(messageId)
      }
    }
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        {type === "received" ? (
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        ) : (
          <MailOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">
          No {type === "received" ? "Received" : "Sent"} Messages
        </h3>
        <p className="text-muted-foreground">
          {type === "received" 
            ? "You haven't received any messages yet." 
            : "You haven't sent any messages yet."
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isExpanded = expandedMessage === message.id
        const otherUser = type === "received" ? message.sender : message.receiver

        return (
          <Card 
            key={message.id} 
            className={`cursor-pointer transition-colors ${
              type === "received" && !message.isRead 
                ? "bg-blue-50 border-blue-200" 
                : ""
            }`}
            onClick={() => toggleExpanded(message.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {otherUser?.name?.charAt(0) || otherUser?.email.charAt(0) || "A"}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {type === "received" ? "From: " : "To: "}
                      {otherUser?.name || otherUser?.email || "All Users"}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {otherUser?.email || "Broadcast message"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {otherUser && (
                    <Badge variant="outline" className="text-xs">
                      {otherUser.role}
                    </Badge>
                  )}
                  {type === "received" && !message.isRead && (
                    <Badge variant="destructive" className="text-xs">
                      New
                    </Badge>
                  )}
                  <Badge variant={message.type === "BROADCAST" ? "secondary" : "outline"} className="text-xs">
                    {message.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">{message.subject}</h4>
              <p className={`text-sm text-muted-foreground mb-3 ${
                isExpanded ? "" : "line-clamp-2"
              }`}>
                {message.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{message.createdAt.toLocaleDateString()} at {message.createdAt.toLocaleTimeString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {type === "received" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Implement reply functionality
                        toast({
                          title: "Coming Soon",
                          description: "Reply functionality will be available soon.",
                        })
                      }}
                    >
                      <Reply className="mr-1 h-3 w-3" />
                      Reply
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-red-600 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(message.id)
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}