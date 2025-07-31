import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AlumniManagementClient } from "@/components/company/AlumniManagementClient"

export default async function CompanyAlumniPage() {
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
            where: {
              status: 'ACCEPTED'
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  skillCredits: true,
                  createdAt: true,
                  bio: true,
                  linkedin: true,
                  github: true,
                  website: true
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
  
  // Get all alumni (users who have completed internships with the company)
  const alumni = company.internships.flatMap(internship => 
    internship.applications.map(app => ({
      ...app.user,
      internshipTitle: internship.title,
      internshipDomain: internship.domain,
      completionDate: app.updatedAt,
      certificates: [], // No certificates in query
      achievements: []  // No achievements in query
    }))
  ).filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  ) // Remove duplicates

  // Since CompanyInternship doesn't have tasks, provide empty pipeline
  const taskPipeline = [] as any[]

  return (
    <AlumniManagementClient 
      alumni={alumni}
      taskPipeline={taskPipeline}
      companyId={company.id}
    />
  )
}