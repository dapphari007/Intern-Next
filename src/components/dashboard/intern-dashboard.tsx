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

// Mock data - replace with real API calls
const mockData = {
  skillCredits: 1250,
  currentInternship: {
    title: "Frontend Development Intern",
    company: "TechCorp",
    mentor: "Sarah Johnson",
    progress: 75,
    tasksCompleted: 8,
    totalTasks: 12,
    deadline: "2024-02-15"
  },
  recentTasks: [
    {
      id: "1",
      title: "Implement user authentication",
      status: "completed",
      credits: 50,
      completedAt: "2024-01-10"
    },
    {
      id: "2",
      title: "Design responsive dashboard",
      status: "in_progress",
      credits: 75,
      dueDate: "2024-01-15"
    },
    {
      id: "3",
      title: "Write unit tests",
      status: "pending",
      credits: 40,
      dueDate: "2024-01-20"
    }
  ],
  creditHistory: [
    { date: "2024-01-10", amount: 50, description: "Task completion: Authentication" },
    { date: "2024-01-08", amount: 75, description: "Task completion: Dashboard design" },
    { date: "2024-01-05", amount: 25, description: "Bonus: Early submission" },
  ],
  stats: {
    totalInternships: 2,
    completedTasks: 15,
    totalHours: 120,
    averageRating: 4.8
  }
}

export function InternDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name}!</h1>
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
            <div className="text-2xl font-bold text-primary">{mockData.skillCredits}</div>
            <p className="text-xs text-muted-foreground">
              +50 from last task
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Across {mockData.stats.totalInternships} internships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">
              This month: 40 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              From mentor reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Internship */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Current Internship
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{mockData.currentInternship.title}</h3>
                  <p className="text-muted-foreground">{mockData.currentInternship.company}</p>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Mentor: {mockData.currentInternship.mentor}</span>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{mockData.currentInternship.progress}%</span>
                </div>
                <Progress value={mockData.currentInternship.progress} />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>Tasks: {mockData.currentInternship.tasksCompleted}/{mockData.currentInternship.totalTasks}</span>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  Due: {mockData.currentInternship.deadline}
                </div>
              </div>

              <Button className="w-full" asChild>
                <Link href="/project-room">
                  Go to Project Room
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest task activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            task.status === 'completed' ? 'default' : 
                            task.status === 'in_progress' ? 'secondary' : 'outline'
                          }
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {task.credits} credits
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {task.completedAt ? `Completed: ${task.completedAt}` : `Due: ${task.dueDate}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/certificates">
                  <Award className="mr-2 h-4 w-4" />
                  View Certificates
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Mint Certificate
              </Button>
            </CardContent>
          </Card>

          {/* Credit History */}
          <Card>
            <CardHeader>
              <CardTitle>Credit History</CardTitle>
              <CardDescription>Recent credit transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.creditHistory.map((entry, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">+{entry.amount} credits</p>
                      <p className="text-xs text-muted-foreground">{entry.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}