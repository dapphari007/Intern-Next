"use client"

import { BaseModal } from "../base/BaseModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  User,
  Edit,
  Trash2,
  Eye
} from "lucide-react"

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
    name: string
    email: string
    image: string | null
  }
  applications: Array<{
    id: string
    status: string
    user: {
      id: string
      name: string
      email: string
      image: string | null
    }
  }>
}

interface ViewInternshipModalProps {
  isOpen: boolean
  onClose: () => void
  internship: Internship
  onEdit: () => void
  onDelete: () => void
  onViewApplications: () => void
}

export function ViewInternshipModal({
  isOpen,
  onClose,
  internship,
  onEdit,
  onDelete,
  onViewApplications
}: ViewInternshipModalProps) {
  const acceptedApplications = internship.applications.filter(app => app.status === 'ACCEPTED')
  const pendingApplications = internship.applications.filter(app => app.status === 'PENDING')

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
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    ${internship.stipend}/month stipend
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
                  <AvatarImage src={internship.mentor.image || undefined} />
                  <AvatarFallback>
                    {internship.mentor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{internship.mentor.name}</p>
                  <p className="text-sm text-muted-foreground">{internship.mentor.email}</p>
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
                    {internship.applications.length}
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