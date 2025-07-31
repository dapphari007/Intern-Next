"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Users, 
  Send, 
  Paperclip, 
  Video,
  Phone,
  Settings,
  Search,
  Hash,
  Plus
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: {
    name: string
    image?: string
    role: string
  }
  timestamp: string
}

interface Channel {
  id: string
  name: string
  type: 'text' | 'voice'
  unreadCount?: number
}

export default function ProjectRoomPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedChannel, setSelectedChannel] = useState<string>('general')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [channels] = useState<Channel[]>([
    { id: 'general', name: 'general', type: 'text' },
    { id: 'tasks', name: 'tasks', type: 'text', unreadCount: 2 },
    { id: 'resources', name: 'resources', type: 'text' },
    { id: 'voice-1', name: 'Voice Channel 1', type: 'voice' },
  ])

  // Redirect mentors away from project room
  useEffect(() => {
    if (session?.user?.role === 'MENTOR') {
      router.push('/dashboard')
      return
    }
  }, [session, router])

  // Mock messages
  useEffect(() => {
    if (session?.user?.role === 'MENTOR') return
    
    setMessages([
      {
        id: '1',
        content: 'Welcome to the project room! This is where we collaborate on our internship project.',
        sender: { name: 'Sarah Johnson', role: 'MENTOR' },
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        content: 'Thanks! Excited to get started on the project.',
        sender: { name: 'John Doe', role: 'INTERN' },
        timestamp: '2024-01-15T10:05:00Z'
      },
      {
        id: '3',
        content: 'I\'ve uploaded the project requirements to the resources channel. Please review them.',
        sender: { name: 'Sarah Johnson', role: 'MENTOR' },
        timestamp: '2024-01-15T10:10:00Z'
      }
    ])
  }, [selectedChannel])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: {
        name: session?.user?.name || 'You',
        image: session?.user?.image || undefined,
        role: session?.user?.role || 'INTERN'
      },
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'MENTOR':
        return 'bg-blue-100 text-blue-800'
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  // Don't render anything for mentors while redirecting
  if (session?.user?.role === 'MENTOR') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="flex h-full rounded-lg border bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/50">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Project Room</h2>
          <p className="text-sm text-muted-foreground">Frontend Development Team</p>
        </div>

        {/* Channels */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Text Channels
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {channels.filter(c => c.type === 'text').map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors ${
                  selectedChannel === channel.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  {channel.name}
                </div>
                {channel.unreadCount && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    {channel.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3 mt-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Voice Channels
            </h3>
          </div>
          
          <div className="space-y-1">
            {channels.filter(c => c.type === 'voice').map((channel) => (
              <button
                key={channel.id}
                className="w-full flex items-center px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
              >
                <Video className="h-4 w-4 mr-2" />
                {channel.name}
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t bg-background">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-xs">
                {session?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.user?.role || 'INTERN'}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">
                  {channels.find(c => c.id === selectedChannel)?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Project collaboration channel
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-9 w-48"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.sender.image || ""} />
                <AvatarFallback className="text-xs">
                  {msg.sender.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{msg.sender.name}</span>
                  <Badge className={`text-xs ${getRoleBadgeColor(msg.sender.role)}`}>
                    {msg.sender.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder={`Message #${channels.find(c => c.id === selectedChannel)?.name}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-10"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="w-64 border-l bg-muted/50">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">5 online</p>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Mentors
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">SJ</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Senior Developer</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Interns
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">JD</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Frontend Intern</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">AS</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-yellow-500 border-2 border-background rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Alice Smith</p>
                  <p className="text-xs text-muted-foreground">UI/UX Intern</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}