import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { db } from "@/lib/db"
import { CheckSquare, Clock, AlertTriangle, ArrowLeft, Users, Target, Plus } from "lucide-react"
import Link from "next/link"

interface InternshipTasksPageProps {
  params: {
    id: string
  }
}

export default async function InternshipTasksPage({ params }: InternshipTasksPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== 'MENTOR' && session.user.role !== 'ADMIN')) {
    redirect("/dashboard")
  }

  // Fetch the specific internship with all its tasks
  const internship = await db.internship.findUnique({
    where: {
      id: params.id
    },
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          },
          submissions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            },
            orderBy: {
              submittedAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      applications: {
        where: {
          status: 'ACCEPTED'
        },
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
      }
    }
  })

  if (!internship) {
    redirect("/dashboard/internships")
  }

  // Check permissions
  if (session.user.role === 'MENTOR' && internship.mentorId !== session.user.id) {
    redirect("/dashboard/internships")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckSquare className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const taskStats = {
    total: internship.tasks.length,
    pending: internship.tasks.filter(t => t.status === 'PENDING').length,
    inProgress: internship.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: internship.tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: internship.tasks.filter(t => t.status === 'OVERDUE').length,
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/internships">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Internships
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{internship.title}</h1>
            <p className="text-muted-foreground">
              {internship.domain} • {internship.duration} weeks • Tasks Management
            </p>
          </div>
        </div>
        
        {session.user.role === 'ADMIN' && (
          <Link href={`/admin/tasks?internship=${internship.id}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Internship Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Internship Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{internship.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{internship.duration} weeks</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={internship.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {internship.status}
                </Badge>
              </div>
            </div>
            {internship.isPaid && (
              <div>
                <p className="text-muted-foreground">Stipend</p>
                <p className="font-medium">{internship.stipend}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mentor & Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {internship.mentor && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mentor</p>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={internship.mentor.image || undefined} />
                    <AvatarFallback>
                      {internship.mentor.name?.charAt(0) || internship.mentor.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {internship.mentor.name || internship.mentor.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {internship.mentor.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Active Participants ({internship.applications.length})
              </p>
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
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            All Tasks ({internship.tasks.length})
          </CardTitle>
          <CardDescription>
            Manage and monitor all tasks for this internship program
          </CardDescription>
        </CardHeader>
        <CardContent>
          {internship.tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks created yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to get started with this internship program.
              </p>
              {session.user.role === 'ADMIN' && (
                <Link href={`/admin/tasks?internship=${internship.id}`}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Task
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {internship.tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            {task.dueDate && (
                              <Badge variant="outline">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={task.assignee?.image || undefined} />
                                <AvatarFallback>
                                  {task.assignee?.name?.charAt(0) || task.assignee?.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {task.assignee?.name || task.assignee?.email || 'Unassigned'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {task.assignee?.role || 'No role'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {task.credits} credits
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {task.submissions.length} submission(s)
                            </span>
                            {getStatusIcon(task.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}