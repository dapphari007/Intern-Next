"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  MoreHorizontal,
  Search,
  Filter,
  Power,
  PowerOff,
  MessageCircle,
  UserX
} from "lucide-react"
import Link from "next/link"

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

interface UsersPageClientProps {
  initialUsers: User[]
  currentUserId: string
  totalUsers: number
  activeUsers: number
  adminUsers: number
  mentorUsers: number
  internUsers: number
}

export function UsersPageClient({
  initialUsers,
  currentUserId,
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

  const softDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      // Remove user from local state
      setUsers(prev => prev.filter(user => user.id !== userId))

      toast({
        title: "User Deleted",
        description: "User has been removed from the company.",
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user.",
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
            <Button>
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
                  <Button>
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages?to=${user.id}`}>
                            <MessageCircle className="h-4 w-4" />
                          </Link>
                        </Button>
                        {user.id !== currentUserId && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                              disabled={isLoading}
                              className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                            >
                              {user.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/company/users/${user.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/company/users/${user.id}/profile`}>
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/company/users/${user.id}/edit`}>
                                    Edit User
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/messages?to=${user.id}`}>
                                    Send Message
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => softDeleteUser(user.id)}
                                  disabled={isLoading}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Remove from Company
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
    </div>
  )
}