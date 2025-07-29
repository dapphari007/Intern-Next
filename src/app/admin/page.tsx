"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Shield,
  Settings
} from "lucide-react"
import Link from "next/link"

// Mock admin data
const mockData = {
  stats: {
    totalUsers: 1250,
    totalInternships: 85,
    activeMentors: 45,
    certificatesIssued: 320,
    pendingApplications: 23,
    systemHealth: 98.5
  },
  recentUsers: [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "INTERN",
      joinedAt: "2024-01-10",
      status: "active"
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "MENTOR",
      joinedAt: "2024-01-09",
      status: "active"
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@example.com",
      role: "INTERN",
      joinedAt: "2024-01-08",
      status: "pending"
    }
  ],
  pendingInternships: [
    {
      id: "1",
      title: "Machine Learning Intern",
      company: "AI Corp",
      mentor: "Dr. Sarah Wilson",
      submittedAt: "2024-01-10",
      status: "pending"
    },
    {
      id: "2",
      title: "Blockchain Developer",
      company: "CryptoTech",
      mentor: "Mike Johnson",
      submittedAt: "2024-01-09",
      status: "pending"
    }
  ],
  systemAlerts: [
    {
      id: "1",
      type: "warning",
      message: "High server load detected",
      timestamp: "2024-01-10 14:30"
    },
    {
      id: "2",
      type: "info",
      message: "Database backup completed successfully",
      timestamp: "2024-01-10 12:00"
    }
  ],
  analytics: {
    userGrowth: 15.2,
    internshipCompletion: 87.5,
    mentorSatisfaction: 4.8,
    platformUptime: 99.9
  }
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage users, internships, and platform operations
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{mockData.analytics.userGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.stats.totalInternships}</div>
              <p className="text-xs text-muted-foreground">
                {mockData.stats.activeMentors} active mentors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.stats.certificatesIssued}</div>
              <p className="text-xs text-muted-foreground">
                {mockData.analytics.internshipCompletion}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.stats.systemHealth}%</div>
              <p className="text-xs text-muted-foreground">
                {mockData.analytics.platformUptime}% uptime
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Recent Users
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/users">View All</Link>
                  </Button>
                </div>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={user.role === 'MENTOR' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Joined: {user.joinedAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Internships */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Pending Approvals
                  </CardTitle>
                  <Badge variant="outline">
                    {mockData.pendingInternships.length} pending
                  </Badge>
                </div>
                <CardDescription>Internships awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.pendingInternships.map((internship) => (
                    <div key={internship.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{internship.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {internship.company} • Mentor: {internship.mentor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {internship.submittedAt}
                        </p>
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
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/internships">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Internships
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/certificates">
                    <Award className="mr-2 h-4 w-4" />
                    Issue Certificates
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User Growth</span>
                  <span className="text-sm font-medium text-green-600">
                    +{mockData.analytics.userGrowth}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-medium">
                    {mockData.analytics.internshipCompletion}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mentor Rating</span>
                  <span className="text-sm font-medium">
                    {mockData.analytics.mentorSatisfaction}/5.0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Platform Uptime</span>
                  <span className="text-sm font-medium text-green-600">
                    {mockData.analytics.platformUptime}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}