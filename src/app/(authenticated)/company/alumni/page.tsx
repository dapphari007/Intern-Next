import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { db } from "@/lib/db"
import { 
  Users, 
  Award, 
  Calendar,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Filter
} from "lucide-react"
import Link from "next/link"

export default async function CompanyAlumniPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data with alumni (users who completed internships)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          internships: {
            include: {
              applications: {
                where: {
                  status: 'ACCEPTED'
                },
                include: {
                  user: {
                    include: {
                      certificates: true
                    }
                  }
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
              You need to be associated with a company to manage alumni.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const company = user.company
  
  // Get all alumni (users who have completed internships with the company)
  const alumni = company.internships
    .flatMap(internship => internship.applications)
    .map(app => app.user)
    .filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    ) // Remove duplicates

  // Calculate statistics
  const totalAlumni = alumni.length
  const certificatedAlumni = alumni.filter(alum => alum.certificates.length > 0).length
  const activeAlumni = alumni.filter(alum => alum.isActive).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Alumni Management</h1>
            <p className="text-muted-foreground">
              Connect with and manage your company's alumni network
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Alumni
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAlumni}</div>
              <p className="text-xs text-muted-foreground">
                Former interns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alumni</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlumni}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificated</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificatedAlumni}</div>
              <p className="text-xs text-muted-foreground">
                With certificates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalAlumni > 0 ? ((activeAlumni / totalAlumni) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Active participation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alumni List */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni Directory</CardTitle>
            <CardDescription>Your company's alumni network</CardDescription>
          </CardHeader>
          <CardContent>
            {alumni.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No alumni yet</h3>
                <p className="text-muted-foreground mb-4">
                  Alumni will appear here once interns complete their programs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumni.map((alum) => (
                  <div key={alum.id} className="border rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={alum.image || undefined} />
                        <AvatarFallback>
                          {alum.name?.charAt(0) || alum.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {alum.name || alum.email}
                          </h3>
                          <Badge variant={alum.isActive ? 'default' : 'secondary'} className="text-xs">
                            {alum.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alum.email}
                        </p>
                        {alum.bio && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {alum.bio}
                          </p>
                        )}
                        
                        {/* Stats */}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {alum.certificates.length} certs
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(alum.createdAt).getFullYear()}
                          </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center space-x-2 mb-3">
                          {alum.linkedin && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={alum.linkedin} target="_blank">
                                <Linkedin className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          {alum.github && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={alum.github} target="_blank">
                                <Github className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          {alum.website && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={alum.website} target="_blank">
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/messages?to=${alum.id}`}>
                              <Mail className="h-3 w-3 mr-1" />
                              Message
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/company/alumni/${alum.id}`}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}