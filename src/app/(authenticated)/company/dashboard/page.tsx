import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { db } from "@/lib/db"
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
  UserCheck
} from "lucide-react"
import { MessagePane } from "@/components/dashboard/message-pane"

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          internships: {
            include: {
              applications: {
                include: {
                  user: true
                }
              },
              mentor: true
            }
          },
          jobPostings: {
            include: {
              applications: {
                include: {
                  user: true
                }
              }
            }
          },
          users: true
        }
      }
    }
  })

  if (!user?.company) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-6 pb-6">
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Company Associated</h2>
          <p className="text-muted-foreground">
            You need to be associated with a company to access this dashboard.
          </p>
        </div>
        </div>
      </div>
    )
  }

  const company = user.company
  const internships = company.internships
  const jobPostings = company.jobPostings
  const companyUsers = company.users

  // Calculate statistics
  const totalInternships = internships.length
  const activeInternships = internships.filter(i => i.isActive).length
  const totalApplications = internships.reduce((sum, i) => sum + i.applications.length, 0)
  const acceptedApplications = internships.reduce((sum, i) => 
    sum + i.applications.filter(app => app.status === 'ACCEPTED').length, 0
  )

  const totalJobPostings = jobPostings.length
  const activeJobPostings = jobPostings.filter(j => j.isActive).length
  const totalJobApplications = jobPostings.reduce((sum, j) => sum + j.applications.length, 0)

  const applicationAcceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0

  // Get recent activities
  const recentInternships = internships
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const recentJobPostings = jobPostings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name} Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your company's internships and job postings
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {session.user.role.replace('_', ' ')}
          </Badge>
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
              <CardTitle>Company Information</CardTitle>
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
            <CardHeader>
              <CardTitle>Recent Internships</CardTitle>
              <CardDescription>Latest internship programs</CardDescription>
            </CardHeader>
            <CardContent>
              {recentInternships.length === 0 ? (
                <div className="text-center py-6">
                  <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No internships yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInternships.map((internship) => (
                    <div key={internship.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>Latest job opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobPostings.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No job postings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobPostings.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Pane */}
      <div className="lg:col-span-1">
        <MessagePane />
      </div>
      </div>
    </div>
  )
}