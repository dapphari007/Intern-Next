"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalInternships: number
    totalApplications: number
    totalCertificates: number
    userGrowth: number
    internshipGrowth: number
    applicationGrowth: number
    certificateGrowth: number
  }
  userStats: {
    interns: number
    mentors: number
    admins: number
    activeUsers: number
  }
  internshipStats: {
    active: number
    completed: number
    pending: number
    cancelled: number
  }
  monthlyData: Array<{
    month: string
    users: number
    internships: number
    applications: number
    certificates: number
  }>
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAnalyticsData({
        overview: {
          totalUsers: 1247,
          totalInternships: 89,
          totalApplications: 3456,
          totalCertificates: 234,
          userGrowth: 12.5,
          internshipGrowth: 8.3,
          applicationGrowth: 15.7,
          certificateGrowth: 22.1
        },
        userStats: {
          interns: 1089,
          mentors: 145,
          admins: 13,
          activeUsers: 892
        },
        internshipStats: {
          active: 45,
          completed: 32,
          pending: 8,
          cancelled: 4
        },
        monthlyData: [
          { month: "Jan", users: 120, internships: 8, applications: 245, certificates: 18 },
          { month: "Feb", users: 145, internships: 12, applications: 289, certificates: 22 },
          { month: "Mar", users: 167, internships: 15, applications: 334, certificates: 28 },
          { month: "Apr", users: 189, internships: 18, applications: 378, certificates: 31 },
          { month: "May", users: 212, internships: 21, applications: 423, certificates: 35 },
          { month: "Jun", users: 234, internships: 25, applications: 467, certificates: 42 }
        ]
      })
      setLoading(false)
    }

    fetchAnalytics()
  }, [selectedPeriod])

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        <span className="text-sm font-medium">{Math.abs(growth)}%</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform insights and performance metrics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
            {formatGrowth(analyticsData.overview.userGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalInternships}</div>
            {formatGrowth(analyticsData.overview.internshipGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalApplications.toLocaleString()}</div>
            {formatGrowth(analyticsData.overview.applicationGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalCertificates}</div>
            {formatGrowth(analyticsData.overview.certificateGrowth)}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="internships">Internship Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* User Analytics */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Interns</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{analyticsData.userStats.interns}</div>
                    <div className="text-xs text-muted-foreground">
                      {((analyticsData.userStats.interns / analyticsData.overview.totalUsers) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Mentors</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{analyticsData.userStats.mentors}</div>
                    <div className="text-xs text-muted-foreground">
                      {((analyticsData.userStats.mentors / analyticsData.overview.totalUsers) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Admins</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{analyticsData.userStats.admins}</div>
                    <div className="text-xs text-muted-foreground">
                      {((analyticsData.userStats.admins / analyticsData.overview.totalUsers) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Active users in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{analyticsData.userStats.activeUsers}</div>
                <div className="text-sm text-muted-foreground mb-4">
                  {((analyticsData.userStats.activeUsers / analyticsData.overview.totalUsers) * 100).toFixed(1)}% of total users
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Active Users</span>
                    <span className="font-medium">456</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekly Active Users</span>
                    <span className="font-medium">678</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Active Users</span>
                    <span className="font-medium">{analyticsData.userStats.activeUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Internship Analytics */}
        <TabsContent value="internships" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Internship Status</CardTitle>
                <CardDescription>Current status of all internships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <span className="font-medium">{analyticsData.internshipStats.active}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                  </div>
                  <span className="font-medium">{analyticsData.internshipStats.completed}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <span className="font-medium">{analyticsData.internshipStats.pending}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                  </div>
                  <span className="font-medium">{analyticsData.internshipStats.cancelled}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Success Rate</CardTitle>
                <CardDescription>Conversion from applications to internships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {((analyticsData.overview.totalInternships / analyticsData.overview.totalApplications) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {analyticsData.overview.totalInternships} internships from {analyticsData.overview.totalApplications} applications
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accepted Applications</span>
                    <span className="font-medium text-green-600">
                      {analyticsData.overview.totalInternships}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Applications</span>
                    <span className="font-medium text-yellow-600">234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rejected Applications</span>
                    <span className="font-medium text-red-600">
                      {analyticsData.overview.totalApplications - analyticsData.overview.totalInternships - 234}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
                <CardDescription>Internships completed successfully</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {((analyticsData.internshipStats.completed / (analyticsData.internshipStats.completed + analyticsData.internshipStats.cancelled)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {analyticsData.internshipStats.completed} out of {analyticsData.internshipStats.completed + analyticsData.internshipStats.cancelled} finished internships
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Duration</CardTitle>
                <CardDescription>Average internship length</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">12.5</div>
                <div className="text-sm text-muted-foreground">weeks per internship</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Score</CardTitle>
                <CardDescription>Average intern satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">4.7/5</div>
                <div className="text-sm text-muted-foreground">Based on 156 reviews</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Growth Trends</CardTitle>
              <CardDescription>Platform growth over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.monthlyData.map((month, index) => (
                  <div key={month.month} className="grid grid-cols-5 gap-4 items-center">
                    <div className="font-medium">{month.month}</div>
                    <div className="text-sm">
                      <div className="font-medium">{month.users}</div>
                      <div className="text-muted-foreground">Users</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{month.internships}</div>
                      <div className="text-muted-foreground">Internships</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{month.applications}</div>
                      <div className="text-muted-foreground">Applications</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{month.certificates}</div>
                      <div className="text-muted-foreground">Certificates</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}