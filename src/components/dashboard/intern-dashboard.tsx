"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp, 
  User, 
  Calendar,
  CheckCircle,
  Star,
  Coins
} from "lucide-react"
import Link from "next/link"
import { MessagePane } from "./message-pane"

interface InternDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    skillCredits: number
    internships: Array<{
      id: string
      status: string
      internshipId: string
      internship?: {
        id: string
        title: string
        domain: string
        duration: number
        mentor?: {
          id: string
          name: string | null
        }
      }
    }>
    tasks: Array<{
      id: string
      title: string
      status: string
      internshipId: string
      dueDate?: Date | null
      updatedAt: Date
    }>
    creditHistory: Array<{
      id: string
      amount: number
      type: string
      description: string
      createdAt: Date
    }>
    certificates: Array<{
      id: string
      title: string
      description: string
      issueDate: Date
      status: string
    }>
  }
}

export function InternDashboard({ user }: InternDashboardProps) {
  const { data: session } = useSession()

  // Calculate stats from real data
  const totalInternships = user.internships.length
  const completedTasks = user.tasks.filter(task => task.status === 'COMPLETED').length
  const totalTasks = user.tasks.length
  const recentTasks = user.tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
  
  const recentCredits = user.creditHistory
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Get current internship (most recent accepted application)
  const currentInternship = user.internships.find(app => app.status === 'ACCEPTED')

  // Calculate progress
  const currentInternshipTasks = currentInternship ? 
    user.tasks.filter(task => task.internshipId === currentInternship.internshipId) : []
  const completedCurrentTasks = currentInternshipTasks.filter(task => task.status === 'COMPLETED').length
  const progress = currentInternshipTasks.length > 0 ? 
    (completedCurrentTasks / currentInternshipTasks.length) * 100 : 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name || 'Intern'}!</h1>
            <p className="text-muted-foreground">
              Track your progress and manage your internship journey
            </p>
          </div>
          <Button asChild>
            <Link href="/explore">
              <BookOpen className="mr-2 h-4 w-4" />
              Explore Internships
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skill Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{user.skillCredits}</div>
              <p className="text-xs text-muted-foreground">
                {recentCredits.length > 0 ? `+${recentCredits[0].amount} from last task` : 'No recent activity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {totalTasks} total tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internships</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInternships}</div>
              <p className="text-xs text-muted-foreground">
                Applications submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.certificates.length}</div>
              <p className="text-xs text-muted-foreground">
                Earned certificates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Cards */}
        <div className="space-y-6">
          {/* Current Internship */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Current Internship
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentInternship ? (
                <>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{currentInternship.internship?.title || 'Internship'}</h3>
                      <p className="text-muted-foreground">{currentInternship.internship?.domain || 'Technology'}</p>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {currentInternship.internship?.mentor?.name?.charAt(0) || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          Mentor: {currentInternship.internship?.mentor?.name || 'Assigned'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">{currentInternship.status}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span>Tasks: {completedCurrentTasks}/{currentInternshipTasks.length}</span>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      Duration: {currentInternship.internship?.duration || 0} weeks
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href="/project-room">
                      Go to Project Room
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Internship</h3>
                  <p className="text-muted-foreground mb-4">
                    Apply for internships to start your journey
                  </p>
                  <Button asChild>
                    <Link href="/explore">
                      Explore Internships
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest task activities</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={
                              task.status === 'COMPLETED' ? 'default' : 
                              task.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                            }
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
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