import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { InternDashboard } from "@/components/dashboard/intern-dashboard"
import { MentorDashboard } from "@/components/dashboard/mentor-dashboard"
import { UserRole } from "@/types"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <div>Please sign in to access your dashboard.</div>
  }

  const userRole = session.user.role as UserRole

  switch (userRole) {
    case UserRole.INTERN:
      return <InternDashboard />
    case UserRole.MENTOR:
      return <MentorDashboard />
    case UserRole.ADMIN:
      return <MentorDashboard /> // Admin can see mentor view for now
    default:
      return <InternDashboard />
  }
}