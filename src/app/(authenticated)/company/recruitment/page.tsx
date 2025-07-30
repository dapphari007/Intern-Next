import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/db"
import { 
  Users, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Calendar,
  Filter,
  Download,
  UserCheck,
  UserX
} from "lucide-react"
import Link from "next/link"

export default async function CompanyRecruitmentPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data with applications
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          internships: {
            include: {
              applications: {
                include: {
                  user: {
                    include: {
                      certificates: true
                    }
                  }
                },
                orderBy: {
                  appliedAt: 'desc'
                }
              }
            }
          },
          jobPostings: {
            include: {
              applications: {
                include: {
                  user: {
                    include: {
                      certificates: true
                    }
                  }
                },
                orderBy: {
                  appliedAt: 'desc'
                }
              }
            }
          }
        }
      }
    }
  })

  if (!user?.company) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-6 pb-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Company Associated</h2>
            <p className="text-muted-foreground">
              You need to be associated with a company to manage recruitment.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const company = user.company
  
  // Get all applications
  const internshipApplications = company.internships.flatMap(internship => 
    internship.applications.map(app => ({
      ...app,
      type: 'internship',
      position: internship.title,
      positionId: internship.id
    }))
  )

  const jobApplications = company.jobPostings.flatMap(job => 
    job.applications.map(app => ({
      ...app,
      type: 'job',
      position: job.title,
      positionId: job.id
    }))
  )

  const allApplications = [...internshipApplications, ...jobApplications]

  // Calculate statistics
  const totalApplications = allApplications.length
  const pendingApplications = allApplications.filter(app => app.status === 'PENDING').length
  const acceptedApplications = allApplications.filter(app => app.status === 'ACCEPTED').length
  const rejectedApplications = allApplications.filter(app => app.status === 'REJECTED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const ApplicationCard = ({ application }: { application: any }) => (
    <div className="border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={application.user.image || undefined} />
            <AvatarFallback>
              {application.user.name?.charAt(0) || application.user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold">
                {application.user.name || application.user.email}
              </h3>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
              <Badge variant="outline">
                {application.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Applied for: {application.position}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(application.appliedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {application.user.certificates.length} certificates
              </span>
              {application.user.phone && (
                <span>{application.user.phone}</span>
              )}
            </div>
            {application.coverLetter && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {application.coverLetter}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {application.status === 'PENDING' && (
            <>
              <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                <UserCheck className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <UserX className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/messages?to=${application.user.id}`}>
              <Mail className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/company/recruitment/${application.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recruitment Management</h1>
            <p className="text-muted-foreground">
              Manage applications and recruitment process
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting decision
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedApplications}</div>
              <p className="text-xs text-muted-foreground">
                {totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(1) : 0}% acceptance rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedApplications}</div>
              <p className="text-xs text-muted-foreground">
                {totalApplications > 0 ? ((rejectedApplications / totalApplications) * 100).toFixed(1) : 0}% rejection rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Manage all recruitment applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({totalApplications})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingApplications})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({acceptedApplications})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedApplications})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {allApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Applications will appear here once candidates apply to your positions.
                    </p>
                  </div>
                ) : (
                  allApplications.map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {allApplications
                  .filter(app => app.status === 'PENDING')
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4 mt-6">
                {allApplications
                  .filter(app => app.status === 'ACCEPTED')
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-6">
                {allApplications
                  .filter(app => app.status === 'REJECTED')
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}