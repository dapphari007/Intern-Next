"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Send, 
  Mail, 
  MailOpen,
  Plus,
  Clock,
  User,
  Loader2
} from "lucide-react"
import Link from "next/link"

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
  createdAt: string
  sender: MessageUser
  receiver: MessageUser | null
}

export function MessagePane() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchMessages()
    }
  }, [session])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/messages?limit=10')
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError('Failed to load messages')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const unreadMessages = messages.filter(msg => 
    msg.receiver?.id === session?.user?.id && !msg.isRead
  )

  const recentMessages = messages
    .filter(msg => msg.receiver?.id === session?.user?.id)
    .slice(0, 5)

  if (!session?.user) {
    return null
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <Link href="/messages">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Recent messages and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-lg font-bold">{unreadMessages.length}</div>
            <div className="text-xs text-muted-foreground">Unread</div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-lg font-bold">{messages.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Recent Messages */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Recent Messages</h4>
            <Link href="/messages">
              <Button variant="ghost" size="sm" className="text-xs h-6">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="text-center py-6">
              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      !message.isRead ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {message.sender.name?.charAt(0) || message.sender.email.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {message.sender.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {message.sender.role}
                          </p>
                        </div>
                      </div>
                      {!message.isRead && (
                        <Badge variant="destructive" className="text-xs ml-2 flex-shrink-0">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <h5 className="text-xs font-medium mb-1 line-clamp-1">
                      {message.subject}
                    </h5>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link href="/messages" className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              View All Messages
            </Button>
          </Link>
          <Link href="/messages" className="w-full">
            <Button variant="default" size="sm" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Compose Message
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}