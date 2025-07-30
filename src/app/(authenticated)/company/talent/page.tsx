import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { db } from "@/lib/db"
import { 
  Users, 
  Star, 
  TrendingUp,
  Award,
  Mail,
  Eye,
  Filter,
  Search,
  UserPlus,
  Target,
  Clock
} from "lucide-react"
import Link from "next/link"

export default async function CompanyTalentPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data with talent pipeline (current interns and applicants)
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
                      certificates: true,
                      tasks: {
                        include: {
                          submissions: true
                        }
                      }
                    }
                  }
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
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Company Associated</h2>
            <p className="text-muted-foreground">
              You need to be associated with a company to manage talent pipeline.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const company = user.company
  
  // Get all talent (current interns and job applicants)
  const internshipApplicants = company.internships
    .flatMap(internship => internship.applications)
    .filter(app => app.status === 'ACCEPTED')

  const jobApplicants = company.jobPostings
    .flatMap(job => job.applications)
    .filter(app => app.status === 'PENDING' || app.status === 'ACCEPTED')

  // Combine and deduplicate
  const allTalent = [...internshipApplicants.map(app => ({
    ...app.user,
    type: 'intern',
    status: app.status,
    appliedAt: app.appliedAt,
    performance: app.user.tasks.length > 0 ? 
      (app.user.tasks.filter(task => task.submissions.some(sub => sub.status === 'APPROVED')).length / app.user.tasks.length) * 100 : 0
  })), ...jobApplicants.map(app => ({
    ...app.user,
    type: 'job_applicant',
    status: app.status,
    appliedAt: app.appliedAt,
    performance: 0
  }))].filter((talent, index, self) => 
    index === self.findIndex(t => t.id === talent.id)
  )

  // Calculate statistics
  const totalTalent = allTalent.length
  const activeInterns = allTalent.filter(t => t.type === 'intern' && t.status === 'ACCEPTED').length
  const pendingApplicants = allTalent.filter(t => t.status === 'PENDING').length
  const topPerformers = allTalent.filter(t => t.performance >= 80).length

  const getTalentScore = (talent: any) => {
    let score = 0
    score += talent.certificates.length * 10
    score += talent.performance
    score += talent.skillCredits / 10
    return Math.min(score, 100)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Talent Pipeline</h1>
            <p className="text-muted-foreground">
              Manage and nurture your company's talent pool
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
              Add Talent
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Talent</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTalent}</div>
              <p className="text-xs text-muted-foreground">
                In pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Interns</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInterns}</div>
              <p className="text-xs text-muted-foreground">
                Currently working
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplicants}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topPerformers}</div>
              <p className="text-xs text-muted-foreground">
                High potential
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Talent Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>High-performing talent in your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTalent
                  .filter(talent => getTalentScore(talent) >= 70)
                  .sort((a, b) => getTalentScore(b) - getTalentScore(a))
                  .slice(0, 5)
                  .map((talent) => (
                    <div key={talent.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={talent.image || undefined} />
                        <AvatarFallback>
                          {talent.name?.charAt(0) || talent.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">
                            {talent.name || talent.email}
                          </p>
                          <Badge variant={talent.type === 'intern' ? 'default' : 'secondary'} className="text-xs">
                            {talent.type === 'intern' ? 'Intern' : 'Applicant'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={getTalentScore(talent)} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {getTalentScore(talent).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/company/talent/${talent.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Recent Applications
              </CardTitle>
              <CardDescription>Latest talent applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTalent
                  .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                  .slice(0, 5)
                  .map((talent) => (
                    <div key={talent.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={talent.image || undefined} />
                        <AvatarFallback>
                          {talent.name?.charAt(0) || talent.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">
                            {talent.name || talent.email}
                          </p>
                          <Badge variant={
                            talent.status === 'ACCEPTED' ? 'default' : 
                            talent.status === 'PENDING' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {talent.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Applied {new Date(talent.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages?to=${talent.id}`}>
                            <Mail className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/company/talent/${talent.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Talent */}
        <Card>
          <CardHeader>
            <CardTitle>All Talent</CardTitle>
            <CardDescription>Complete talent pipeline overview</CardDescription>
          </CardHeader>
          <CardContent>
            {allTalent.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No talent in pipeline</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating internships or job postings to attract talent.
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <Button asChild>
                    <Link href="/company/internships/create">
                      Create Internship
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/company/jobs/create">
                      Create Job
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {allTalent
                  .sort((a, b) => getTalentScore(b) - getTalentScore(a))
                  .map((talent) => (
                    <div key={talent.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={talent.image || undefined} />
                            <AvatarFallback>
                              {talent.name?.charAt(0) || talent.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">
                                {talent.name || talent.email}
                              </h3>
                              <Badge variant={talent.type === 'intern' ? 'default' : 'secondary'}>
                                {talent.type === 'intern' ? 'Intern' : 'Applicant'}
                              </Badge>
                              <Badge variant={
                                talent.status === 'ACCEPTED' ? 'default' : 
                                talent.status === 'PENDING' ? 'secondary' : 'destructive'
                              }>
                                {talent.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {talent.email}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Award className="h-4 w-4 mr-1" />
                                {talent.certificates.length} certificates
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {talent.skillCredits} credits
                              </span>
                              {talent.performance > 0 && (
                                <span className="flex items-center">
                                  <Star className="h-4 w-4 mr-1" />
                                  {talent.performance.toFixed(0)}% performance
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right mr-4">
                            <div className="text-sm font-medium">
                              Talent Score: {getTalentScore(talent).toFixed(0)}%
                            </div>
                            <Progress value={getTalentScore(talent)} className="w-20 h-2 mt-1" />
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/messages?to=${talent.id}`}>
                              <Mail className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/company/talent/${talent.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
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