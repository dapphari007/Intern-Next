import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { db } from "@/lib/db"
import { 
  Users, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Award,
  Calendar,
  Target,
  BookOpen,
  Star
} from "lucide-react"

export default async function MentorAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'MENTOR') {
    redirect("/dashboard")
  }

  // Fetch mentor's internships and related data
  const internships = await db.internship.findMany({
    where: {
      mentorId: session.user.id
    },
    include: {
      applications: {
        where: {
          status: 'ACCEPTED'
        },
        include: {
          user: {
            include: {
              analytics: true,
              tasks: {
                include: {
                  submissions: {
                    orderBy: {
                      submittedAt: 'desc'
                    },
                    take: 1
                  }
                }
              },
              creditHistory: true
            }
          }
        }
      },
      tasks: {
        include: {
          submissions: {
            include: {
              user: true
            }
          }
        }
      }
    }
  })

  // Calculate analytics
  const students = internships.flatMap(internship => 
    internship.applications.map(app => app.user)
  )

  const totalStudents = students.length
  const totalTasks = internships.reduce((sum, internship) => sum + internship.tasks.length, 0)
  
  const taskStats = students.reduce((stats, student) => {
    const studentTasks = student.tasks
    const completed = studentTasks.filter(task => task.status === 'COMPLETED').length
    const pending = studentTasks.filter(task => task.status === 'PENDING' || task.status === 'IN_PROGRESS').length
    const overdue = studentTasks.filter(task => task.status === 'OVERDUE').length
    
    return {
      completed: stats.completed + completed,
      pending: stats.pending + pending,
      overdue: stats.overdue + overdue,
      total: stats.total + studentTasks.length
    }
  }, { completed: 0, pending: 0, overdue: 0, total: 0 })

  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0

  // Calculate submission statistics
  const submissionStats = students.reduce((stats, student) => {
    const submissions = student.tasks.flatMap(task => task.submissions)
    const onTime = submissions.filter(sub => {
      const task = student.tasks.find(t => t.id === sub.taskId)
      return task?.dueDate && sub.submittedAt <= task.dueDate
    }).length
    const late = submissions.filter(sub => {
      const task = student.tasks.find(t => t.id === sub.taskId)
      return task?.dueDate && sub.submittedAt > task.dueDate
    }).length

    return {
      total: stats.total + submissions.length,
      onTime: stats.onTime + onTime,
      late: stats.late + late,
      approved: stats.approved + submissions.filter(sub => sub.status === 'APPROVED').length,
      rejected: stats.rejected + submissions.filter(sub => sub.status === 'REJECTED').length,
      needsRevision: stats.needsRevision + submissions.filter(sub => sub.status === 'NEEDS_REVISION').length
    }
  }, { total: 0, onTime: 0, late: 0, approved: 0, rejected: 0, needsRevision: 0 })

  const onTimeRate = submissionStats.total > 0 ? (submissionStats.onTime / submissionStats.total) * 100 : 0
  const approvalRate = submissionStats.total > 0 ? (submissionStats.approved / submissionStats.total) * 100 : 0

  // Calculate average credits
  const totalCredits = students.reduce((sum, student) => sum + student.skillCredits, 0)
  const averageCredits = totalStudents > 0 ? totalCredits / totalStudents : 0

  // Get top performing students
  const topStudents = students
    .map(student => ({
      ...student,
      completionRate: student.tasks.length > 0 ? 
        (student.tasks.filter(task => task.status === 'COMPLETED').length / student.tasks.length) * 100 : 0,
      averageScore: student.tasks.length > 0 ?
        student.tasks.reduce((sum, task) => {
          const latestSubmission = task.submissions[0]
          return sum + (latestSubmission?.creditsAwarded || 0)
        }, 0) / student.tasks.length : 0
    }))
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5)

  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Analytics</h1>
          <p className="text-muted-foreground">
            Track your students' progress and performance
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {internships.length} internship{internships.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {taskStats.completed} of {taskStats.total} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Submissions</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTimeRate.toFixed(1)}%</div>
            <Progress value={onTimeRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {submissionStats.onTime} of {submissionStats.total} submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate.toFixed(1)}%</div>
            <Progress value={approvalRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {submissionStats.approved} approved submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
            <CardDescription>Current status of all assigned tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{taskStats.completed}</span>
                <Badge variant="default">{taskStats.total > 0 ? ((taskStats.completed / taskStats.total) * 100).toFixed(1) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{taskStats.pending}</span>
                <Badge variant="secondary">{taskStats.total > 0 ? ((taskStats.pending / taskStats.total) * 100).toFixed(1) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Overdue</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{taskStats.overdue}</span>
                <Badge variant="destructive">{taskStats.total > 0 ? ((taskStats.overdue / taskStats.total) * 100).toFixed(1) : 0}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Quality */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Quality</CardTitle>
            <CardDescription>Review outcomes for all submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm">Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{submissionStats.approved}</span>
                <Badge variant="default">{submissionStats.total > 0 ? ((submissionStats.approved / submissionStats.total) * 100).toFixed(1) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Needs Revision</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{submissionStats.needsRevision}</span>
                <Badge variant="secondary">{submissionStats.total > 0 ? ((submissionStats.needsRevision / submissionStats.total) * 100).toFixed(1) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Rejected</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{submissionStats.rejected}</span>
                <Badge variant="destructive">{submissionStats.total > 0 ? ((submissionStats.rejected / submissionStats.total) * 100).toFixed(1) : 0}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Students */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Students</CardTitle>
          <CardDescription>Students ranked by task completion rate</CardDescription>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
              <p className="text-muted-foreground">
                Students will appear here once they start working on tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{student.name || 'Unknown'}</h4>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{student.completionRate.toFixed(1)}% Complete</div>
                      <div className="text-xs text-muted-foreground">{student.skillCredits} Credits</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{student.averageScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Internship Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Internship Overview</CardTitle>
          <CardDescription>Performance metrics by internship program</CardDescription>
        </CardHeader>
        <CardContent>
          {internships.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Internships</h3>
              <p className="text-muted-foreground">
                Create internship programs to start mentoring students.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {internships.map((internship) => {
                const internshipStudents = internship.applications.length
                const internshipTasks = internship.tasks.length
                const completedTasks = internship.tasks.filter(task => 
                  task.submissions.some(sub => sub.status === 'APPROVED')
                ).length
                const internshipCompletionRate = internshipTasks > 0 ? (completedTasks / internshipTasks) * 100 : 0

                return (
                  <div key={internship.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{internship.title}</h4>
                      <Badge variant={internship.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {internship.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{internship.domain}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{internshipStudents}</div>
                        <div className="text-muted-foreground">Students</div>
                      </div>
                      <div>
                        <div className="font-medium">{internshipTasks}</div>
                        <div className="text-muted-foreground">Tasks</div>
                      </div>
                      <div>
                        <div className="font-medium">{internshipCompletionRate.toFixed(1)}%</div>
                        <div className="text-muted-foreground">Completion</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}