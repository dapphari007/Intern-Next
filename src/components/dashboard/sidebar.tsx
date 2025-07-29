"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  Award, 
  Settings, 
  Users, 
  BookOpen,
  BarChart3,
  Shield
} from "lucide-react"

const sidebarItems = {
  INTERN: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Explore",
      href: "/explore",
      icon: Search,
    },
    {
      title: "Project Room",
      href: "/project-room",
      icon: MessageSquare,
    },
    {
      title: "Certificates",
      href: "/certificates",
      icon: Award,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ],
  MENTOR: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Interns",
      href: "/interns",
      icon: Users,
    },
    {
      title: "Internships",
      href: "/internships",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ],
  ADMIN: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Internships",
      href: "/admin/internships",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Shield,
    },
  ],
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session?.user?.role) return null

  const items = sidebarItems[session.user.role] || sidebarItems.INTERN

  return (
    <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}