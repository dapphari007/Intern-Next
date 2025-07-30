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

  // Fetch company data with internships
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
  const internships = company.internships

  // Calculate statistics
  const totalInternships = internships.length
  const activeInternships = internships.filter(i => i.isActive).length
  const totalApplications = internships.reduce((sum, i) => sum + i.applications.length, 0)
  const acceptedApplications = internships.reduce((sum, i) => 
    sum + i.applications.filter(app => app.status === 'ACCEPTED').length, 0
  )
  const paidInternships = internships.filter(i => i.isPaid && i.stipend)
  const avgStipend = paidInternships.length > 0 
    ? paidInternships.reduce((sum, i) => sum + (i.stipend || 0), 0) / paidInternships.length
    : 0

  return (
    <InternshipsPageClient
      initialInternships={internships}
      totalInternships={totalInternships}
      activeInternships={activeInternships}
      totalApplications={totalApplications}
      acceptedApplications={acceptedApplications}
      avgStipend={avgStipend}
    />
  )
}