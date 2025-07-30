import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    // For broadcast messages, create individual messages for each user
    if (type === "BROADCAST") {
      const users = await db.user.findMany({
        where: {
          NOT: {
            id: session.user.id
          }
        },
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
        createdAt: "desc"
      },
      take: limit,
      skip: offset
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}