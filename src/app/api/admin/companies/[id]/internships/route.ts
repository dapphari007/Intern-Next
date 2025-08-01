import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const where: any = { companyId: params.id }
    if (status) {
      where.status = status
    }

    const [internships, total] = await Promise.all([
      db.companyInternship.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true
            }
          },
          mentor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          applications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.companyInternship.count({ where })
    ])

    return NextResponse.json({
      internships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching company internships:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify company exists
    const company = await db.company.findUnique({
      where: { id: params.id }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      domain,
      duration,
      isPaid,
      stipend,
      mentorId,
      maxInterns,
      status = 'ACTIVE'
    } = body

    // Validate required fields
    if (!title || !description || !domain || !duration) {
      return NextResponse.json({ 
        error: 'Title, description, domain, and duration are required' 
      }, { status: 400 })
    }

    // Validate mentor if provided
    if (mentorId) {
      const mentor = await db.user.findUnique({
        where: { id: mentorId },
        select: { id: true, role: true, companyId: true }
      })

      if (!mentor) {
        return NextResponse.json({ error: 'Mentor not found' }, { status: 400 })
      }

      if (mentor.role !== 'MENTOR' && mentor.role !== 'COMPANY_ADMIN') {
        return NextResponse.json({ error: 'Selected user is not a mentor' }, { status: 400 })
      }

      if (mentor.companyId !== params.id) {
        return NextResponse.json({ error: 'Mentor must belong to the same company' }, { status: 400 })
      }
    }

    const internship = await db.companyInternship.create({
      data: {
        companyId: params.id,
        title,
        description,
        domain,
        duration: parseInt(duration),
        isPaid: Boolean(isPaid),
        stipend: isPaid ? parseFloat(stipend) || null : null,
        mentorId: mentorId || null,
        maxInterns: parseInt(maxInterns) || 1,
        status,
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    return NextResponse.json(internship, { status: 201 })
  } catch (error) {
    console.error('Error creating company internship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}