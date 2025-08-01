"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
  ChevronRight,
  LogOut,
  Building
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
    Briefcase,
    Building
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
      title: "Explore",
      href: "/explore",
      icon: "Search",
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
      title: "Messages",
      href: "/messages",
      icon: "MessageSquare",
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
      title: "Explore",
      href: "/explore",
      icon: "Search",
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
      title: "Messages",
      href: "/messages",
      icon: "MessageSquare",
    },
    {
      title: "Analytics",
      href: "/mentor/analytics",
      icon: "BarChart3",
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
  ADMIN: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: "LayoutDashboard",
    },
    {
      title: "Explore",
      href: "/explore",
      icon: "Search",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "Users",
    },
    {
      title: "Companies",
      href: "/admin/companies",
      icon: "Building",
    },
    {
      title: "Internships",
      href: "/admin/internships",
      icon: "Briefcase",
    },
    {
      title: "Task Management",
      href: "/admin/tasks",
      icon: "CheckSquare",
    },
    {
      title: "Messages",
      href: "/messages",
      icon: "MessageSquare",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: "BarChart3",
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
  COMPANY_ADMIN: [
    {
      title: "Dashboard",
      href: "/company/dashboard",
      icon: "Building",
    },
    {
      title: "Internships",
      href: "/company/internships",
      icon: "Briefcase",
    },
    {
      title: "Task Management",
      href: "/company/tasks",
      icon: "CheckSquare",
    },
     {
      title: "User Management",
      href: "/company/users",
      icon: "Users",
    },
    {
      title: "Messages",
      href: "/messages",
      icon: "MessageSquare",
    },
    {
      title: "Analytics",
      href: "/company/analytics",
      icon: "BarChart3",
    },
    {
      title: "Talent Pipeline",
      href: "/company/talent",
      icon: "Users",
    },
    {
      title: "Alumni Management",
      href: "/company/alumni",
      icon: "Users",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "Settings",
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
      "border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 h-full flex-shrink-0",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 border-b h-16 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
  <h2 className="text-lg font-semibold">InternHub</h2>
</div>

          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 p-4">
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
                <Icon className={cn(isCollapsed ? "h-5 w-5" : "h-4 w-4", !isCollapsed && "mr-3")} />
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
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t space-y-4">
          {/* User Stats */}
          {!isCollapsed && userStats && (
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
          )}
          
          {/* User Profile & Logout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.role}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}