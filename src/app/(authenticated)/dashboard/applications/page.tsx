import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { InternRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react"

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'INTERN') {
    redirect("/dashboard")
  }

  // Fetch user's applications
  const applications = await db.internshipApplication.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      internship: {
        include: {
          mentor: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: {
      appliedAt: 'desc'
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'default' as const
      case 'REJECTED':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Track your internship applications and their status
          </p>
        </div>
        <Button asChild>
          <a href="/explore">
            <FileText className="mr-2 h-4 w-4" />
            Apply for More
          </a>
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't applied for any internships yet. Start exploring opportunities!
            </p>
            <Button asChild>
              <a href="/explore">Browse Internships</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {application.internship.title}
                      {getStatusIcon(application.status)}
                    </CardTitle>
                    <CardDescription>
                      {application.internship.domain} • Mentor: {application.internship.mentor.name}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(application.status)}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {application.internship.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p><strong>Duration:</strong> {application.internship.duration} weeks</p>
                      <p><strong>Applied:</strong> {application.appliedAt.toLocaleDateString()}</p>
                      {application.internship.isPaid && (
                        <p><strong>Stipend:</strong> ${application.internship.stipend}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      {application.status === 'ACCEPTED' && (
                        <Button size="sm" asChild>
                          <a href="/project-room">Go to Project Room</a>
                        </Button>
                      )}
                      {application.status === 'PENDING' && (
                        <p className="text-xs text-muted-foreground">
                          Waiting for mentor response
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}