"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  Award, 
  Settings, 
  Users, 
  BookOpen,
  BarChart3,
  Shield,
  FileText,
  CheckSquare,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const getIcon = (iconName: string) => {
  const icons: { [key: string]: any } = {
    LayoutDashboard,
    Search,
    MessageSquare,
    Award,
    Settings,
    Users,
    BookOpen,
    BarChart3,
    Shield,
    FileText,
    CheckSquare,
    Briefcase
  }
  return icons[iconName] || LayoutDashboard
}

const sidebarItems = {
  INTERN: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: "My Applications",
      href: "/dashboard/applications",
      icon: "FileText",
    },
    {
      title: "Tasks",
      href: "/dashboard/tasks",
      icon: "CheckSquare",
    },
    {
      title: "Project Room",
      href: "/project-room",
      icon: "MessageSquare",
    },
    {
      title: "Certificates",
      href: "/certificates",
      icon: "Award",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "Settings",
    },
  ],
  MENTOR: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: "My Internships",
      href: "/dashboard/internships",
      icon: "Briefcase",
    },
    {
      title: "Manage Tasks",
      href: "/dashboard/manage-tasks",
      icon: "CheckSquare",
    },
    {
      title: "Project Room",
      href: "/project-room",
      icon: "MessageSquare",
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: "BarChart3",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "Settings",
    },
  ],
  ADMIN: [
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: "LayoutDashboard",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "Users",
    },
    {
      title: "Internships",
      href: "/admin/internships",
      icon: "Briefcase",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: "BarChart3",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: "Shield",
    },
  ],
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)

  // Fetch user stats
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}/stats`)
        .then(res => res.json())
        .then(data => setUserStats(data))
        .catch(console.error)
    }
  }, [session?.user?.id])

  if (!session?.user?.role) return null

  const items = sidebarItems[session.user.role] || sidebarItems.INTERN

  const isActivePath = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className={cn(
      "border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {session.user.role}
                </Badge>
                {userStats && (
                  <Badge variant="outline" className="text-xs">
                    {userStats.skillCredits} Credits
                  </Badge>
                )}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-2 p-4">
          {items.map((item) => {
            const Icon = getIcon(item.icon)
            const isActive = isActivePath(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <span className="truncate">{item.title}</span>
                )}
                {isCollapsed && (
                  <span className="sr-only">{item.title}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* User Stats Footer */}
        {!isCollapsed && userStats && (
          <div className="p-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Total Tasks:</span>
                <span>{userStats.totalTasks}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Completed:</span>
                <span>{userStats.completedTasks}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Certificates:</span>
                <span>{userStats.certificates}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}