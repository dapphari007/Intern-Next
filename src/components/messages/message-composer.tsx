"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Send, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface MessageComposerProps {
  users: User[]
}

export function MessageComposer({ users }: MessageComposerProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [recipient, setRecipient] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [messageType, setMessageType] = useState<"DIRECT" | "BROADCAST">("DIRECT")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Check if user can send broadcast messages
  const canBroadcast = session?.user?.role && ["ADMIN", "COMPANY_ADMIN", "MENTOR"].includes(session.user.role)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (messageType === "DIRECT" && !recipient) {
      toast({
        title: "Error",
        description: "Please select a recipient for direct messages.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: messageType === "DIRECT" ? recipient : null,
          subject: subject.trim(),
          content: content.trim(),
          type: messageType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Success",
        description: "Message sent successfully!",
      })

      // Reset form
      setRecipient("")
      setSubject("")
      setContent("")
      setMessageType("DIRECT")
      setOpen(false)

      // Refresh the page to show the new message
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedUser = users.find(user => user.id === recipient)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Compose Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>
            Send a message to a specific user or broadcast to all users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {canBroadcast && (
            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select value={messageType} onValueChange={(value: "DIRECT" | "BROADCAST") => setMessageType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIRECT">Direct Message</SelectItem>
                  <SelectItem value="BROADCAST">Broadcast to All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {messageType === "DIRECT" && (
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.name || user.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser && (
                <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0)}
                  </div>
                  <span className="text-sm">{selectedUser.name || selectedUser.email}</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedUser.role}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {canBroadcast && messageType === "BROADCAST" && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Broadcast Message
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {session?.user?.role === 'MENTOR' 
                  ? 'This message will be sent to all your assigned interns and your company admin.'
                  : 'This message will be sent to all users in the system.'
                }
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your message"
              rows={6}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}