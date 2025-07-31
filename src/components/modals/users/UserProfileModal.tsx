"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building2, 
  Award,
  Clock,
  Edit,
  UserMinus,
  UserPlus,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  CreditCard,
  Briefcase,
  GraduationCap
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  isActive: boolean
  bio: string | null
  phone: string | null
  linkedin: string | null
  github: string | null
  website: string | null
  location: string | null
  skillCredits: number
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
  }
  internships?: any[]
  mentorships?: any[]
  certificates?: any[]
  creditHistory?: any[]
  assignedDomains?: string[]
}

interface CompanyInternship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend: number | null
  status: string
  isActive: boolean
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentUserRole: string
  onUserUpdate?: (updatedUser: any) => void
}

export function UserProfileModal({ 
  isOpen, 
  onClose, 
  userId,
  currentUserRole,
  onUserUpdate 
}: UserProfileModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [availableInternships, setAvailableInternships] = useState<CompanyInternship[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile()
      fetchAvailableInternships()
    }
  }, [isOpen, userId])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch user profile')
      }
      
      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user profile.",
        variant: "destructive",
      })
      // Close modal on error
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableInternships = async () => {
    try {
      const response = await fetch('/api/company/internships')
      if (!response.ok) {
        console.warn('Failed to fetch internships:', response.status)
        return
      }
      
      const data = await response.json()
      const internships = Array.isArray(data) ? data : (data.internships || [])
      setAvailableInternships(internships.filter((internship: CompanyInternship) => 
        internship.isActive && internship.status === 'ACTIVE'
      ))
    } catch (error) {
      console.error('Error fetching internships:', error)
      // Don't show error toast for internships as it's not critical
    }
  }

  const updateUserRole = async (newRole: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-role', role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update user role')
      
      const updatedUser = await response.json()
      setUser(prev => prev ? { ...prev, role: updatedUser.role } : null)
      onUserUpdate?.(updatedUser)
      
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

  const assignToInternship = async () => {
    if (!selectedInternship) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/company/internships/${selectedInternship}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) throw new Error('Failed to assign user to internship')
      
      await fetchUserProfile() // Refresh user data
      setSelectedInternship("")
      
      toast({
        title: "User Assigned",
        description: "User has been assigned to the internship program.",
      })
    } catch (error) {
      console.error('Error assigning user to internship:', error)
      toast({
        title: "Error",
        description: "Failed to assign user to internship.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-status' })
      })

      if (!response.ok) throw new Error('Failed to toggle user status')
      
      const updatedUser = await response.json()
      setUser(prev => prev ? { ...prev, isActive: updatedUser.isActive } : null)
      onUserUpdate?.(updatedUser)
      
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COMPANY_ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'MENTOR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'INTERN': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const canEditRole = currentUserRole === 'COMPANY_ADMIN' || currentUserRole === 'ADMIN'

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading user profile...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.name || 'No name set'}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.bio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <p className="mt-1">{user.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{user.skillCredits} Skill Credits</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2">
                {user.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={user.linkedin} target="_blank">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Link>
                  </Button>
                )}
                
                {user.github && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={user.github} target="_blank">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                )}
                
                {user.website && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={user.website} target="_blank">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Management */}
          {canEditRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Role Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Current Role</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Status</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internship Assignment */}
          {canEditRole && user.role === 'INTERN' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Internship Assignment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Select value={selectedInternship} onValueChange={setSelectedInternship}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an internship program" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInternships.map((internship) => (
                          <SelectItem key={internship.id} value={internship.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{internship.title}</span>
                              <span className="text-sm text-muted-foreground">
                                {internship.domain} • {internship.duration} weeks
                                {internship.isPaid && internship.stipend && 
                                  ` • $${internship.stipend}/month`
                                }
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={assignToInternship}
                    disabled={!selectedInternship || isLoading}
                    size="sm"
                  >
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Internships/Mentorships */}
          {user.role === 'MENTOR' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Assigned Domains</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.assignedDomains && user.assignedDomains.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.assignedDomains.map((domain, index) => (
                      <Badge key={index} variant="default" className="px-3 py-1">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-muted-foreground mb-2">
                      <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No domains assigned</p>
                      <p className="text-xs">This mentor is currently unassigned to any domain</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {((user.internships && user.internships.length > 0) || 
            (user.mentorships && user.mentorships.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Current {user.role === 'INTERN' ? 'Internships' : 'Mentorships'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(user.role === 'INTERN' ? user.internships : user.mentorships)?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.title || item.internship?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.domain || item.internship?.domain} • 
                          {item.status || item.internship?.status}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {user.role === 'INTERN' ? 'Enrolled' : 'Mentoring'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificates */}
          {user.certificates && user.certificates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Certificates ({user.certificates.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.certificates.map((cert: any) => (
                    <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{cert.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Issued on {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={cert.status === 'ISSUED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {cert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}