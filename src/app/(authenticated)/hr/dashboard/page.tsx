import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { 
  Users, 
  FileText, 
  UserPlus, 
  TrendingUp, 
  Calendar,
  CheckSquare,
  Building,
  Briefcase
} from "lucide-react"
import { MessagePane } from "@/components/dashboard/message-pane"

export default async function HRDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'HR_MANAGER') {
    redirect("/dashboard")
  }

  // Fetch HR-related data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          jobPostings: {
            include: {
              applications: {
                include: {
                  user: true
                }
              }
            }
          },
          internships: {
            include: {
              applications: {
                where: {
                  status: 'ACCEPTED'
                },
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
  const jobPostings = company.jobPostings
  const internships = company.internships

  // Calculate statistics
  const totalJobPostings = jobPostings.length
  const activeJobPostings = jobPostings.filter(j => j.isActive).length
  const totalJobApplications = jobPostings.reduce((sum, j) => sum + j.applications.length, 0)

  // Alumni (completed interns)
  const alumni = internships.flatMap(internship => 
    internship.applications.map(app => app.user)
  )

  // Recent job postings
  const recentJobPostings = jobPostings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Recent applications
  const recentApplications = jobPostings
    .flatMap(job => job.applications.map(app => ({ ...app, jobTitle: job.title })))
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HR Dashboard</h1>
            <p className="text-muted-foreground">
              Manage recruitment and alumni relationships
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            HR Manager
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
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
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobApplications}</div>
              <p className="text-xs text-muted-foreground">
                Job applications received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alumni</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alumni.length}</div>
              <p className="text-xs text-muted-foreground">
                Former interns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internships.length}</div>
              <p className="text-xs text-muted-foreground">
                Company programs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Job Postings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>Latest recruitment opportunities</CardDescription>
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
                        {job.salaryMin && job.salaryMax && (
                          <p className="text-xs text-muted-foreground">
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                          </p>
                        )}
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

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-6">
                  <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{application.user.name || 'Unknown'}</h4>
                        <p className="text-xs text-muted-foreground">{application.jobTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          application.status === 'ACCEPTED' ? 'default' : 
                          application.status === 'REJECTED' ? 'destructive' : 'secondary'
                        } 
                        className="text-xs"
                      >
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alumni Management */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni Network</CardTitle>
              <CardDescription>Former interns and potential hires</CardDescription>
            </CardHeader>
            <CardContent>
              {alumni.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No alumni yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alumni.slice(0, 5).map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{person.name || 'Unknown'}</h4>
                        <p className="text-xs text-muted-foreground">{person.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Credits: {person.skillCredits}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                        <Button size="sm">
                          Hire
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common HR tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Create Job Posting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Alumni
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Review Applications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
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