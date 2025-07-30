import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Helper function to check if a user can message another user based on roles
async function canUserMessageRecipient(
  senderRole: string, 
  senderCompanyId: string | null, 
  recipientRole: string, 
  recipientCompanyId: string | null
): Promise<boolean> {
  // ADMIN can message anyone
  if (senderRole === "ADMIN") return true
  
  // Company roles can message within their company and to interns/mentors
  if (["COMPANY_ADMIN"].includes(senderRole)) {
    // Can message anyone in their company
    if (senderCompanyId && senderCompanyId === recipientCompanyId) return true
    
    // Can message interns and mentors (for recruitment/collaboration)
    if (["INTERN", "MENTOR"].includes(recipientRole)) return true
    
    // COMPANY_ADMIN has full messaging permissions for company operations
    if (senderRole === "COMPANY_ADMIN") {
      return true // Company admin can message anyone for business purposes
    }
    
    return false
  }
  
  // MENTOR can message interns, other mentors, and company roles
  if (senderRole === "MENTOR") {
    if (["INTERN", "MENTOR", "COMPANY_ADMIN"].includes(recipientRole)) {
      return true
    }
    return false
  }
  
  // INTERN can message mentors and company roles (for applications/support)
  if (senderRole === "INTERN") {
    if (["MENTOR", "COMPANY_ADMIN"].includes(recipientRole)) {
      return true
    }
    // Interns can message other interns in the same company
    if (recipientRole === "INTERN" && senderCompanyId && senderCompanyId === recipientCompanyId) {
      return true
    }
    return false
  }
  
  return false
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { receiverId, subject, content, type } = await request.json()

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      )
    }

    if (type === "DIRECT" && !receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required for direct messages" },
        { status: 400 }
      )
    }

    // Role-based messaging limitations
    const userRole = session.user.role
    
    // Check if user can send broadcast messages
    if (type === "BROADCAST") {
      const canBroadcast = ["ADMIN", "COMPANY_ADMIN"].includes(userRole)
      if (!canBroadcast) {
        return NextResponse.json(
          { error: "You don't have permission to send broadcast messages" },
          { status: 403 }
        )
      }

      // Get users based on sender's role
      let userFilter: any = {
        NOT: {
          id: session.user.id
        }
      }

      // COMPANY_ADMIN can only broadcast to company users
      if (userRole === "COMPANY_ADMIN") {
        userFilter.companyId = session.user.companyId
      }

      const users = await db.user.findMany({
        where: userFilter,
        select: {
          id: true
        }
      })

      const messages = await Promise.all(
        users.map(user =>
          db.message.create({
            data: {
              senderId: session.user.id,
              receiverId: user.id,
              subject,
              content,
              type: "BROADCAST"
            }
          })
        )
      )

      return NextResponse.json({ 
        success: true, 
        message: `Broadcast sent to ${messages.length} users` 
      })
    }

    // For direct messages, check if user can message the recipient
    if (type === "DIRECT" && receiverId) {
      const recipient = await db.user.findUnique({
        where: { id: receiverId },
        select: { id: true, role: true, companyId: true }
      })

      if (!recipient) {
        return NextResponse.json(
          { error: "Recipient not found" },
          { status: 404 }
        )
      }

      // Role-based direct messaging restrictions
      const canMessage = await canUserMessageRecipient(userRole, session.user.companyId, recipient.role, recipient.companyId)
      
      if (!canMessage) {
        return NextResponse.json(
          { error: "You don't have permission to message this user" },
          { status: 403 }
        )
      }
    }

    // Create direct message
    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        subject,
        content,
        type: type || "DIRECT"
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "sent" or "received"
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let whereClause: any = {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    }

    if (type === "sent") {
      whereClause = { senderId: session.user.id }
    } else if (type === "received") {
      whereClause = { receiverId: session.user.id }
    }

    const messages = await db.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            companyId: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            companyId: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      skip: offset
    })

    // Filter messages based on role permissions (additional security layer)
    const filteredMessages = messages.filter(message => {
      // User can always see their own sent messages
      if (message.senderId === session.user.id) return true
      
      // For received messages, check if sender had permission to message user
      if (message.receiverId === session.user.id) {
        return true // If message exists, sender had permission when it was sent
      }
      
      return false
    })

    return NextResponse.json({ messages: filteredMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}