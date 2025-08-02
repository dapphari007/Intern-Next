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

    const company = await db.company.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            phone: true,
            linkedin: true,
            github: true
          }
        },
        internships: {
          include: {
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
          }
        },
        jobPostings: {
          include: {
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
            }
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

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Calculate additional stats
    const stats = {
      totalUsers: company._count.users,
      activeUsers: company.users.filter(user => user.isActive).length,
      totalInternships: company._count.internships,
      activeInternships: company.internships.filter(i => i.isActive && i.status === 'ACTIVE').length,
      totalJobPostings: company._count.jobPostings,
      activeJobPostings: company.jobPostings.filter(job => job.isActive).length,
      totalApplications: company.internships.reduce((acc, internship) => 
        acc + internship.applications.length, 0
      ) + company.jobPostings.reduce((acc, job) => 
        acc + job.applications.length, 0
      ),
      pendingApplications: company.internships.reduce((acc, internship) => 
        acc + internship.applications.filter(app => app.status === 'PENDING').length, 0
      ) + company.jobPostings.reduce((acc, job) => 
        acc + job.applications.filter(app => app.status === 'PENDING').length, 0
      )
    }

    return NextResponse.json({
      ...company,
      stats
    })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if company exists
    const existingCompany = await db.company.findUnique({
      where: { id: params.id }
    })

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if another company with same name exists (excluding current company)
    const duplicateCompany = await db.company.findFirst({
      where: { 
        name: { equals: name, mode: 'insensitive' },
        id: { not: params.id }
      }
    })

    if (duplicateCompany) {
      return NextResponse.json({ error: 'Company with this name already exists' }, { status: 400 })
    }

    // Handle admin user assignment changes
    if (adminUserId !== undefined) {
      // Get current admin user for this company
      const currentAdminUser = await db.user.findFirst({
        where: { 
          companyId: params.id,
          role: 'COMPANY_ADMIN'
        }
      })

      // If adminUserId is empty string, remove current admin
      if (adminUserId === "") {
        if (currentAdminUser) {
          await db.user.update({
            where: { id: currentAdminUser.id },
            data: { companyId: null }
          })
        }
      } else {
        // Validate new admin user
        const newAdminUser = await db.user.findUnique({
          where: { id: adminUserId }
        })

        if (!newAdminUser) {
          return NextResponse.json({ error: 'Selected admin user not found' }, { status: 400 })
        }

        if (newAdminUser.role !== 'COMPANY_ADMIN') {
          return NextResponse.json({ error: 'Selected user must have COMPANY_ADMIN role' }, { status: 400 })
        }

        if (newAdminUser.companyId && newAdminUser.companyId !== params.id) {
          return NextResponse.json({ error: 'Selected user is already assigned to another company' }, { status: 400 })
        }

        // Remove current admin if different from new admin
        if (currentAdminUser && currentAdminUser.id !== adminUserId) {
          await db.user.update({
            where: { id: currentAdminUser.id },
            data: { companyId: null }
          })
        }

        // Assign new admin
        if (newAdminUser.companyId !== params.id) {
          await db.user.update({
            where: { id: adminUserId },
            data: { companyId: params.id }
          })
        }
      }
    }

    const updatedCompany = await db.company.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if company exists
    const company = await db.company.findUnique({
      where: { id: params.id },
      include: {
        users: true,
        internships: true,
        jobPostings: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if company has active internships or job postings
    const hasActiveInternships = company.internships.some(i => i.isActive)
    const hasActiveJobPostings = company.jobPostings.some(j => j.isActive)

    if (hasActiveInternships || hasActiveJobPostings) {
      return NextResponse.json({ 
        error: 'Cannot delete company with active internships or job postings. Please deactivate them first.' 
      }, { status: 400 })
    }

    // Check if company has users
    if (company.users.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete company with associated users. Please remove or reassign users first.' 
      }, { status: 400 })
    }

    await db.company.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}