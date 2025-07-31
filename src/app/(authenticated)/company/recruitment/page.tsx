import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { RecruitmentPageClient } from "@/components/company/RecruitmentPageClient"
import { Users } from "lucide-react"

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
      type: 'internship' as const,
      position: internship.title,
      positionId: internship.id
    }))
  )

  const jobApplications = company.jobPostings.flatMap(job => 
    job.applications.map(app => ({
      ...app,
      type: 'job' as const,
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

  return (
    <RecruitmentPageClient
      initialApplications={allApplications}
      totalApplications={totalApplications}
      pendingApplications={pendingApplications}
      acceptedApplications={acceptedApplications}
      rejectedApplications={rejectedApplications}
    />
  )
}