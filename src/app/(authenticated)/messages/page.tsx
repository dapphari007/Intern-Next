import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { MessagesClient } from "@/components/messages/messages-client"

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Fetch user's messages
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Fetch users for composing messages based on role permissions
  let userFilter: any = {
    NOT: {
      id: session.user.id
    }
  }

  // Apply role-based filtering for user list
  const userRole = session.user.role
  
  if (userRole === "INTERN") {
    // Interns can message mentors, company roles, and other interns in same company
    userFilter.OR = [
      { role: { in: ["MENTOR", "COMPANY_ADMIN"] } },
      { 
        AND: [
          { role: "INTERN" },
          { companyId: session.user.companyId }
        ]
      }
    ]
  } else if (userRole === "MENTOR") {
    // Mentors can only message their assigned interns and company admin
    const mentorInternships = await db.internship.findMany({
      where: { mentorId: session.user.id },
      include: {
        applications: {
          where: { status: 'ACCEPTED' },
          select: { userId: true }
        }
      }
    })
    
    const assignedInternIds = mentorInternships.flatMap(internship => 
      internship.applications.map(app => app.userId)
    )
    
    userFilter.OR = [
      { 
        AND: [
          { role: "INTERN" },
          { id: { in: assignedInternIds } }
        ]
      },
      { 
        AND: [
          { role: "COMPANY_ADMIN" },
          { companyId: session.user.companyId }
        ]
      }
    ]
  } else if (["COMPANY_ADMIN"].includes(userRole)) {
    // Company roles can message anyone in their company + interns/mentors
    userFilter.OR = [
      { companyId: session.user.companyId },
      { role: { in: ["INTERN", "MENTOR"] } }
    ]
  }
  // ADMIN can message anyone (no filter needed)

  const users = await db.user.findMany({
    where: userFilter,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      companyId: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <MessagesClient 
      messages={messages}
      users={users}
      currentUserId={session.user.id}
    />
  )
}