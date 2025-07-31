import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Briefcase } from "lucide-react"
import { InternshipsPageClient } from "@/components/company/InternshipsPageClient"

export default async function CompanyInternshipsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data with internships, job postings, and applications
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
              },
              mentor: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          jobPostings: {
            include: {
              applications: {
                include: {
                  user: true
                }
              }
            },
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
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Company Associated</h2>
            <p className="text-muted-foreground">
              You need to be associated with a company to manage internships.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const company = user.company
  
  // Transform internships to match expected format
  const transformedInternships = company.internships.map(internship => ({
    ...internship,
    applications: internship.applications.map(app => ({
      id: app.id,
      status: app.status,
      createdAt: app.appliedAt.toISOString(),
      user: {
        id: app.user.id,
        name: app.user.name || 'Unknown User',
        email: app.user.email,
        image: app.user.image
      }
    })),
    mentor: internship.mentor ? {
      id: internship.mentor.id,
      name: internship.mentor.name || 'Unknown Mentor',
      email: internship.mentor.email,
      image: internship.mentor.image
    } : null
  }))

  // Transform job postings to match expected format
  const transformedJobPostings = company.jobPostings.map(job => ({
    ...job,
    requirements: job.requirements || 'No specific requirements listed',
    applications: job.applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      user: {
        id: app.user.id,
        name: app.user.name || 'Unknown User',
        email: app.user.email,
        image: app.user.image
      }
    }))
  }))

  // Calculate internship statistics
  const totalInternships = transformedInternships.length
  const activeInternships = transformedInternships.filter(i => i.isActive).length
  const totalInternshipApplications = transformedInternships.reduce((sum, i) => sum + i.applications.length, 0)
  const acceptedApplications = transformedInternships.reduce((sum, i) => 
    sum + i.applications.filter(app => app.status === 'ACCEPTED').length, 0
  )
  const paidInternships = transformedInternships.filter(i => i.isPaid && i.stipend)
  const avgStipend = paidInternships.length > 0 
    ? paidInternships.reduce((sum, i) => sum + (i.stipend || 0), 0) / paidInternships.length
    : 0

  // Calculate job posting statistics
  const totalJobs = transformedJobPostings.length
  const activeJobs = transformedJobPostings.filter(j => j.isActive).length
  const totalJobApplications = transformedJobPostings.reduce((sum, j) => sum + j.applications.length, 0)
  const avgSalary = transformedJobPostings.filter(j => j.salaryMin && j.salaryMax).length > 0 
    ? transformedJobPostings.filter(j => j.salaryMin && j.salaryMax).reduce((sum, j) => sum + ((j.salaryMin || 0) + (j.salaryMax || 0)) / 2, 0) / transformedJobPostings.filter(j => j.salaryMin && j.salaryMax).length
    : 0

  // Combine all applications for recruitment management
  const allApplications = [
    ...transformedInternships.flatMap(internship => 
      internship.applications.map(app => ({
        ...app,
        appliedAt: app.createdAt,
        type: 'internship' as const,
        position: internship.title,
        positionId: internship.id,
        user: {
          ...app.user,
          certificates: []
        },
        internship: {
          id: internship.id,
          title: internship.title,
          domain: internship.domain,
          companyId: company.id
        }
      }))
    ),
    ...transformedJobPostings.flatMap(job => 
      job.applications.map(app => ({
        id: app.id,
        status: app.status,
        createdAt: app.appliedAt.toISOString(),
        appliedAt: app.appliedAt.toISOString(),
        type: 'job' as const,
        position: job.title,
        positionId: job.id,
        user: {
          ...app.user,
          certificates: []
        },
        jobPosting: {
          id: job.id,
          title: job.title,
          jobType: job.jobType,
          companyId: company.id
        }
      }))
    )
  ]

  // Calculate recruitment statistics
  const totalAllApplications = allApplications.length
  const pendingApplications = allApplications.filter(app => app.status === 'PENDING').length
  const acceptedAllApplications = allApplications.filter(app => app.status === 'ACCEPTED').length
  const rejectedApplications = allApplications.filter(app => app.status === 'REJECTED').length

  return (
    <InternshipsPageClient
      initialInternships={transformedInternships}
      totalInternships={totalInternships}
      activeInternships={activeInternships}
      totalApplications={totalInternshipApplications}
      acceptedApplications={acceptedApplications}
      avgStipend={avgStipend}
      initialJobs={transformedJobPostings}
      totalJobs={totalJobs}
      activeJobs={activeJobs}
      totalJobApplications={totalJobApplications}
      avgSalary={avgSalary}
      initialApplications={allApplications}
      totalAllApplications={totalAllApplications}
      pendingApplications={pendingApplications}
      acceptedAllApplications={acceptedAllApplications}
      rejectedApplications={rejectedApplications}
    />
  )
}