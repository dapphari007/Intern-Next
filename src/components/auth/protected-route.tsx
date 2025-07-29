"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserRole } from "@prisma/client"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = "/auth/signin" 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      router.push("/dashboard") // Redirect to dashboard if role not allowed
      return
    }
  }, [session, status, router, allowedRoles, redirectTo])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return null
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}

export function MentorRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}

export function InternRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['INTERN', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}