import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AuthenticatedLayoutClient } from "@/components/layout/authenticated-layout-client"

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
    <AuthenticatedLayoutClient>
      {children}
    </AuthenticatedLayoutClient>
  )
}