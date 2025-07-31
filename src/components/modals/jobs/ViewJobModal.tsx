"use client"

import { BaseModal } from "../base/BaseModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  DollarSign, 
  Calendar,
  Users,
  Edit,
  Trash2,
  Eye,
  Briefcase
} from "lucide-react"

interface JobPosting {
  id: string
  title: string
  description: string
  requirements: string
  location: string | null
  jobType: string
  salaryMin: number | null
  salaryMax: number | null
  isActive: boolean
  createdAt: Date
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

interface ViewJobModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobPosting
  onEdit: () => void
  onDelete: () => void
  onViewApplications: () => void
}

const jobTypeColors = {
  FULL_TIME: 'bg-blue-100 text-blue-800',
  PART_TIME: 'bg-green-100 text-green-800',
  CONTRACT: 'bg-purple-100 text-purple-800',
  INTERNSHIP: 'bg-orange-100 text-orange-800',
  REMOTE: 'bg-gray-100 text-gray-800'
}

const jobTypeLabels = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote'
}

export function ViewJobModal({
  isOpen,
  onClose,
  job,
  onEdit,
  onDelete,
  onViewApplications
}: ViewJobModalProps) {
  const acceptedApplications = job.applications.filter(app => app.status === 'ACCEPTED')
  const pendingApplications = job.applications.filter(app => app.status === 'PENDING')

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
    }
    if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`
    if (job.salaryMax) return `Up to $${job.salaryMax.toLocaleString()}`
    return null
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Posting Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-xl font-bold">{job.title}</h2>
              <Badge variant={job.isActive ? 'default' : 'secondary'}>
                {job.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge className={jobTypeColors[job.jobType as keyof typeof jobTypeColors]}>
                {jobTypeLabels[job.jobType as keyof typeof jobTypeLabels]}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              {job.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </span>
              )}
              {formatSalary() && (
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatSalary()}
                </span>
              )}
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Job Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </p>
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
              
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {job.applications.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Applications</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 border rounded-lg">
                    <div className="text-sm font-bold text-green-600">
                      {acceptedApplications.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Accepted</div>
                  </div>
                  <div className="text-center p-2 border rounded-lg">
                    <div className="text-sm font-bold text-yellow-600">
                      {pendingApplications.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>

              {job.applications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Applicants</h4>
                  <div className="space-y-2">
                    {job.applications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center justify-between text-sm p-2 border rounded">
                        <span>{application.user.name || application.user.email}</span>
                        <Badge 
                          variant={
                            application.status === 'ACCEPTED' ? 'default' :
                            application.status === 'PENDING' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {application.status.toLowerCase()}
                        </Badge>
                      </div>
                    ))}
                    {job.applications.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{job.applications.length - 3} more applications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Job Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{jobTypeLabels[job.jobType as keyof typeof jobTypeLabels]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={job.isActive ? 'text-green-600' : 'text-gray-600'}>
                    {job.isActive ? 'Accepting Applications' : 'Closed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted:</span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}