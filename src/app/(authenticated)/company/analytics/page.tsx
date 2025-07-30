import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { db } from "@/lib/db"
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  Briefcase,
  FileText,
  Calendar,
  Target,
  Award,
  Clock,
  DollarSign
} from "lucide-react"

export default async function CompanyAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch comprehensive company analytics data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          internships: {
            include: {
              applications: {
                include: {
                  user: true
                }
              }
            }
          },
          jobPostings: {
            include: {
              applications: {
                include: {
                  user: true
                }
              }
            }
          },
          users: true
        }
      }
    }
  })

  if (!user?.company) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-6 pb-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Company Associated</h2>
            <p className="text-muted-foreground">
              You need to be associated with a company to view analytics.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const company = user.company
  
  // Calculate comprehensive analytics
  const internships = company.internships
  const jobPostings = company.jobPostings
  const companyUsers = company.users

  // Internship Analytics
  const totalInternships = internships.length
  const activeInternships = internships.filter(i => i.isActive).length
  const internshipApplications = internships.flatMap(i => i.applications)
  const totalInternshipApplications = internshipApplications.length
  const acceptedInternshipApplications = internshipApplications.filter(app => app.status === 'ACCEPTED').length
  const internshipAcceptanceRate = totalInternshipApplications > 0 ? (acceptedInternshipApplications / totalInternshipApplications) * 100 : 0

  // Job Analytics
  const totalJobPostings = jobPostings.length
  const activeJobPostings = jobPostings.filter(j => j.isActive).length
  const jobApplications = jobPostings.flatMap(j => j.applications)
  const totalJobApplications = jobApplications.length
  const acceptedJobApplications = jobApplications.filter(app => app.status === 'ACCEPTED').length
  const jobAcceptanceRate = totalJobApplications > 0 ? (acceptedJobApplications / totalJobApplications) * 100 : 0

  // Overall metrics
  const totalApplications = totalInternshipApplications + totalJobApplications
  const totalAccepted = acceptedInternshipApplications + acceptedJobApplications
  const overallAcceptanceRate = totalApplications > 0 ? (totalAccepted / totalApplications) * 100 : 0

  // Time-based analytics (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentInternshipApplications = internshipApplications.filter(app => 
    new Date(app.appliedAt) >= thirtyDaysAgo
  ).length

  const recentJobApplications = jobApplications.filter(app => 
    new Date(app.appliedAt) >= thirtyDaysAgo
  ).length

  // Domain/Industry analytics
  const domainStats = internships.reduce((acc, internship) => {
    acc[internship.domain] = (acc[internship.domain] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topDomains = Object.entries(domainStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Salary analytics
  const paidInternships = internships.filter(i => i.isPaid && i.stipend)
  const avgInternshipStipend = paidInternships.length > 0 
    ? paidInternships.reduce((sum, i) => sum + (i.stipend || 0), 0) / paidInternships.length
    : 0

  const jobsWithSalary = jobPostings.filter(j => j.salaryMin && j.salaryMax)
  const avgJobSalary = jobsWithSalary.length > 0
    ? jobsWithSalary.reduce((sum, j) => sum + ((j.salaryMin || 0) + (j.salaryMax || 0)) / 2, 0) / jobsWithSalary.length
    : 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your company's performance
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                +{recentInternshipApplications + recentJobApplications} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAcceptanceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {totalAccepted} accepted applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInternships + activeJobPostings}</div>
              <p className="text-xs text-muted-foreground">
                {activeInternships} internships, {activeJobPostings} jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Company employees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Performance</CardTitle>
              <CardDescription>Breakdown by position type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Internships</span>
                  <span className="text-sm text-muted-foreground">
                    {internshipAcceptanceRate.toFixed(1)}% acceptance
                  </span>
                </div>
                <Progress value={internshipAcceptanceRate} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{totalInternshipApplications} applications</span>
                  <span>{acceptedInternshipApplications} accepted</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Job Postings</span>
                  <span className="text-sm text-muted-foreground">
                    {jobAcceptanceRate.toFixed(1)}% acceptance
                  </span>
                </div>
                <Progress value={jobAcceptanceRate} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{totalJobApplications} applications</span>
                  <span>{acceptedJobApplications} accepted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compensation Analytics</CardTitle>
              <CardDescription>Average compensation offered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Avg. Internship Stipend</span>
                  </div>
                  <p className="text-2xl font-bold">${avgInternshipStipend.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Per month</p>
                </div>
                <Badge variant="outline">{paidInternships.length} paid positions</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Avg. Job Salary</span>
                  </div>
                  <p className="text-2xl font-bold">${(avgJobSalary / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Per year</p>
                </div>
                <Badge variant="outline">{jobsWithSalary.length} with salary info</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Domain Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Domains</CardTitle>
              <CardDescription>Most popular internship domains</CardDescription>
            </CardHeader>
            <CardContent>
              {topDomains.length === 0 ? (
                <div className="text-center py-6">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No domain data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topDomains.map(([domain, count]) => (
                    <div key={domain} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{domain}</span>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(count / totalInternships) * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm text-muted-foreground w-8">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 30 days overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">New Applications</span>
                </div>
                <span className="text-lg font-bold">
                  {recentInternshipApplications + recentJobApplications}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Active Positions</span>
                </div>
                <span className="text-lg font-bold">
                  {activeInternships + activeJobPostings}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Growth Rate</span>
                </div>
                <span className="text-lg font-bold">
                  {totalApplications > 0 ? 
                    (((recentInternshipApplications + recentJobApplications) / totalApplications) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
            <CardDescription>Complete performance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalInternships}</div>
                <p className="text-sm text-muted-foreground">Total Internships</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalJobPostings}</div>
                <p className="text-sm text-muted-foreground">Job Postings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalApplications}</div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{overallAcceptanceRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}