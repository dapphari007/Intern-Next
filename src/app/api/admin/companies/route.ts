import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { industry: { contains: search, mode: 'insensitive' as const } },
        { location: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true
            }
          },
          internships: {
            select: {
              id: true,
              title: true,
              status: true,
              isActive: true,
              applications: {
                select: {
                  id: true,
                  status: true
                }
              }
            }
          },
          jobPostings: {
            select: {
              id: true,
              title: true,
              isActive: true
            }
          },
          _count: {
            select: {
              users: true,
              internships: true,
              jobPostings: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.company.count({ where })
    ])

    const companiesWithStats = companies.map(company => ({
      ...company,
      stats: {
        totalUsers: company._count.users,
        activeInternships: company.internships.filter(i => i.isActive && i.status === 'ACTIVE').length,
        totalInternships: company._count.internships,
        totalJobPostings: company._count.jobPostings,
        totalApplications: company.internships.reduce((acc, internship) => 
          acc + internship.applications.length, 0
        ),
        pendingApplications: company.internships.reduce((acc, internship) => 
          acc + internship.applications.filter(app => app.status === 'PENDING').length, 0
        )
      }
    }))

    return NextResponse.json({
      companies: companiesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      website,
      industry,
      size,
      location,
      logo,
      adminUserId
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    // Check if company with same name already exists
    const existingCompany = await db.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingCompany) {
      return NextResponse.json({ error: 'Company with this name already exists' }, { status: 400 })
    }

    // Validate admin user if provided
    if (adminUserId) {
      const adminUser = await db.user.findUnique({
        where: { id: adminUserId }
      })

      if (!adminUser) {
        return NextResponse.json({ error: 'Selected admin user not found' }, { status: 400 })
      }

      if (adminUser.role !== 'COMPANY_ADMIN') {
        return NextResponse.json({ error: 'Selected user must have COMPANY_ADMIN role' }, { status: 400 })
      }

      if (adminUser.companyId) {
        return NextResponse.json({ error: 'Selected user is already assigned to another company' }, { status: 400 })
      }
    }

    const company = await db.company.create({
      data: {
        name,
        description: description || null,
        website: website || null,
        industry: industry || null,
        size: size || null,
        location: location || null,
        logo: logo || null
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        internships: {
          select: {
            id: true,
            title: true,
            status: true,
            isActive: true
          }
        },
        _count: {
          select: {
            users: true,
            internships: true,
            jobPostings: true
          }
        }
      }
    })

    // Assign admin user to company if provided
    if (adminUserId) {
      await db.user.update({
        where: { id: adminUserId },
        data: { companyId: company.id }
      })
    }

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}