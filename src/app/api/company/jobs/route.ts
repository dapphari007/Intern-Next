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
      requirements,
      location,
      jobType,
      salaryMin,
      salaryMax
    } = body

    // Validate required fields
    if (!title || !description || !requirements || !jobType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const jobPosting = await db.jobPosting.create({
      data: {
        title,
        description,
        requirements,
        location: location || null,
        jobType,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        isActive: true,
        companyId: user.company.id
      },
      include: {
        applications: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(jobPosting)
  } catch (error) {
    console.error('Error creating job posting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}