"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, UserX, Loader2 } from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  isActive: boolean
}

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUserDeleted: (userId: string) => void
}

export function DeleteUserModal({ 
  isOpen, 
  onClose, 
  user, 
  onUserDeleted 
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      onUserDeleted(user.id)
      onClose()

      toast({
        title: "User Removed",
        description: `${user.name || user.email} has been removed from the company.`,
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove user from company.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COMPANY_ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'MENTOR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'INTERN': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <UserX className="h-5 w-5" />
            <span>Remove User from Company</span>
          </DialogTitle>
          <DialogDescription>
            This action will remove the user from your company. They will lose access to company resources and internship programs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-semibold truncate">
                  {user.name || 'No name set'}
                </p>
                <Badge className={getRoleColor(user.role)}>
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <Badge variant={user.isActive ? 'default' : 'secondary'} className="mt-1">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Warning */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Warning:</strong> This action will:
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>Remove the user from your company</li>
                <li>Deactivate their account</li>
                <li>Revoke access to company internships</li>
                <li>Preserve their data but make it inaccessible to them</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Remove from Company
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}