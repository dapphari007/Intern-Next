"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function DeactivatedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is not deactivated, redirect to dashboard
    if (status === "loading") return // Still loading
    
    if (!session?.user || session.user.isActive !== false) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // If user is active or no session, don't show this page
  if (!session?.user || session.user.isActive !== false) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Account Deactivated
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your account has been deactivated by an administrator
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Restricted</CardTitle>
            <CardDescription className="text-center">
              Your account is currently inactive and you cannot access the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Account Status: Inactive
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>
                      An administrator has deactivated your account. This means you cannot:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Access the dashboard</li>
                      <li>View or apply for internships</li>
                      <li>Submit tasks or assignments</li>
                      <li>Send or receive messages</li>
                      <li>Access any platform features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Need Help?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      If you believe this is a mistake or would like to reactivate your account, 
                      please contact the administrator:
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href="mailto:admin@internhub.com" className="underline hover:no-underline">
                          admin@internhub.com
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
              
              <div className="text-center">
                <Link 
                  href="/" 
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Return to Home Page
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Account ID: {session.user.id}</p>
          <p>Deactivated on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}