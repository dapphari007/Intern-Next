import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; internshipId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Verify internship exists and belongs to the company
    const internship = await db.companyInternship.findUnique({
      where: { 
        id: params.internshipId,
        companyId: params.id
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    const where: any = { internshipId: params.internshipId }
    if (status) {
      where.status = status
    }

    const [tasks, total] = await Promise.all([
      db.companyInternshipTask.findMany({
        where,
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
          },
          _count: {
            select: {
              submissions: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.companyInternshipTask.count({ where })
    ])

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching company internship tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; internshipId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify internship exists and belongs to the company
    const internship = await db.companyInternship.findUnique({
      where: { 
        id: params.internshipId,
        companyId: params.id
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      assignedTo,
      dueDate,
      status = 'PENDING'
    } = body

    // Validate required fields
    if (!title || !description || !assignedTo) {
      return NextResponse.json({ 
        error: 'Title, description, and assignedTo are required' 
      }, { status: 400 })
    }

    // Validate assignee
    const assignee = await db.user.findUnique({
      where: { id: assignedTo },
      select: { id: true, companyId: true, role: true }
    })

    if (!assignee) {
      return NextResponse.json({ error: 'Assignee not found' }, { status: 400 })
    }

    if (assignee.companyId !== params.id) {
      return NextResponse.json({ error: 'Assignee must belong to the same company' }, { status: 400 })
    }

    const task = await db.companyInternshipTask.create({
      data: {
        internshipId: params.internshipId,
        title,
        description,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
        status
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating company internship task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}