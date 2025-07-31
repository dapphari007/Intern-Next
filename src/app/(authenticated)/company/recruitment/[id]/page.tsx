import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ApplicationDetailsClient } from "@/components/company/ApplicationDetailsClient"

interface ApplicationDetailsPageProps {
  params: {
    id: string
  }
}

async function getApplication(applicationId: string, userEmail: string) {
  try {
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: { company: true }
    })

    if (!user?.company) {
      return null
    }

    // Try to find a job application first
    const jobApplication = await db.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId: user.company.id
        }
      },
      include: {
        user: {
          include: {
            certificates: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            jobType: true,
            companyId: true
          }
        }
      }
    })

    if (jobApplication) {
      return {
        ...jobApplication,
        jobPosting: jobApplication.job,
        job: undefined // Remove the original job field to match expected structure
      }
    }

    // If not found, try to find a company internship application
    const internshipApplication = await db.companyInternshipApplication.findFirst({
      where: {
        id: applicationId,
        internship: {
          companyId: user.company.id
        }
      },
      include: {
        user: {
          include: {
            certificates: true
          }
        },
        internship: {
          select: {
            id: true,
            title: true,
            domain: true,
            companyId: true
          }
        }
      }
    })

    return internshipApplication
  } catch (error) {
    console.error("Error fetching application:", error)
    return null
  }
}

export default async function ApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const application = await getApplication(params.id, session.user.email)

  if (!application) {
    redirect("/company/recruitment")
  }

  return (
    <div className="container mx-auto py-6">
      <ApplicationDetailsClient application={application} />
    </div>
  )
}