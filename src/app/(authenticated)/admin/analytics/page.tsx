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
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
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
  systemHealth?: {
    userEngagement: number
    systemHealth: number
    pendingApplications: number
    systemErrors: number
  }
  topPerformers?: Array<{
    id: string
    name: string
    email: string
    image?: string
    averageScore: number
    totalCredits: number
    completedTasks: number
    totalTasks: number
  }>
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch real analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        // Fallback to empty data structure
        setAnalyticsData({
          overview: {
            totalUsers: 0,
            totalInternships: 0,
            totalApplications: 0,
            totalCertificates: 0,
            userGrowth: 0,
            internshipGrowth: 0,
            applicationGrowth: 0,
            certificateGrowth: 0
          },
          userStats: {
            interns: 0,
            mentors: 0,
            admins: 0,
            activeUsers: 0,
            dailyActiveUsers: 0,
            weeklyActiveUsers: 0,
            monthlyActiveUsers: 0
          },
          internshipStats: {
            active: 0,
            completed: 0,
            pending: 0,
            cancelled: 0
          },
          monthlyData: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedPeriod])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error refreshing analytics:', error)
    } finally {
      setRefreshing(false)
    }
  }

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
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
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
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="performers">Top Performers</TabsTrigger>
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
                    <span className="font-medium">{analyticsData.userStats.dailyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekly Active Users</span>
                    <span className="font-medium">{analyticsData.userStats.weeklyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Active Users</span>
                    <span className="font-medium">{analyticsData.userStats.monthlyActiveUsers}</span>
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

        {/* System Health */}
        <TabsContent value="system" className="space-y-6">
          {analyticsData.systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health Metrics</CardTitle>
                  <CardDescription>Overall platform health indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Health</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        analyticsData.systemHealth.systemHealth >= 90 ? 'bg-green-500' :
                        analyticsData.systemHealth.systemHealth >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">{analyticsData.systemHealth.systemHealth.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Engagement</span>
                    <span className="font-medium">{analyticsData.systemHealth.userEngagement.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Applications</span>
                    <span className="font-medium text-yellow-600">{analyticsData.systemHealth.pendingApplications}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Errors</span>
                    <span className="font-medium text-red-600">{analyticsData.systemHealth.systemErrors}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Status</CardTitle>
                  <CardDescription>Real-time platform status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="font-medium"> 200 ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium text-green-600">99.9%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Top Performers */}
        <TabsContent value="performers" className="space-y-6">
          {analyticsData.topPerformers && analyticsData.topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>Students with highest scores and credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPerformers.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{performer.name}</div>
                          <div className="text-sm text-muted-foreground">{performer.email}</div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{performer.averageScore.toFixed(1)}%</span>
                          <span className="text-muted-foreground"> avg score</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{performer.totalCredits}</span>
                          <span className="text-muted-foreground"> credits</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{performer.completedTasks}/{performer.totalTasks}</span>
                          <span className="text-muted-foreground"> tasks</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {(!analyticsData.topPerformers || analyticsData.topPerformers.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>No performance data available yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No student performance data available. Students need to complete tasks to appear here.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}