import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TopNavigation } from "@/components/dashboard/top-nav"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavigation />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}