import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN and COMPANY_ADMIN can create tasks
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!session.user.companyId) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, internshipId, credits, dueDate, assigneeEmail } = body

    // Validate required fields
    if (!title || !description || !internshipId) {
      return NextResponse.json({ 
        error: "Missing required fields: title, description, internshipId" 
      }, { status: 400 })
    }

    // Verify the internship belongs to the user's company
    const internship = await db.companyInternship.findFirst({
      where: {
        id: internshipId,
        companyId: session.user.companyId
      }
    })

    if (!internship) {
      return NextResponse.json({ 
        error: "Internship not found or doesn't belong to your company" 
      }, { status: 404 })
    }

    // Find assignee if email provided
    let assigneeId = null
    if (assigneeEmail) {
      const assignee = await db.user.findUnique({
        where: { email: assigneeEmail },
        select: { id: true, role: true }
      })

      if (!assignee) {
        return NextResponse.json({ 
          error: "Assignee not found with provided email" 
        }, { status: 404 })
      }

      if (assignee.role !== 'INTERN') {
        return NextResponse.json({ 
          error: "Can only assign tasks to users with INTERN role" 
        }, { status: 400 })
      }

      assigneeId = assignee.id
    }

    // Create the task
    const task = await db.companyInternshipTask.create({
      data: {
        title,
        description,
        internshipId,
        credits: credits ? parseInt(credits) : 10,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assigneeId || session.user.id, // Assign to creator if no assignee specified
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        internship: {
          select: {
            id: true,
            title: true,
            domain: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        submissions: true
      }
    })

    return NextResponse.json({ 
      message: "Task created successfully", 
      task 
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}