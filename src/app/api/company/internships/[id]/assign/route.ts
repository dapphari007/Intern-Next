import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if current user is company admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (currentUser?.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Only company admin can assign users to internships' }, { status: 403 })
    }

    // Check if internship exists and belongs to the company
    const internship = await db.companyInternship.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    if (internship.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: 'Internship does not belong to your company' }, { status: 403 })
    }

    // Check if user exists and belongs to the same company
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: 'User does not belong to your company' }, { status: 403 })
    }

    if (targetUser.role !== 'INTERN') {
      return NextResponse.json({ error: 'Only interns can be assigned to internships' }, { status: 400 })
    }

    // Check if user is already assigned to this internship
    const existingApplication = await db.companyInternshipApplication.findUnique({
      where: {
        internshipId_userId: {
          internshipId: params.id,
          userId: userId
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'User is already assigned to this internship' }, { status: 400 })
    }

    // Create internship application with accepted status
    const application = await db.companyInternshipApplication.create({
      data: {
        internshipId: params.id,
        userId: userId,
        status: 'ACCEPTED',
        appliedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        internship: true,
        user: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User assigned to internship successfully',
      application
    })
  } catch (error) {
    console.error('Error assigning user to internship:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}