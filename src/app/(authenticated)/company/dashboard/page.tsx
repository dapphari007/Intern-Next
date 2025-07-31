import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { CompanyDashboardClient } from "@/components/company/CompanyDashboardClient"


export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data
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
            }
          },
          jobPostings: {
            include: {
              applications: {
                include: {
                  user: true
                }
              }
            }
          },
          users: true
        }
      }
    }
  })

  if (!user?.company) {
    redirect("/company/dashboard")
  }

  return (
    <CompanyDashboardClient 
      company={user.company}
      session={session}
    />
  )
}