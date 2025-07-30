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
  MessageSquare,
  BarChart
} from "lucide-react"
import Link from "next/link"
import { MessagePane } from "./message-pane"

interface MentorDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    mentorships: Array<{
      id: string
      title: string
      domain: string
      status: string
      applications?: Array<{
        id: string
        status: string
        user: {
          id: string
          name: string | null
          email: string
          skillCredits: number
        }
      }>
      tasks?: Array<{
        id: string
        title: string
        submissions?: Array<{
          id: string
          status: string
          submittedAt: Date
          creditsAwarded?: number | null
          user?: {
            id: string
            name: string | null
            email: string
          }
        }>
      }>
    }>
    tasks?: any[]
  }
}

export function MentorDashboard({ user }: MentorDashboardProps) {
  const { data: session } = useSession()

  // Calculate stats from real data
  const activeInternships = user.mentorships.filter(internship => internship.status === 'ACTIVE').length
  const totalInternships = user.mentorships.length
  const completedInternships = user.mentorships.filter(internship => internship.status === 'COMPLETED').length

  // Get assigned interns from internship applications
  const assignedInterns = user.mentorships.flatMap(internship => 
    internship.applications?.filter(app => app.status === 'ACCEPTED').map(app => ({
      ...app.user,
      internship: internship.title,
      internshipId: internship.id,
      progress: 0 // Calculate based on tasks if available
    })) || []
  )

  // Get pending task submissions
  const pendingReviews = user.mentorships.flatMap(internship =>
    internship.tasks?.flatMap(task =>
      task.submissions?.filter(sub => sub.status === 'SUBMITTED').map(sub => ({
        ...sub,
        taskTitle: task.title,
        internName: sub.user?.name || 'Unknown'
      })) || []
    ) || []
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your interns and track their progress
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/mentor/analytics">
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedInterns.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently mentoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInternships}</div>
              <p className="text-xs text-muted-foreground">
                {completedInternships} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Tasks awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInternships}</div>
              <p className="text-xs text-muted-foreground">
                Programs created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="space-y-6">
          {/* Assigned Interns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Assigned Interns
              </CardTitle>
              <CardDescription>Monitor your interns' progress</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedInterns.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Interns Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create internship programs to start mentoring students
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/internships">
                      Create Internship
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedInterns.map((intern) => (
                    <div key={intern.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {intern.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{intern.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{intern.internship}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>Progress: {intern.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={intern.progress > 70 ? "default" : "secondary"}>
                          {intern.progress}% Complete
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/mentor/analytics`}>
                              View
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/project-room`}>
                              <MessageSquare className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Task Reviews</CardTitle>
              <CardDescription>Tasks submitted by interns awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReviews.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No pending reviews</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{review.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted by {review.internName} on {new Date(review.submittedAt).toLocaleDateString()}
                        </p>
                        <Badge variant="outline">{review.creditsAwarded || 0} credits</Badge>
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