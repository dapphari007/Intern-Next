import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      description,
      domain,
      duration,
      isPaid,
      stipend,
      maxInterns,
      mentorId
    } = body

    // Validate required fields
    if (!title || !description || !domain || !duration || !maxInterns || !mentorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const internship = await db.companyInternship.create({
      data: {
        title,
        description,
        domain,
        duration: parseInt(duration),
        isPaid: Boolean(isPaid),
        stipend: isPaid ? parseInt(stipend) : null,
        maxInterns: parseInt(maxInterns),
        isActive: true,
        companyId: user.company.id,
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

    return NextResponse.json(internship)
  } catch (error) {
    console.error('Error creating internship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}