import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Users } from "lucide-react"
import { UsersPageClient } from "@/components/company/UsersPageClient"

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

  return (
    <UsersPageClient
      initialUsers={companyUsers}
      currentUserId={session.user.id}
      totalUsers={totalUsers}
      activeUsers={activeUsers}
      adminUsers={adminUsers}
      mentorUsers={mentorUsers}
      internUsers={internUsers}
    />
  )
}