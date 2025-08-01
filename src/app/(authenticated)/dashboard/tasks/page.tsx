import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { db } from "@/lib/db"
import { CheckSquare, Clock, AlertTriangle, Calendar, FileText } from "lucide-react"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'INTERN') {
    redirect("/dashboard")
  }

  // Fetch user's tasks
  const tasks = await db.task.findMany({
    where: {
      assignedTo: session.user.id
    },
    include: {
      internship: {
        select: {
          title: true,
          domain: true
        }
      },
      submissions: {
        where: {
          userId: session.user.id
        },
        orderBy: {
          submittedAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default' as const
      case 'IN_PROGRESS':
        return 'secondary' as const
      case 'OVERDUE':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const getPriorityColor = (dueDate: Date | null) => {
    if (!dueDate) return 'text-gray-500'
    
    const now = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-500'
    if (diffDays <= 2) return 'text-orange-500'
    if (diffDays <= 7) return 'text-yellow-500'
    return 'text-green-500'
  }

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage your internship tasks and submissions
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tasks Assigned</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have any tasks assigned yet. Check back later or contact your mentor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => {
            const latestSubmission = task.submissions[0]
            const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'COMPLETED'
            
            return (
              <Card key={task.id} className={isOverdue ? 'border-red-200' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {task.title}
                        {getStatusIcon(task.status)}
                      </CardTitle>
                      <CardDescription>
                        {task.internship.title} • {task.internship.domain}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 text-sm ${getPriorityColor(task.dueDate)}`}>
                          <Calendar className="h-3 w-3" />
                          {task.dueDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    
                    {latestSubmission && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Latest Submission</span>
                          <Badge variant={
                            latestSubmission.status === 'APPROVED' ? 'default' :
                            latestSubmission.status === 'REJECTED' ? 'destructive' :
                            latestSubmission.status === 'NEEDS_REVISION' ? 'secondary' : 'outline'
                          }>
                            {latestSubmission.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {latestSubmission.submittedAt.toLocaleDateString()}
                        </p>
                        {latestSubmission.feedback && (
                          <p className="text-sm mt-2 p-2 bg-background rounded border">
                            <strong>Feedback:</strong> {latestSubmission.feedback}
                          </p>
                        )}
                        {latestSubmission.creditsAwarded > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            Credits Awarded: {latestSubmission.creditsAwarded}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Created: {task.createdAt.toLocaleDateString()}
                      </div>
                      
                      <div className="flex gap-2">
                        {task.status !== 'COMPLETED' && (
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Submit Work
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
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