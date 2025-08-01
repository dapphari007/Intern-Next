"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter,
  Mail,
  MailOpen,
  User,
  Clock,
  X
} from "lucide-react"
import { MessageComposer } from "@/components/messages/message-composer"

interface Message {
  id: string
  subject: string
  content: string
  createdAt: Date
  isRead: boolean
  senderId: string
  receiverId: string
  type: string
  sender: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  }
  receiver?: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  }
}

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  companyId?: string
}

interface MessagesClientProps {
  messages: Message[]
  users: User[]
  currentUserId: string
}

export function MessagesClient({ messages, users, currentUserId }: MessagesClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Separate sent and received messages
  const sentMessages = messages.filter(msg => msg.senderId === currentUserId)
  const receivedMessages = messages.filter(msg => msg.receiverId === currentUserId)
  const unreadCount = receivedMessages.filter(msg => !msg.isRead).length

  // Filter messages based on search and filters
  const filteredReceivedMessages = useMemo(() => {
    return receivedMessages.filter(message => {
      const matchesSearch = !searchTerm || 
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" || message.sender.role === roleFilter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "read" && message.isRead) ||
        (statusFilter === "unread" && !message.isRead)
      const matchesType = typeFilter === "all" || message.type === typeFilter

      return matchesSearch && matchesRole && matchesStatus && matchesType
    })
  }, [receivedMessages, searchTerm, roleFilter, statusFilter, typeFilter])

  const filteredSentMessages = useMemo(() => {
    return sentMessages.filter(message => {
      const matchesSearch = !searchTerm || 
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.receiver?.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" || message.receiver?.role === roleFilter
      const matchesType = typeFilter === "all" || message.type === typeFilter

      return matchesSearch && matchesRole && matchesType
    })
  }, [sentMessages, searchTerm, roleFilter, typeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  const hasActiveFilters = searchTerm || roleFilter !== "all" || statusFilter !== "all" || typeFilter !== "all"

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH'
      })
      // Refresh the page to update the read status
      window.location.reload()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with mentors, students, and administrators
            </p>
          </div>
          <MessageComposer users={users} />
        </div>

        {/* Message Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Mail className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">
                New messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <Send className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentMessages.length}</div>
              <p className="text-xs text-muted-foreground">
                Messages sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
              <MailOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receivedMessages.length}</div>
              <p className="text-xs text-muted-foreground">
                Messages received
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Message Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filter Messages</span>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages, subjects, or users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="INTERN">Interns</SelectItem>
                  <SelectItem value="MENTOR">Mentors</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                  <SelectItem value="COMPANY_ADMIN">Company Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DIRECT">Direct</SelectItem>
                  <SelectItem value="BROADCAST">Broadcast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {roleFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Role: {roleFilter}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {statusFilter}
                  </Badge>
                )}
                {typeFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {typeFilter}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredReceivedMessages.length} received and {filteredSentMessages.length} sent messages
          </span>
        </div>

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Received Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Received Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Messages you've received ({filteredReceivedMessages.length})</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReceivedMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Messages</h3>
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? "No messages match your current filters." : "You haven't received any messages yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredReceivedMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        !message.isRead 
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700 shadow-sm' 
                          : 'hover:bg-muted/50 dark:hover:bg-muted/20'
                      }`}
                      onClick={() => !message.isRead && markAsRead(message.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {message.sender.name?.charAt(0) || message.sender.email.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-foreground">{message.sender.name || 'Unknown'}</h4>
                            <p className="text-xs text-muted-foreground">{message.sender.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {message.sender.role}
                          </Badge>
                          {!message.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h5 className="font-medium mb-1 text-foreground">{message.subject}</h5>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{message.createdAt.toLocaleDateString()}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Sent Messages
              </CardTitle>
              <CardDescription>Messages you've sent ({filteredSentMessages.length})</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSentMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Sent Messages</h3>
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? "No messages match your current filters." : "You haven't sent any messages yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredSentMessages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                            {message.receiver?.name?.charAt(0) || message.receiver?.email.charAt(0) || 'A'}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              To: {message.receiver?.name || 'Unknown'}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {message.receiver?.email || 'All users'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {message.receiver?.role || 'BROADCAST'}
                        </Badge>
                      </div>
                      <h5 className="font-medium mb-1">{message.subject}</h5>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{message.createdAt.toLocaleDateString()}</span>
                        </div>
                        <Badge variant={message.type === 'BROADCAST' ? 'secondary' : 'outline'} className="text-xs">
                          {message.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}