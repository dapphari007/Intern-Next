"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: 'INTERN' | 'MENTOR' | 'ADMIN'
  avatar?: string
  bio?: string
  location?: string
  university?: string
  company?: string
  position?: string
  skills?: string[]
  joinedAt: string
  status: 'active' | 'inactive' | 'pending'
  skillCredits?: number
  completedInternships?: number
  currentInternships?: number
  phone?: string
  linkedin?: string
  github?: string
  website?: string
  isEmailVerified?: boolean
  emailVerifiedAt?: string
  resumeGDriveLink?: string
}



export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const { toast } = useToast()

  // Fetch users from database
  useEffect(() => {
    fetchUsers()
  }, [])

  // Refetch users when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/users?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const userData = await response.json()
      // Ensure userData is an array
      if (Array.isArray(userData)) {
        setUsers(userData)
      } else if (userData && Array.isArray(userData.users)) {
        setUsers(userData.users)
      } else {
        console.error('Invalid user data format:', userData)
        setUsers([]) // Fallback to empty array
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      toast({
        title: "Error",
        description: "Failed to fetch users from database.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Since filtering is now done on the server, we use users directly
  const filteredUsers = Array.isArray(users) ? users : []

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'updateStatus',
          data: { status: newStatus }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ))
      
      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleVerifyEmail = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify-email`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to verify email')
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { 
          ...user, 
          isEmailVerified: true,
          emailVerifiedAt: new Date().toISOString()
        } : user
      ))
      
      toast({
        title: "Success",
        description: "Email verified successfully",
      })
    } catch (error) {
      console.error('Error verifying email:', error)
      toast({
        title: "Error",
        description: "Failed to verify email",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/users?userId=${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id))
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
      throw error
    }
  }

  const openDeleteModal = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleSaveUser = async (userId: string, data: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const updatedUser = await response.json()

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updatedUser } : user
      ))
      
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleAddUser = async (data: {
    name: string
    email: string
    role: string
    bio?: string
  }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      const newUser = await response.json()

      // Update local state
      setUsers(prev => [newUser, ...prev])
      
      toast({
        title: "Success",
        description: "User created successfully",
      })

      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
      throw error
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'MENTOR': return 'default'
      case 'INTERN': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 mb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="mr-3 h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage all platform users, roles, and permissions
            </p>
          </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/admin">
                  ← Back to Dashboard
                </Link>
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Interns</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'INTERN' && u.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'MENTOR' && u.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for mentoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="INTERN">Interns</SelectItem>
                  <SelectItem value="MENTOR">Mentors</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.location && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {user.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.isEmailVerified ? 'default' : 'secondary'}>
                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                        {!user.isEmailVerified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyEmail(user.id)}
                            className="text-xs"
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.resumeGDriveLink ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(user.resumeGDriveLink, '_blank')}
                        >
                          View Resume
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No resume</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.role === 'INTERN' && (
                          <>
                            <p>{user.skillCredits || 0} credits</p>
                            <p className="text-muted-foreground">
                              {user.completedInternships || 0} completed
                            </p>
                          </>
                        )}
                        {user.role === 'MENTOR' && (
                          <>
                            <p>{user.currentInternships || 0} active</p>
                            <p className="text-muted-foreground">mentorships</p>
                          </>
                        )}
                        {user.role === 'ADMIN' && (
                          <p className="text-muted-foreground">Administrator</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateUserStatus(user.id, 'inactive')}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateUserStatus(user.id, 'active')}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed information about this user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      {selectedUser.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          {selectedUser.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {selectedUser.email}
                      </div>
                      {selectedUser.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {selectedUser.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Professional Info</h4>
                    <div className="space-y-2 text-sm">
                      {selectedUser.university && (
                        <p><strong>University:</strong> {selectedUser.university}</p>
                      )}
                      {selectedUser.company && (
                        <p><strong>Company:</strong> {selectedUser.company}</p>
                      )}
                      {selectedUser.position && (
                        <p><strong>Position:</strong> {selectedUser.position}</p>
                      )}
                      <p><strong>Joined:</strong> {new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                  </div>
                )}

                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.role === 'INTERN' && (
                  <div>
                    <h4 className="font-medium mb-2">Internship Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{selectedUser.skillCredits || 0}</p>
                        <p className="text-sm text-muted-foreground">Skill Credits</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{selectedUser.completedInternships || 0}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{selectedUser.currentInternships || 0}</p>
                        <p className="text-sm text-muted-foreground">Current</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and settings
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <EditUserForm 
                user={selectedUser}
                onSave={handleSaveUser}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the platform
              </DialogDescription>
            </DialogHeader>
            <AddUserForm 
              onSave={handleAddUser}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          description="This will permanently delete the user and all associated data."
          itemName="user account"
          itemDetails={userToDelete ? [
            `Name: ${userToDelete.name}`,
            `Email: ${userToDelete.email}`,
            `Role: ${userToDelete.role}`,
            `Joined: ${new Date(userToDelete.joinedAt).toLocaleDateString()}`,
            `Skill Credits: ${userToDelete.skillCredits || 0}`,
            `Completed Internships: ${userToDelete.completedInternships || 0}`
          ] : []}
          requireConfirmation={true}
          confirmationText="DELETE"
        />
    </div>
  )
}

// Edit User Form Component
function EditUserForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: User
  onSave: (userId: string, data: Partial<User>) => Promise<void>
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    role: user.role
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(user.id, formData)
      onCancel()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as User['role'] }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INTERN">Intern</SelectItem>
            <SelectItem value="MENTOR">Mentor</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Add User Form Component
function AddUserForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (data: { name: string; email: string; role: string; bio?: string }) => Promise<void>
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'INTERN',
    bio: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(formData)
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'INTERN',
        bio: ''
      })
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="add-name">Name</Label>
        <Input
          id="add-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter full name"
          required
        />
      </div>

      <div>
        <Label htmlFor="add-email">Email</Label>
        <Input
          id="add-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email address"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="add-role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INTERN">Intern</SelectItem>
            <SelectItem value="MENTOR">Mentor</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="COMPANY_ADMIN">Company Admin</SelectItem>
            <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="add-bio">Bio (Optional)</Label>
        <Textarea
          id="add-bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Enter a brief bio"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create User'}
        </Button>
      </DialogFooter>
    </form>
  )
}