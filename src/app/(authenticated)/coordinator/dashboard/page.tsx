import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { 
  Users, 
  Briefcase, 
  Calendar, 
  CheckSquare,
  Building,
  TrendingUp,
  Clock,
  UserCheck
} from "lucide-react"
import { MessagePane } from "@/components/dashboard/message-pane"

export default async function CoordinatorDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_COORDINATOR') {
    redirect("/dashboard")
  }

  // Fetch coordinator-related data
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

  // Calculate statistics
  const totalInternships = internships.length
  const activeInternships = internships.filter(i => i.isActive).length
  const totalApplications = internships.reduce((sum, i) => sum + i.applications.length, 0)
  const acceptedApplications = internships.reduce((sum, i) => 
    sum + i.applications.filter(app => app.status === 'ACCEPTED').length, 0
  )

  // Alumni (accepted interns)
  const alumni = internships.flatMap(internship => 
    internship.applications
      .filter(app => app.status === 'ACCEPTED')
      .map(app => ({ ...app.user, internshipTitle: internship.title }))
  )

  // Recent internships
  const recentInternships = internships
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Recent applications
  const recentApplications = internships
    .flatMap(internship => 
      internship.applications.map(app => ({ 
        ...app, 
        internshipTitle: internship.title 
      }))
    )
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
            <p className="text-muted-foreground">
              Coordinate internship programs and manage alumni
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Company Coordinator
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInternships}</div>
              <p className="text-xs text-muted-foreground">
                {totalInternships} total programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {acceptedApplications} accepted
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
                Program graduates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Building className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.users.length}</div>
              <p className="text-xs text-muted-foreground">
                Company staff
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Internships */}
          <Card>
            <CardHeader>
              <CardTitle>Internship Programs</CardTitle>
              <CardDescription>Current and recent programs</CardDescription>
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
                        <p className="text-xs text-muted-foreground">
                          Mentor: {internship.mentor?.name || 'Unassigned'}
                        </p>
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

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest internship applications</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-6">
                  <UserCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{application.user.name || 'Unknown'}</h4>
                        <p className="text-xs text-muted-foreground">{application.internshipTitle}</p>
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
              <CardDescription>Program graduates and connections</CardDescription>
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
                        <p className="text-xs text-muted-foreground">{person.internshipTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Credits: {person.skillCredits}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coordination Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Coordination Tasks</CardTitle>
              <CardDescription>Daily coordination activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Review Applications</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {recentApplications.filter(app => app.status === 'PENDING').length} pending
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Schedule Interviews</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Upcoming
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Alumni Outreach</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Monthly
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Program Analytics</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Weekly
                </Badge>
              </div>
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