import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { db } from "@/lib/db"
import { Plus, Users, Clock, CheckCircle, Briefcase } from "lucide-react"

export default async function InternshipsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== 'MENTOR' && session.user.role !== 'ADMIN')) {
    redirect("/dashboard")
  }

  // Fetch internships based on user role
  let whereClause: any = {}
  
  if (session.user.role === 'MENTOR') {
    // Mentors can only view internships they are assigned to
    whereClause = {
      mentorId: session.user.id
    }
  } else if (session.user.role === 'ADMIN') {
    // Admins can view all internships
    whereClause = {}
  } else {
    // Other roles should not access this page
    redirect("/dashboard")
  }

  const internships = await db.internship.findMany({
    where: whereClause,
    include: {
      applications: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      tasks: {
        select: {
          id: true,
          status: true
        }
      },
      _count: {
        select: {
          applications: true,
          tasks: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default' as const
      case 'COMPLETED':
        return 'secondary' as const
      case 'INACTIVE':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const totalInternships = internships.length
  const activeInternships = internships.filter(i => i.status === 'ACTIVE').length
  const totalApplications = internships.reduce((sum, i) => sum + i._count.applications, 0)

  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {session.user.role === 'MENTOR' ? 'Assigned Internships' : 'My Internships'}
          </h1>
          <p className="text-muted-foreground">
            {session.user.role === 'MENTOR' 
              ? 'View and manage internships assigned to you'
              : 'Manage your internship programs and mentor interns'
            }
          </p>
        </div>
        {session.user.role === 'ADMIN' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Internship
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInternships}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInternships}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Internships List */}
      {internships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {session.user.role === 'MENTOR' ? 'No Internships Assigned' : 'No Internships Created'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {session.user.role === 'MENTOR' 
                ? 'You have not been assigned to any internship programs yet. Contact your company admin for assignments.'
                : 'Start mentoring by creating your first internship program.'
              }
            </p>
            {session.user.role === 'ADMIN' && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Internship
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {internships.map((internship) => {
            const pendingApplications = internship.applications.filter(app => app.status === 'PENDING')
            const acceptedApplications = internship.applications.filter(app => app.status === 'ACCEPTED')
            const completedTasks = internship.tasks.filter(task => task.status === 'COMPLETED').length
            
            return (
              <Card key={internship.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{internship.title}</CardTitle>
                      <CardDescription>
                        {internship.domain} • {internship.duration} weeks
                        {internship.isPaid && ` • $${internship.stipend} stipend`}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(internship.status)}>
                      {internship.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {internship.description}
                    </p>
                    
                    {/* Applications Section */}
                    {internship.applications.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Applications</h4>
                          <div className="flex gap-2">
                            {pendingApplications.length > 0 && (
                              <Badge variant="secondary">
                                {pendingApplications.length} pending
                              </Badge>
                            )}
                            {acceptedApplications.length > 0 && (
                              <Badge variant="default">
                                {acceptedApplications.length} accepted
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex -space-x-2">
                          {internship.applications.slice(0, 5).map((application) => (
                            <Avatar key={application.id} className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={application.user.image || ""} alt={application.user.name || ""} />
                              <AvatarFallback className="text-xs">
                                {application.user.name?.charAt(0) || application.user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {internship.applications.length > 5 && (
                            <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                              +{internship.applications.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{internship._count.applications}</div>
                        <div className="text-muted-foreground">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{internship._count.tasks}</div>
                        <div className="text-muted-foreground">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{completedTasks}</div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        Created: {internship.createdAt.toLocaleDateString()}
                      </div>
                      
                      <div className="flex gap-2">
                        {pendingApplications.length > 0 && (
                          <Button size="sm" variant="outline">
                            <Clock className="mr-2 h-4 w-4" />
                            Review Applications ({pendingApplications.length})
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}