"use client"

import { useState, useEffect } from "react"
import { BaseModal } from "../base/BaseModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  IndianRupee, 
  Users, 
  Clock,
  User,
  Edit,
  Trash2,
  Eye,
  CheckSquare,
  AlertCircle
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  dueDate?: string
  createdAt: string
  assignee: {
    id: string
    name: string
    email: string
    image?: string
  }
  internship: {
    id: string
    title: string
    domain: string
  }
  submissions: Array<{
    id: string
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'
    submittedAt: string
  }>
}

interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend: number | null
  isActive: boolean
  maxInterns: number
  createdAt: Date
  mentor: {
    id: string
    name: string | null
    email: string
    image: string | null
  } | null
  applications?: Array<{
    id: string
    status: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }> | null
  tasks?: Task[]
}

interface ViewInternshipModalProps {
  isOpen: boolean
  onClose: () => void
  internship: Internship | null
  onEdit?: () => void
  onDelete?: () => void
  onViewApplications?: () => void
  companyId?: string
}

export function ViewInternshipModal({
  isOpen,
  onClose,
  internship,
  onEdit,
  onDelete,
  onViewApplications,
  companyId
}: ViewInternshipModalProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)

  // Fetch tasks when modal opens and internship changes
  useEffect(() => {
    if (isOpen && internship && companyId) {
      const fetchTasks = async () => {
        setTasksLoading(true)
        try {
          const response = await fetch(`/api/admin/companies/${companyId}/tasks`)
          if (response.ok) {
            const data = await response.json()
            // Filter tasks for this specific internship
            const internshipTasks = data.filter((task: Task) => task.internship.id === internship.id)
            setTasks(internshipTasks)
          }
        } catch (error) {
          console.error('Error fetching tasks:', error)
        } finally {
          setTasksLoading(false)
        }
      }

      fetchTasks()
    }
  }, [isOpen, internship, companyId])

  // Guard clause: Don't render if internship is null
  if (!internship) {
    return null
  }

  // Add null safety checks for applications
  const applications = internship.applications || []
  const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED')
  const pendingApplications = applications.filter(app => app.status === 'PENDING')

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Internship Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-xl font-bold">{internship.title}</h2>
              <Badge variant={internship.isActive ? 'default' : 'secondary'}>
                {internship.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{internship.domain}</Badge>
            </div>
            <p className="text-muted-foreground">{internship.description}</p>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Program Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {internship.duration} weeks duration
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  Maximum {internship.maxInterns} interns
                </div>
                {internship.isPaid && internship.stipend && (
                  <div className="flex items-center text-sm">
                    <IndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
                    {internship.stipend}/month stipend
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  Created {new Date(internship.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Mentor</h3>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={internship.mentor?.image || undefined} />
                  <AvatarFallback>
                    {internship.mentor?.name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{internship.mentor?.name || 'No mentor assigned'}</p>
                  <p className="text-sm text-muted-foreground">{internship.mentor?.email || ''}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Applications</h3>
                <Button variant="outline" size="sm" onClick={onViewApplications}>
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {applications.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {acceptedApplications.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Accepted</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">
                    {pendingApplications.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>

              {acceptedApplications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Interns</h4>
                  <div className="space-y-2">
                    {acceptedApplications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center space-x-2 text-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={application.user.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {application.user.name?.charAt(0) || application.user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{application.user.name || application.user.email}</span>
                      </div>
                    ))}
                    {acceptedApplications.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{acceptedApplications.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        {(tasksLoading || tasks.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Related Tasks</h3>
              {tasksLoading ? (
                <div className="animate-pulse">
                  <div className="h-5 w-16 bg-muted rounded"></div>
                </div>
              ) : (
                <Badge variant="outline">
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {tasksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Badge 
                      className={`ml-2 ${
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status === 'IN_PROGRESS' ? 'In Progress' : 
                       task.status === 'COMPLETED' ? 'Completed' :
                       task.status === 'OVERDUE' ? 'Overdue' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="h-3 w-3 mr-1" />
                      {task.assignee.name}
                    </div>
                    {task.dueDate && (
                      <div className={`flex items-center text-xs ${
                        new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                          ? 'text-red-600' 
                          : 'text-muted-foreground'
                      }`}>
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.submissions.length > 0 && (
                      <div className="flex items-center text-xs">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        <Badge 
                          className={`text-xs ${
                            task.submissions[0].status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            task.submissions[0].status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            task.submissions[0].status === 'NEEDS_REVISION' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {task.submissions[0].status === 'SUBMITTED' ? 'Under Review' :
                           task.submissions[0].status === 'APPROVED' ? 'Approved' :
                           task.submissions[0].status === 'REJECTED' ? 'Rejected' :
                           'Needs Revision'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Status and Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Status: </span>
              <span className={internship.isActive ? 'text-green-600' : 'text-gray-600'}>
                {internship.isActive ? 'Accepting Applications' : 'Closed'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Capacity: </span>
              <span>{acceptedApplications.length}/{internship.maxInterns}</span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}