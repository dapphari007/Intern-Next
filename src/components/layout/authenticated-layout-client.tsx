"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TopNavigation } from "@/components/dashboard/top-nav"

interface AuthenticatedLayoutClientProps {
  children: React.ReactNode
}

export function AuthenticatedLayoutClient({ children }: AuthenticatedLayoutClientProps) {
  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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