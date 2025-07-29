import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/signin', '/auth/signup', '/']
    
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // If no token and trying to access protected route
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Admin only routes
    const adminRoutes = ['/admin']
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Mentor routes
    const mentorRoutes = ['/dashboard/internships', '/dashboard/manage-tasks']
    if (mentorRoutes.some(route => pathname.startsWith(route))) {
      if (token.role !== 'MENTOR' && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Intern routes
    const internRoutes = ['/dashboard/applications', '/dashboard/tasks']
    if (internRoutes.some(route => pathname.startsWith(route))) {
      if (token.role !== 'INTERN' && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        const publicRoutes = ['/auth/signin', '/auth/signup', '/']
        if (publicRoutes.includes(pathname)) {
          return true
        }

        // Require token for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}