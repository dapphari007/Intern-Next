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
  UserPlus, 
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react"
import Link from "next/link"

export default async function CompanyUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data with users
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          users: {
            orderBy: {
              createdAt: 'desc'
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
              You need to be associated with a company to manage users.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const company = user.company
  const companyUsers = company.users

  // Calculate statistics
  const totalUsers = companyUsers.length
  const activeUsers = companyUsers.filter(u => u.isActive).length
  const adminUsers = companyUsers.filter(u => u.role === 'COMPANY_ADMIN').length
  const mentorUsers = companyUsers.filter(u => u.role === 'MENTOR').length
  const internUsers = companyUsers.filter(u => u.role === 'INTERN').length

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'COMPANY_ADMIN': return 'bg-red-100 text-red-800'
      case 'MENTOR': return 'bg-blue-100 text-blue-800'
      case 'INTERN': return 'bg-green-100 text-green-800'
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage your company's team members and permissions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-muted-foreground">
                Company admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentorUsers}</div>
              <p className="text-xs text-muted-foreground">
                Team mentors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interns</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internUsers}</div>
              <p className="text-xs text-muted-foreground">
                Current interns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Overview of user roles in your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
                <p className="text-sm text-muted-foreground">Administrators</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : 0}% of team
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mentorUsers}</div>
                <p className="text-sm text-muted-foreground">Mentors</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalUsers > 0 ? ((mentorUsers / totalUsers) * 100).toFixed(1) : 0}% of team
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{internUsers}</div>
                <p className="text-sm text-muted-foreground">Interns</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalUsers > 0 ? ((internUsers / totalUsers) * 100).toFixed(1) : 0}% of team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>All users associated with your company</CardDescription>
          </CardHeader>
          <CardContent>
            {companyUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by inviting team members to join your company.
                </p>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite First User
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {companyUsers.map((companyUser) => (
                  <div key={companyUser.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={companyUser.image || undefined} />
                          <AvatarFallback>
                            {companyUser.name?.charAt(0) || companyUser.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">
                              {companyUser.name || companyUser.email}
                            </h3>
                            <Badge className={getRoleColor(companyUser.role)}>
                              {companyUser.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={companyUser.isActive ? 'default' : 'secondary'}>
                              {companyUser.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {companyUser.id === session.user.id && (
                              <Badge variant="outline">You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {companyUser.email}
                          </p>
                          {companyUser.bio && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {companyUser.bio}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {companyUser.phone && (
                              <span className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {companyUser.phone}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Joined {new Date(companyUser.createdAt).toLocaleDateString()}
                            </span>
                            {companyUser.location && (
                              <span>{companyUser.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages?to=${companyUser.id}`}>
                            <Mail className="h-4 w-4" />
                          </Link>
                        </Button>
                        {companyUser.id !== session.user.id && (
                          <>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/company/users/${companyUser.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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