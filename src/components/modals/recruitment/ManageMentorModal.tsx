"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { UserCheck, UserX, X } from "lucide-react"

interface Mentor {
  id: string
  name: string | null
  email: string
  image: string | null
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface ManageMentorModalProps {
  isOpen: boolean
  onClose: () => void
  mentor: Mentor | null
  onSuccess?: () => void
}

export function ManageMentorModal({
  isOpen,
  onClose,
  mentor,
  onSuccess
}: ManageMentorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!mentor) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/mentors/${mentor.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update mentor status')
      }

      toast({
        title: "Success",
        description: `Mentor ${status.toLowerCase()} successfully`,
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error updating mentor status:', error)
      toast({
        title: "Error",
        description: "Failed to update mentor status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mentor) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Manage Mentor
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Update mentor status and manage their permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mentor Info */}
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.image || undefined} />
              <AvatarFallback>
                {mentor.name?.charAt(0) || mentor.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {mentor.name || mentor.email}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {mentor.email}
              </p>
              <Badge className={getStatusColor(mentor.status)}>
                {mentor.status}
              </Badge>
            </div>
          </div>

          {/* Status Update Actions */}
          {mentor.status === 'PENDING' && (
            <div className="space-y-3">
              <h4 className="font-medium">Update Status</h4>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleStatusUpdate('ACCEPTED')}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Accept
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Current Status Display */}
          {mentor.status !== 'PENDING' && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Current Status</h4>
              <p className="text-sm text-muted-foreground">
                This mentor has been <strong>{mentor.status.toLowerCase()}</strong>.
                {mentor.status === 'REJECTED' && " They cannot access mentor features."}
                {mentor.status === 'ACCEPTED' && " They have full mentor access."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}