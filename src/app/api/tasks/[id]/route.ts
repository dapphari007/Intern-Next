import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await db.task.findUnique({
      where: { id: params.id },
      include: {
        internship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has permission to view this task
    const isAdmin = session.user.role === 'ADMIN'
    const isMentor = session.user.role === 'MENTOR' && task.internship.mentorId === session.user.id
    const isAssignedUser = task.assignedTo === session.user.id

    if (!isAdmin && !isMentor && !isAssignedUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, title, description, dueDate, credits } = body

    // Check if task exists
    const existingTask = await db.task.findUnique({
      where: { id: params.id },
      include: {
        internship: {
          include: {
            mentor: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check permissions - Admin can only view, not edit tasks
    const isMentor = session.user.role === 'MENTOR' && existingTask.internship.mentorId === session.user.id
    const isCompanyAdmin = session.user.role === 'COMPANY_ADMIN' && existingTask.internship.mentor?.companyId === session.user.companyId

    if (!isMentor && !isCompanyAdmin) {
      return NextResponse.json({ error: "Forbidden - Only mentors and company admins can edit tasks" }, { status: 403 })
    }

    // Update task
    const updatedTask = await db.task.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(credits !== undefined && { credits }),
        updatedAt: new Date()
      },
      include: {
        internship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if task exists
    const existingTask = await db.task.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            submissions: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check permissions - Only mentors and company admins can delete tasks, not global admin
    const isMentor = session.user.role === 'MENTOR' && existingTask.internship?.mentorId === session.user.id
    const isCompanyAdmin = session.user.role === 'COMPANY_ADMIN' && existingTask.internship?.mentor?.companyId === session.user.companyId

    if (!isMentor && !isCompanyAdmin) {
      return NextResponse.json({ error: "Forbidden - Only mentors and company admins can delete tasks" }, { status: 403 })
    }

    // For testing purposes, allow deletion of tasks with submissions
    if (existingTask._count.submissions > 0) {
      // Delete submissions first
      await db.taskSubmission.deleteMany({
        where: { taskId: params.id }
      })
    }

    // Delete task
    await db.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}