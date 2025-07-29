"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Plus,
  CheckCircle,
  Clock,
  Star,
  MessageSquare
} from "lucide-react"
import Link from "next/link"

// Mock data - replace with real API calls
const mockData = {
  stats: {
    totalInterns: 8,
    activeInternships: 3,
    completedInternships: 12,
    averageRating: 4.9
  },
  assignedInterns: [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      internship: "Frontend Development",
      progress: 85,
      tasksCompleted: 10,
      totalTasks: 12,
      lastActive: "2 hours ago"
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      internship: "Backend Development",
      progress: 60,
      tasksCompleted: 6,
      totalTasks: 10,
      lastActive: "1 day ago"
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@example.com",
      internship: "Full Stack Development",
      progress: 40,
      tasksCompleted: 4,
      totalTasks: 15,
      lastActive: "3 hours ago"
    }
  ],
  pendingReviews: [
    {
      id: "1",
      internName: "Alice Johnson",
      taskTitle: "Implement user authentication",
      submittedAt: "2024-01-10",
      credits: 50
    },
    {
      id: "2",
      internName: "Bob Smith",
      taskTitle: "Create API endpoints",
      submittedAt: "2024-01-09",
      credits: 75
    }
  ],
  recentActivity: [
    {
      type: "task_completed",
      intern: "Alice Johnson",
      description: "Completed user authentication task",
      time: "2 hours ago"
    },
    {
      type: "task_submitted",
      intern: "Bob Smith",
      description: "Submitted API endpoints task",
      time: "1 day ago"
    },
    {
      type: "intern_joined",
      intern: "Carol Davis",
      description: "Joined Full Stack Development internship",
      time: "3 days ago"
    }
  ]
}

export function MentorDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your interns and track their progress
          </p>
        </div>
        <Button asChild>
          <Link href="/internships/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Internship
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.totalInterns}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.activeInternships}</div>
            <p className="text-xs text-muted-foreground">
              {mockData.stats.completedInternships} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.pendingReviews.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks awaiting review
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
              From intern feedback
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Interns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Assigned Interns
              </CardTitle>
              <CardDescription>Monitor your interns' progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.assignedInterns.map((intern) => (
                  <div key={intern.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {intern.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium">{intern.name}</p>
                        <p className="text-sm text-muted-foreground">{intern.internship}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>Tasks: {intern.tasksCompleted}/{intern.totalTasks}</span>
                          <span>•</span>
                          <span>Last active: {intern.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={intern.progress > 70 ? "default" : "secondary"}>
                        {intern.progress}% Complete
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/interns/${intern.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/project-room/${intern.id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Task Reviews</CardTitle>
              <CardDescription>Tasks submitted by interns awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.pendingReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{review.taskTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted by {review.internName} on {review.submittedAt}
                      </p>
                      <Badge variant="outline">{review.credits} credits</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
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
                <Link href="/internships/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Internship
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/certificates/issue">
                  <Award className="mr-2 h-4 w-4" />
                  Issue Certificate
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your interns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.intern}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
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