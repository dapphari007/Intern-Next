"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ViewInternshipModal } from '@/components/modals/internships/ViewInternshipModal'
import { ViewJobModal } from '@/components/modals/jobs/ViewJobModal'
import { CreateInternshipModal } from '@/components/modals/internships/CreateInternshipModal'
import { CreateJobModal } from '@/components/modals/jobs/CreateJobModal'
import { EditCompanyModal } from '@/components/modals/company/EditCompanyModal'
import { 
  Building, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Calendar,
  CheckSquare,
  AlertTriangle,
  DollarSign,
  UserCheck,
  Plus,
  Settings,
  Eye
} from 'lucide-react'

interface CompanyDashboardClientProps {
  company: any
  session: any
}

export function CompanyDashboardClient({ company, session }: CompanyDashboardClientProps) {
  const [selectedInternship, setSelectedInternship] = useState<any>(null)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isViewInternshipModalOpen, setIsViewInternshipModalOpen] = useState(false)
  const [isViewJobModalOpen, setIsViewJobModalOpen] = useState(false)
  const [isCreateInternshipModalOpen, setIsCreateInternshipModalOpen] = useState(false)
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false)
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false)

  const internships = company.internships
  const jobPostings = company.jobPostings
  const companyUsers = company.users

  // Calculate statistics
  const totalInternships = internships.length
  const activeInternships = internships.filter((i: any) => i.isActive).length
  const totalApplications = internships.reduce((sum: number, i: any) => sum + i.applications.length, 0)
  const acceptedApplications = internships.reduce((sum: number, i: any) => 
    sum + i.applications.filter((app: any) => app.status === 'ACCEPTED').length, 0
  )

  const totalJobPostings = jobPostings.length
  const activeJobPostings = jobPostings.filter((j: any) => j.isActive).length
  const totalJobApplications = jobPostings.reduce((sum: number, j: any) => sum + j.applications.length, 0)

  const applicationAcceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0

  // Get recent activities
  const recentInternships = internships
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const recentJobPostings = jobPostings
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const handleViewInternship = (internship: any) => {
    setSelectedInternship(internship)
    setIsViewInternshipModalOpen(true)
  }

  const handleViewJob = (job: any) => {
    setSelectedJob(job)
    setIsViewJobModalOpen(true)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name} Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your company's internships and job postings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {session.user.role.replace('_', ' ')}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditCompanyModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Company
            </Button>
          </div>
        </div>

        {/* Company Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInternships}</div>
              <p className="text-xs text-muted-foreground">
                {totalInternships} total internships
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobPostings}</div>
              <p className="text-xs text-muted-foreground">
                {totalJobPostings} total postings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications + totalJobApplications}</div>
              <p className="text-xs text-muted-foreground">
                {acceptedApplications} accepted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <UserCheck className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Company employees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateInternshipModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Internship
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsCreateJobModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Metrics</CardTitle>
              <CardDescription>Internship application performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Acceptance Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {applicationAcceptanceRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={applicationAcceptanceRate} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium">{totalApplications}</div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="font-medium">{acceptedApplications}</div>
                  <div className="text-muted-foreground">Accepted</div>
                </div>
                <div>
                  <div className="font-medium">{totalApplications - acceptedApplications}</div>
                  <div className="text-muted-foreground">Pending/Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Company Information
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditCompanyModalOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>Your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Industry:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {company.industry || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Size:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {company.size || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Location:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {company.location || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Website:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {company.website || 'Not specified'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Internships</CardTitle>
                <CardDescription>Latest internship programs</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCreateInternshipModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentInternships.length === 0 ? (
                <div className="text-center py-6">
                  <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No internships yet</p>
                  <Button size="sm" onClick={() => setIsCreateInternshipModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Internship
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInternships.map((internship: any) => (
                    <div key={internship.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 cursor-pointer" onClick={() => handleViewInternship(internship)}>
                        <h4 className="font-medium text-sm">{internship.title}</h4>
                        <p className="text-xs text-muted-foreground">{internship.domain}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={internship.isActive ? 'default' : 'secondary'} className="text-xs">
                          {internship.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {internship.applications.length} apps
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewInternship(internship)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Latest job opportunities</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCreateJobModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentJobPostings.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No job postings yet</p>
                  <Button size="sm" onClick={() => setIsCreateJobModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobPostings.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 cursor-pointer" onClick={() => handleViewJob(job)}>
                        <h4 className="font-medium text-sm">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {job.jobType} • {job.location || 'Remote'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={job.isActive ? 'default' : 'secondary'} className="text-xs">
                          {job.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {job.applications.length} apps
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewJob(job)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ViewInternshipModal 
        isOpen={isViewInternshipModalOpen}
        onClose={() => setIsViewInternshipModalOpen(false)}
        internship={selectedInternship}
      />
      
      <ViewJobModal 
        isOpen={isViewJobModalOpen}
        onClose={() => setIsViewJobModalOpen(false)}
        job={selectedJob}
      />
      
      <CreateInternshipModal 
        isOpen={isCreateInternshipModalOpen}
        onClose={() => setIsCreateInternshipModalOpen(false)}
        onSuccess={() => {
          setIsCreateInternshipModalOpen(false)
          // Refresh the page or update data
          window.location.reload()
        }}
      />
      
      <CreateJobModal 
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onSuccess={() => {
          setIsCreateJobModalOpen(false)
          // Refresh the page or update data
          window.location.reload()
        }}
      />
      
      <EditCompanyModal 
        isOpen={isEditCompanyModalOpen}
        onClose={() => setIsEditCompanyModalOpen(false)}
        company={company}
        onSuccess={() => {
          setIsEditCompanyModalOpen(false)
          // Refresh the page or update data
          window.location.reload()
        }}
      />
    </div>
  )
}