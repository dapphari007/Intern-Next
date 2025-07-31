"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  UserPlus, 
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Trash2,
  Search,
  Power,
  PowerOff,
  MessageCircle,
  UserX,
  Eye,
  UserMinus,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import { UserProfileModal } from "@/components/modals/users/UserProfileModal"
import { DeleteUserModal } from "@/components/modals/users/DeleteUserModal"
import { UserManagementModal } from "@/components/modals/users/UserManagementModal"
import { InviteUserModal } from "@/components/modals/users/InviteUserModal"

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
  assignedDomains?: string[]
}

interface UsersPageClientProps {
  initialUsers: User[]
  currentUserId: string
  currentUserRole: string
  totalUsers: number
  activeUsers: number
  adminUsers: number
  mentorUsers: number
  internUsers: number
}

export function UsersPageClient({
  initialUsers,
  currentUserId,
  currentUserRole,
  totalUsers,
  activeUsers,
  adminUsers,
  mentorUsers,
  internUsers
}: UsersPageClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToManage, setUserToManage] = useState<User | null>(null)
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter(user => user.isActive === isActive)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const toggleUserStatus = async (userId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}`, {
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
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isActive: updatedUser.isActive }
            : user
        )
      )

      toast({
        title: "Status Updated",
        description: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully.`,
      })
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserUpdate = (updatedUser: any) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === updatedUser.id 
          ? { ...user, ...updatedUser }
          : user
      )
    )
  }

  const handleUserDeleted = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
  }

  const openProfileModal = (userId: string) => {
    setSelectedUserId(userId)
    setIsProfileModalOpen(true)
  }

  const openDeleteModal = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const openManagementModal = (user: User) => {
    setUserToManage(user)
    setIsManagementModalOpen(true)
  }

  const openChatModal = (userId: string) => {
    // Open user profile modal when chat icon is clicked
    openProfileModal(userId)
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-role', role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update user role')
      
      const updatedUser = await response.json()
      handleUserUpdate(updatedUser)
      
      toast({
        title: "Role Updated",
        description: `User role changed to ${newRole.replace('_', ' ')}.`,
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COMPANY_ADMIN': return 'bg-red-100 text-red-800'
      case 'MENTOR': return 'bg-blue-100 text-blue-800'
      case 'INTERN': return 'bg-green-100 text-green-800'
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage your company's team members and permissions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="COMPANY_ADMIN">Admin</SelectItem>
              <SelectItem value="MENTOR">Mentor</SelectItem>
              <SelectItem value="INTERN">Intern</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-muted-foreground">
                Company admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentorUsers}</div>
              <p className="text-xs text-muted-foreground">
                Team mentors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interns</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internUsers}</div>
              <p className="text-xs text-muted-foreground">
                Current interns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {filteredUsers.length} of {users.length} users
              {searchTerm && ` matching "${searchTerm}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {users.length === 0 ? "No team members yet" : "No users match your search"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {users.length === 0 
                    ? "Start by inviting team members to join your company."
                    : "Try adjusting your search criteria or filters."
                  }
                </p>
                {users.length === 0 && (
                  <Button onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite First User
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">
                              {user.name || user.email}
                            </h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {user.id === currentUserId && (
                              <Badge variant="outline">You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {user.email}
                          </p>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                          {/* Assigned Domains */}
                          {user.role === 'MENTOR' && (
                            <div className="mb-3">
                              <div className="flex items-center flex-wrap gap-1">
                                <span className="text-sm text-muted-foreground mr-2">Domains:</span>
                                {user.assignedDomains && user.assignedDomains.length > 0 ? (
                                  user.assignedDomains.map((domain, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {domain}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Unassigned
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {user.phone && (
                              <span className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {user.phone}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                            {user.location && (
                              <span>{user.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">

                        {/* View Profile Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openProfileModal(user.id)}
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages?to=${user.id}`}>
                          <MessageCircle className="h-4 w-4" />
                          </Link>
                        </Button>

                        {user.id !== currentUserId && currentUserRole === 'COMPANY_ADMIN' && (
                          <>
                            {/* Consolidated Edit Button */}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openManagementModal(user)}
                              disabled={isLoading}
                              className="text-blue-600 hover:text-blue-700"
                              title="Manage User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {/* Delete Button */}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Remove from Company"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedUserId && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false)
            setSelectedUserId(null)
          }}
          userId={selectedUserId}
          currentUserRole={currentUserRole}
          onUserUpdate={handleUserUpdate}
        />
      )}

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        user={userToDelete}
        onUserDeleted={handleUserDeleted}
      />

      <UserManagementModal
        isOpen={isManagementModalOpen}
        onClose={() => {
          setIsManagementModalOpen(false)
          setUserToManage(null)
        }}
        user={userToManage}
        currentUserRole={currentUserRole}
        onSuccess={() => {
          // Refresh the page to get updated user data
          window.location.reload()
        }}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          // Refresh users list
          window.location.reload()
        }}
      />
    </div>
  )
}