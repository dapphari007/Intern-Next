import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/db"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter,
  Mail,
  MailOpen,
  Plus,
  User,
  Clock
} from "lucide-react"
import { MessageComposer } from "@/components/messages/message-composer"
import { MessageList } from "@/components/messages/message-list"

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Fetch user's messages
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Fetch all users for composing messages (excluding current user)
  const users = await db.user.findMany({
    where: {
      NOT: {
        id: session.user.id
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Separate sent and received messages
  const sentMessages = messages.filter(msg => msg.senderId === session.user.id)
  const receivedMessages = messages.filter(msg => msg.receiverId === session.user.id)
  const unreadCount = receivedMessages.filter(msg => !msg.isRead).length

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

      {/* Message Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search messages..."
                className="w-full"
              />
            </div>
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <CardDescription>Messages you've received</CardDescription>
          </CardHeader>
          <CardContent>
            {receivedMessages.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Messages</h3>
                <p className="text-muted-foreground">
                  You haven't received any messages yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {receivedMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 border rounded-lg ${!message.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {message.sender.name?.charAt(0) || message.sender.email.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{message.sender.name || 'Unknown'}</h4>
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
                    <h5 className="font-medium mb-1">{message.subject}</h5>
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
            <CardDescription>Messages you've sent</CardDescription>
          </CardHeader>
          <CardContent>
            {sentMessages.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sent Messages</h3>
                <p className="text-muted-foreground">
                  You haven't sent any messages yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sentMessages.map((message) => (
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