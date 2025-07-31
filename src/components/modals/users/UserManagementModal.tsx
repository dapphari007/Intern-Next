"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  UserCheck, 
  UserX, 
  X, 
  Power, 
  PowerOff, 
  UserMinus, 
  Shield,
  Users
} from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  isActive: boolean
  bio: string | null
  phone: string | null
  location: string | null
  createdAt: string
}

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  currentUserRole: string
  onSuccess?: () => void
}

const domainOptions = [
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'AI_ML', label: 'AI/ML' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'UI_UX', label: 'UI/UX Design' },
  { value: 'PRODUCT_MANAGEMENT', label: 'Product Management' }
]

export function UserManagementModal({
  isOpen,
  onClose,
  user,
  currentUserRole,
  onSuccess
}: UserManagementModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const { toast } = useToast()

  const handleRoleUpdate = async (newRole: string) => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update-role', 
          role: newRole,
          domain: selectedDomain
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole.replace('_', ' ')}`,
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle-status' })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle user status')
      }

      const updatedUser = await response.json()
      
      toast({
        title: "Success",
        description: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COMPANY_ADMIN': return 'bg-red-100 text-red-800'
      case 'MENTOR': return 'bg-blue-100 text-blue-800'
      case 'INTERN': return 'bg-green-100 text-green-800'
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canModifyUser = currentUserRole === 'COMPANY_ADMIN' && user.role !== 'COMPANY_ADMIN'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Manage User
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
            Manage user roles, status, and domain assignments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {user.name || user.email}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {user.email}
              </p>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role.replace('_', ' ')}
                </Badge>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {canModifyUser && (
            <>
              {/* Role Management */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Role Management
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {user.role === 'INTERN' && (
                    <Button 
                      onClick={() => handleRoleUpdate('MENTOR')}
                      disabled={isLoading}
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Promote to Mentor
                    </Button>
                  )}
                  {user.role === 'MENTOR' && (
                    <Button 
                      onClick={() => handleRoleUpdate('INTERN')}
                      disabled={isLoading}
                      variant="outline"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Downgrade to Intern
                    </Button>
                  )}
                </div>
              </div>

              {/* Domain Assignment */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Domain Assignment
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="domain">Assign to Domain</Label>
                  <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domainOptions.map((domain) => (
                        <SelectItem key={domain.value} value={domain.value}>
                          {domain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => handleRoleUpdate(user.role)}
                    disabled={isLoading || !selectedDomain}
                    variant="outline"
                    className="w-full"
                  >
                    Update Domain Assignment
                  </Button>
                </div>
              </div>

              {/* Status Management */}
              <div className="space-y-3">
                <h4 className="font-medium">Status Management</h4>
                <Button 
                  onClick={handleStatusToggle}
                  disabled={isLoading}
                  variant="outline"
                  className={`w-full ${user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}`}
                >
                  {user.isActive ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Activate User
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {!canModifyUser && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                You don't have permission to modify this user's settings.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}