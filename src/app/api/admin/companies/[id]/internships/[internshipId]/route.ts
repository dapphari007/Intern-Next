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

    const internship = await db.companyInternship.findUnique({
      where: { 
        id: params.internshipId,
        companyId: params.id
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
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                linkedin: true,
                github: true
              }
            }
          },
          orderBy: { appliedAt: 'desc' }
        }
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    return NextResponse.json(internship)
  } catch (error) {
    console.error('Error fetching company internship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; internshipId: string } }
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
      domain,
      duration,
      isPaid,
      stipend,
      mentorId,
      maxInterns,
      status,
      isActive
    } = body

    // Check if internship exists and belongs to the company
    const existingInternship = await db.companyInternship.findUnique({
      where: { 
        id: params.internshipId,
        companyId: params.id
      }
    })

    if (!existingInternship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
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

    const updatedInternship = await db.companyInternship.update({
      where: { id: params.internshipId },
      data: {
        title: title || existingInternship.title,
        description: description || existingInternship.description,
        domain: domain || existingInternship.domain,
        duration: duration ? parseInt(duration) : existingInternship.duration,
        isPaid: isPaid !== undefined ? Boolean(isPaid) : existingInternship.isPaid,
        stipend: isPaid ? (stipend ? parseFloat(stipend) : null) : null,
        mentorId: mentorId !== undefined ? mentorId : existingInternship.mentorId,
        maxInterns: maxInterns ? parseInt(maxInterns) : existingInternship.maxInterns,
        status: status || existingInternship.status,
        isActive: isActive !== undefined ? Boolean(isActive) : existingInternship.isActive
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

    return NextResponse.json(updatedInternship)
  } catch (error) {
    console.error('Error updating company internship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; internshipId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if internship exists and belongs to the company
    const internship = await db.companyInternship.findUnique({
      where: { 
        id: params.internshipId,
        companyId: params.id
      },
      include: {
        applications: true
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Check if internship has applications
    if (internship.applications.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete internship with applications. Please remove applications first or deactivate the internship.' 
      }, { status: 400 })
    }

    await db.companyInternship.delete({
      where: { id: params.internshipId }
    })

    return NextResponse.json({ message: 'Internship deleted successfully' })
  } catch (error) {
    console.error('Error deleting company internship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}