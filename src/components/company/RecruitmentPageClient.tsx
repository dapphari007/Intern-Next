"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
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

interface Application {
  id: string
  status: string
  appliedAt: Date | string
  coverLetter?: string | null
  type: 'internship' | 'job'
  position: string
  positionId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    phone?: string | null
    certificates: any[]
  }
}

interface RecruitmentPageClientProps {
  initialApplications: Application[]
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
}

export function RecruitmentPageClient({
  initialApplications,
  totalApplications,
  pendingApplications,
  acceptedApplications,
  rejectedApplications
}: RecruitmentPageClientProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    setIsLoading(applicationId)
    try {
      const response = await fetch(`/api/company/applications/${applicationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} application`)
      }

      // Update the application status locally
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
          : app
      ))

      toast({
        title: "Success",
        description: `Application ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} application`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const ApplicationCard = ({ application }: { application: Application }) => (
    <div className="border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={application.user.image || undefined} />
            <AvatarFallback>
              {application.user.name?.charAt(0) || application.user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1 flex-wrap">
              <h3 className="font-semibold truncate">
                {application.user.name || application.user.email}
              </h3>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
              <Badge variant="outline">
                {application.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2 truncate">
              Applied for: {application.position}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3 flex-wrap">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {typeof application.appliedAt === 'string' 
                  ? new Date(application.appliedAt).toLocaleDateString()
                  : application.appliedAt.toLocaleDateString()}
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
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          {application.status === 'PENDING' && (
            <>
              <Button 
                onClick={() => handleApplicationAction(application.id, 'accept')}
                disabled={isLoading === application.id}
                variant="outline" 
                size="sm" 
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Accept Application"
              >
                {isLoading === application.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
              </Button>
              <Button 
                onClick={() => handleApplicationAction(application.id, 'reject')}
                disabled={isLoading === application.id}
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject Application"
              >
                {isLoading === application.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                ) : (
                  <UserX className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" asChild title="Send Message">
            <Link href={`/messages?to=${application.user.id}`}>
              <Mail className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild title="View Details">
            <Link href={`/company/recruitment/${application.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )

  // Recalculate stats based on current applications
  const currentStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    accepted: applications.filter(app => app.status === 'ACCEPTED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  }

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
              <div className="text-2xl font-bold">{currentStats.total}</div>
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
              <div className="text-2xl font-bold">{currentStats.pending}</div>
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
              <div className="text-2xl font-bold">{currentStats.accepted}</div>
              <p className="text-xs text-muted-foreground">
                {currentStats.total > 0 ? ((currentStats.accepted / currentStats.total) * 100).toFixed(1) : 0}% acceptance rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats.rejected}</div>
              <p className="text-xs text-muted-foreground">
                {currentStats.total > 0 ? ((currentStats.rejected / currentStats.total) * 100).toFixed(1) : 0}% rejection rate
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
                <TabsTrigger value="all">All ({currentStats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({currentStats.pending})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({currentStats.accepted})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({currentStats.rejected})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Applications will appear here once candidates apply to your positions.
                    </p>
                  </div>
                ) : (
                  applications.map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {applications
                  .filter(app => app.status === 'PENDING')
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4 mt-6">
                {applications
                  .filter(app => app.status === 'ACCEPTED')
                  .map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-6">
                {applications
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