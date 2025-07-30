import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { InternDashboard } from "@/components/dashboard/intern-dashboard"
import { MentorDashboard } from "@/components/dashboard/mentor-dashboard"
import { UserService } from "@/lib/services/user.service"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get full user data from database
  const user = await UserService.getUserById(session.user.id)
  
  if (!user) {
    redirect("/auth/signin")
  }

  // Admin users should go to admin dashboard
  if (user.role === 'ADMIN') {
    redirect("/admin")
  }

  // Company roles should go to their respective dashboards
  if (['COMPANY_ADMIN', 'COMPANY_MANAGER'].includes(user.role)) {
    redirect("/company/dashboard")
  }

  if (user.role === 'HR_MANAGER') {
    redirect("/hr/dashboard")
  }

  if (user.role === 'COMPANY_COORDINATOR') {
    redirect("/coordinator/dashboard")
  }

  switch (user.role) {
    case 'INTERN':
      return <InternDashboard user={user} />
    case 'MENTOR':
      return <MentorDashboard user={user} />
    default:
      return <InternDashboard user={user} />
  }
}