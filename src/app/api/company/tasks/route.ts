import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TaskStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, internshipId, assignedTo, dueDate, priority } = body

    // Verify the company admin has access to this internship
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify the internship is mentored by someone from this company
    const internship = await db.internship.findFirst({
      where: {
        id: internshipId,
        mentor: {
          companyId: user.companyId
        }
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found or unauthorized' }, { status: 404 })
    }

    // Verify the student exists and has access to this internship
    const student = await db.user.findFirst({
      where: {
        id: assignedTo,
        role: 'INTERN',
        internships: {
          some: {
            internship: {
              mentor: {
                companyId: user.companyId
              }
            },
            status: 'ACCEPTED'
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found or not enrolled in company internships' }, { status: 404 })
    }

    // Create the task
    const task = await db.task.create({
      data: {
        title,
        description,
        internshipId,
        assignedTo,
        status: TaskStatus.PENDING,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM'
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
            mentor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Fetch all tasks where the company admin is the mentor for independent internships
    const tasks = await db.task.findMany({
      where: {
        internship: {
          mentor: {
            companyId: user.companyId
          }
        }
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
            mentor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}