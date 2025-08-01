import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; internshipId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await db.companyInternshipTask.findUnique({
      where: { 
        id: params.taskId,
        internshipId: params.internshipId
      },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignee: {
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
          orderBy: { submittedAt: 'desc' }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify task belongs to the correct company
    if (task.internship.companyId !== params.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching company internship task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; internshipId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      assignedTo,
      dueDate,
      status
    } = body

    // Check if task exists and belongs to the correct company/internship
    const existingTask = await db.companyInternshipTask.findUnique({
      where: { 
        id: params.taskId,
        internshipId: params.internshipId
      },
      include: {
        internship: {
          select: {
            companyId: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (existingTask.internship.companyId !== params.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Validate assignee if provided
    if (assignedTo) {
      const assignee = await db.user.findUnique({
        where: { id: assignedTo },
        select: { id: true, companyId: true }
      })

      if (!assignee) {
        return NextResponse.json({ error: 'Assignee not found' }, { status: 400 })
      }

      if (assignee.companyId !== params.id) {
        return NextResponse.json({ error: 'Assignee must belong to the same company' }, { status: 400 })
      }
    }

    const updatedTask = await db.companyInternshipTask.update({
      where: { id: params.taskId },
      data: {
        title: title || existingTask.title,
        description: description || existingTask.description,
        assignedTo: assignedTo || existingTask.assignedTo,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        status: status || existingTask.status
      },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating company internship task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; internshipId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if task exists and belongs to the correct company/internship
    const task = await db.companyInternshipTask.findUnique({
      where: { 
        id: params.taskId,
        internshipId: params.internshipId
      },
      include: {
        internship: {
          select: {
            companyId: true
          }
        },
        submissions: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.internship.companyId !== params.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if task has submissions
    if (task.submissions.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete task with submissions. Please remove submissions first.' 
      }, { status: 400 })
    }

    await db.companyInternshipTask.delete({
      where: { id: params.taskId }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting company internship task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}