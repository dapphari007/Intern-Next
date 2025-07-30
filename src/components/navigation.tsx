"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  LogOut, 
  Settings, 
  Award, 
  Menu,
  LayoutDashboard,
  Search,
  FileText,
  CheckSquare,
  Users,
  Briefcase,
  Shield,
  BarChart,
  ChevronDown,
  Building,
  UserCheck,
  Clipboard,
  UserPlus,
  MessageSquare
} from "lucide-react"
import { NavigationService } from "@/lib/services/navigation.service"
import { cn } from "@/lib/utils"

export function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)

  const navigationItems = NavigationService.getNavigationItems(session?.user?.role)
  const dropdownItems = NavigationService.getDropdownItems(session?.user?.role)

  // Fetch user stats for display
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}/stats`)
        .then(res => res.json())
        .then(data => setUserStats(data))
        .catch(console.error)
    }
  }, [session?.user?.id])

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      LayoutDashboard,
      Search,
      FileText,
      CheckSquare,
      Users,
      Briefcase,
      Shield,
      BarChart,
      Award,
      Settings,
      User,
      Building,
      UserCheck,
      Clipboard,
      UserPlus,
      MessageSquare
    }
    return icons[iconName] || User
  }

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const MobileNavigation = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="text-xl font-bold text-primary" onClick={() => setIsOpen(false)}>
              InternHub
            </Link>
            {session?.user?.role && (
              <Badge variant="secondary" className="text-xs">
                {session.user.role}
              </Badge>
            )}
          </div>
          
          {/* User Info */}
          {session && (
            <div className="p-4 border-b bg-muted/50">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
              {userStats && (
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {userStats.skillCredits} Credits
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {userStats.certificates} Certificates
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation */}
          {session ? (
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-2">
                {navigationItems.map((item) => {
                  const Icon = getIcon(item.icon || 'User')
                  
                  if (item.children) {
                    return (
                      <div key={item.href} className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-muted-foreground">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = getIcon(child.icon || 'User')
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors",
                                  isActivePath(child.href)
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <ChildIcon className="h-4 w-4" />
                                <span>{child.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors",
                        isActivePath(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Please sign in to access the platform</p>
                <div className="space-y-2">
                  <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          {session && (
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  setIsOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <MobileNavigation />
              <Link href="/" className="text-2xl font-bold text-primary">
                InternHub
              </Link>
              {session?.user?.role && (
                <Badge variant="outline" className="hidden sm:inline-flex text-xs">
                  {session.user.role}
                </Badge>
              )}
            </div>
            
            {session && (
              <div className="hidden md:flex items-center space-x-6">
                {navigationItems.slice(0, 5).map((item) => {
                  if (item.children) {
                    return (
                      <DropdownMenu key={item.href}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="text-sm font-medium">
                            {item.label}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {item.children.map((child) => {
                            const ChildIcon = getIcon(child.icon || 'User')
                            return (
                              <DropdownMenuItem key={child.href} asChild>
                                <Link href={child.href} className="cursor-pointer flex items-center">
                                  <ChildIcon className="mr-2 h-4 w-4" />
                                  {child.label}
                                </Link>
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }

                  return (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isActivePath(item.href)
                          ? "text-primary border-b-2 border-primary pb-1"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                      {userStats && (
                        <div className="flex items-center space-x-2 pt-1">
                          <Badge variant="secondary" className="text-xs">
                            {userStats.skillCredits} Credits
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {userStats.certificates} Certificates
                          </Badge>
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {dropdownItems.map((item) => {
                    const Icon = getIcon(item.icon || 'User')
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="cursor-pointer">
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onSelect={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}