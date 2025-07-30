"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Shield,
  Settings,
  Plus,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalInternships: number;
    activeMentors: number;
    certificatesIssued: number;
    pendingApplications: number;
    systemHealth: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
    status: string;
  }>;
  pendingInternships: Array<{
    id: string;
    title: string;
    company: string;
    mentor: string;
    applicant: string;
    submittedAt: string;
    status: string;
  }>;
  systemAlerts: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
  analytics: {
    userGrowth: number;
    internshipCompletion: number;
    mentorSatisfaction: number;
    platformUptime: number;
  };
}
export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)


  useEffect(() => {
    if (status === "loading") return

    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push("/dashboard")
      return
    }

    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (response.ok) {
          const data = await response.json()
          setAdminData(data)
        } else {
          console.error('Failed to fetch admin data')
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [session, status, router])

  const refreshAdminData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setAdminData(data)
      }
    } catch (error) {
      console.error('Error refreshing admin data:', error)
    }
  }

  const handleApplicationAction = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActionLoading(applicationId)
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Refresh admin data to show updated status
        const adminResponse = await fetch('/api/admin/dashboard')
        if (adminResponse.ok) {
          const data = await adminResponse.json()
          setAdminData(data)
        }
      } else {
        console.error('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }

    setActionLoading(applicationId)
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh admin data to show updated list
        const adminResponse = await fetch('/api/admin/dashboard')
        if (adminResponse.ok) {
          const data = await adminResponse.json()
          setAdminData(data)
        }
      } else {
        console.error('Failed to delete application')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 mb-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  if (!adminData) {
    return (
      <div className="space-y-6 mb-6">
        <div className="text-center">
          <p>Failed to load admin data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
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
                <Link href="/settings">
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
              <div className="text-2xl font-bold">{adminData?.stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{adminData?.analytics?.userGrowth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData?.stats?.totalInternships || 0}</div>
              <p className="text-xs text-muted-foreground">
                {adminData?.stats?.activeMentors || 0} active mentors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData?.stats?.certificatesIssued || 0}</div>
              <p className="text-xs text-muted-foreground">
                {adminData?.analytics?.internshipCompletion || 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData?.stats?.systemHealth || 99.9}%</div>
              <p className="text-xs text-muted-foreground">
                {adminData?.analytics?.platformUptime || 99.8}% uptime
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
                  {adminData?.recentUsers?.length > 0 ? (
                    adminData.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name?.split(' ').map(n => n[0]).join('') || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || 'No name'}</p>
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
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent users found
                    </div>
                  )}
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
                    {adminData?.pendingInternships?.length || 0} pending
                  </Badge>
                </div>
                <CardDescription>Internships awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData?.pendingInternships?.length > 0 ? (
                    adminData.pendingInternships.map((internship) => (
                    <div key={internship.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{internship.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {internship.company} • Mentor: {internship.mentor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applicant: {internship.applicant}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {internship.submittedAt}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteApplication(internship.id)}
                          disabled={actionLoading === internship.id}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApplicationAction(internship.id, 'REJECTED')}
                          disabled={actionLoading === internship.id}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApplicationAction(internship.id, 'ACCEPTED')}
                          disabled={actionLoading === internship.id}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No pending applications found
                    </div>
                  )}
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
                  {adminData?.systemAlerts?.length > 0 ? (
                    adminData.systemAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.type === 'warning' ? 'bg-yellow-500' : 
                          alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No system alerts
                    </div>
                  )}
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
                    +{adminData?.analytics?.userGrowth || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-medium">
                    {adminData?.analytics?.internshipCompletion || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mentor Rating</span>
                  <span className="text-sm font-medium">
                    {adminData?.analytics?.mentorSatisfaction || 4.5}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Platform Uptime</span>
                  <span className="text-sm font-medium text-green-600">
                    {adminData?.analytics?.platformUptime || 99.8}%
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