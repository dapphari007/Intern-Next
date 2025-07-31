"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  Users, 
  DollarSign,
  Plus,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Power,
  PowerOff
} from "lucide-react"
import { CreateJobModal } from "@/components/modals/jobs/CreateJobModal"
import { ViewJobModal } from "@/components/modals/jobs/ViewJobModal"
import { EditJobModal } from "@/components/modals/jobs/EditJobModal"
import { DeleteJobModal } from "@/components/modals/jobs/DeleteJobModal"
import { ViewApplicationsModal } from "@/components/modals/internships/ViewApplicationsModal"
import { useToast } from "@/hooks/use-toast"

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

interface JobsPageClientProps {
  initialJobs: JobPosting[]
  totalJobs: number
  activeJobs: number
  totalApplications: number
  avgSalary: number
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

export function JobsPageClient({
  initialJobs,
  totalJobs,
  activeJobs,
  totalApplications,
  avgSalary
}: JobsPageClientProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [modals, setModals] = useState({
    create: false,
    view: false,
    edit: false,
    delete: false,
    applications: false
  })
  const { toast } = useToast()

  const openModal = (type: keyof typeof modals, job?: JobPosting) => {
    if (job) setSelectedJob(job)
    setModals(prev => ({ ...prev, [type]: true }))
  }

  const closeModal = (type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: false }))
    setSelectedJob(null)
  }

  const refreshJobs = async () => {
    // In a real app, you'd refetch the data here
    window.location.reload()
  }

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    setIsLoading(jobId)
    try {
      const response = await fetch(`/api/company/jobs/${jobId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update job status')
      }

      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, isActive: !currentStatus }
          : job
      ))

      toast({
        title: "Success",
        description: `Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const formatSalary = (job: JobPosting) => {
    if (!job.salaryMin && !job.salaryMax) return null
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
    }
    if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`
    if (job.salaryMax) return `Up to $${job.salaryMax.toLocaleString()}`
    return null
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Postings</h1>
            <p className="text-muted-foreground">
              Manage your company's job opportunities
            </p>
          </div>
          <Button onClick={() => openModal('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Posting
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {activeJobs} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Total received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Applications</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Per job posting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${avgSalary > 0 ? avgSalary.toLocaleString() : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Average offered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>All Job Postings</CardTitle>
            <CardDescription>Manage your company's job opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No job postings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first job posting to start attracting candidates.
                </p>
                <Button onClick={() => openModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Posting
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge variant={job.isActive ? 'default' : 'secondary'}>
                            {job.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className={jobTypeColors[job.jobType as keyof typeof jobTypeColors]}>
                            {jobTypeLabels[job.jobType as keyof typeof jobTypeLabels]}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {job.applications.length} applications
                          </span>
                          {formatSalary(job) && (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatSalary(job)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleJobStatus(job.id, job.isActive)}
                          disabled={isLoading === job.id}
                          className={job.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                          title={job.isActive ? "Deactivate Job" : "Activate Job"}
                        >
                          {isLoading === job.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                          ) : job.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openModal('view', job)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openModal('edit', job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openModal('delete', job)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <CreateJobModal
          isOpen={modals.create}
          onClose={() => closeModal('create')}
          onSuccess={refreshJobs}
        />

        {selectedJob && (
          <>
            <ViewJobModal
              isOpen={modals.view}
              onClose={() => closeModal('view')}
              job={selectedJob}
              onEdit={() => {
                closeModal('view')
                openModal('edit', selectedJob)
              }}
              onDelete={() => {
                closeModal('view')
                openModal('delete', selectedJob)
              }}
              onViewApplications={() => {
                closeModal('view')
                openModal('applications', selectedJob)
              }}
            />

            <EditJobModal
              isOpen={modals.edit}
              onClose={() => closeModal('edit')}
              job={selectedJob}
              onSuccess={refreshJobs}
            />

            <DeleteJobModal
              isOpen={modals.delete}
              onClose={() => closeModal('delete')}
              job={selectedJob}
              onSuccess={refreshJobs}
            />

            <ViewApplicationsModal
              isOpen={modals.applications}
              onClose={() => closeModal('applications')}
              internship={{
                id: selectedJob.id,
                title: selectedJob.title,
                domain: selectedJob.jobType,
                applications: selectedJob.applications.map(app => ({
                  ...app,
                  status: app.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
                  createdAt: new Date().toISOString(),
                  user: {
                    ...app.user,
                    name: app.user.name
                  }
                }))
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}