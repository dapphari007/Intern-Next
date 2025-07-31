import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { TalentPipelineClient } from "@/components/company/TalentPipelineClient"

export default async function CompanyTalentPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch user and company data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true, 
      companyId: true 
    }
  })

  if (!user?.companyId) {
    redirect("/company/dashboard")
  }

  const company = await db.company.findUnique({
    where: { id: user.companyId },
    include: {
      internships: {
        include: {
          applications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  skillCredits: true,
                  createdAt: true
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
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  skillCredits: true,
                  createdAt: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!company) {
    redirect("/company/dashboard")
  }
  
  // Get all talent (current interns and job applicants)
  const internshipApplicants = company.internships.flatMap(internship => 
    internship.applications.map(app => ({
      ...app.user,
      type: 'intern' as const,
      status: app.status,
      appliedAt: app.appliedAt,
      internshipTitle: internship.title,
      internshipDomain: internship.domain,
      performance: 0, // No tasks available for CompanyInternships
      certificates: [] // No certificates included in query
    }))
  )

  const jobApplicants = company.jobPostings.flatMap(job => 
    job.applications.map(app => ({
      ...app.user,
      type: 'job_applicant' as const,
      status: app.status,
      appliedAt: app.appliedAt,
      jobTitle: job.title,
      jobType: job.jobType,
      performance: 0,
      certificates: [] // No certificates included in query
    }))
  )

  // Combine and deduplicate
  const allTalent = [...internshipApplicants, ...jobApplicants]
    .filter((talent, index, self) => 
      index === self.findIndex(t => t.id === talent.id)
    )

  return (
    <TalentPipelineClient 
      talent={allTalent}
      companyId={company.id}
    />
  )
}