import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { FileText } from "lucide-react"
import { JobsPageClient } from "@/components/company/JobsPageClient"

export default async function CompanyJobsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data with job postings
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
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
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Company Associated</h2>
            <p className="text-muted-foreground">
              You need to be associated with a company to manage job postings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const company = user.company
  const jobPostings = company.jobPostings

  // Transform job postings to match the expected interface
  const transformedJobPostings = jobPostings.map(job => ({
    ...job,
    requirements: job.requirements || 'No specific requirements listed',
    applications: job.applications.map(app => ({
      id: app.id,
      status: app.status,
      user: {
        id: app.user.id,
        name: app.user.name || 'Unknown User',
        email: app.user.email,
        image: app.user.image
      }
    }))
  }))

  // Calculate statistics
  const totalJobs = jobPostings.length
  const activeJobs = jobPostings.filter(j => j.isActive).length
  const totalApplications = jobPostings.reduce((sum, j) => sum + j.applications.length, 0)
  const avgSalary = jobPostings.filter(j => j.salaryMin && j.salaryMax).length > 0 
    ? jobPostings.filter(j => j.salaryMin && j.salaryMax).reduce((sum, j) => sum + ((j.salaryMin || 0) + (j.salaryMax || 0)) / 2, 0) / jobPostings.filter(j => j.salaryMin && j.salaryMax).length
    : 0

  return (
    <JobsPageClient
      initialJobs={transformedJobPostings}
      totalJobs={totalJobs}
      activeJobs={activeJobs}
      totalApplications={totalApplications}
      avgSalary={avgSalary}
    />
  )
}