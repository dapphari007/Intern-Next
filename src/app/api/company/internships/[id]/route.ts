import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: 'No company associated' }, { status: 400 })
    }

    const internshipId = params.id
    const body = await request.json()
    const {
      title,
      description,
      domain,
      duration,
      isPaid,
      stipend,
      isActive,
      maxInterns,
      mentorId
    } = body

    // Verify internship belongs to the company
    const existingInternship = await db.companyInternship.findFirst({
      where: {
        id: internshipId,
        companyId: user.company.id
      }
    })

    if (!existingInternship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Verify mentor belongs to the company
    const mentor = await db.user.findFirst({
      where: {
        id: mentorId,
        companyId: user.company.id,
        role: 'MENTOR'
      }
    })

    if (!mentor) {
      return NextResponse.json({ error: 'Invalid mentor' }, { status: 400 })
    }

    const updatedInternship = await db.companyInternship.update({
      where: { id: internshipId },
      data: {
        title,
        description,
        domain,
        duration: parseInt(duration),
        isPaid: Boolean(isPaid),
        stipend: isPaid ? parseInt(stipend) : null,
        isActive: Boolean(isActive),
        maxInterns: parseInt(maxInterns),
        mentorId
      },
      include: {
        mentor: true,
        applications: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(updatedInternship)
  } catch (error) {
    console.error('Error updating internship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: 'No company associated' }, { status: 400 })
    }

    const internshipId = params.id

    // Verify internship belongs to the company
    const existingInternship = await db.companyInternship.findFirst({
      where: {
        id: internshipId,
        companyId: user.company.id
      }
    })

    if (!existingInternship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Delete related data first (applications, tasks, etc.)
    await db.companyInternshipApplication.deleteMany({
      where: { internshipId }
    })

    // Delete the internship
    await db.companyInternship.delete({
      where: { id: internshipId }
    })

    return NextResponse.json({ message: 'Internship deleted successfully' })
  } catch (error) {
    console.error('Error deleting internship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}