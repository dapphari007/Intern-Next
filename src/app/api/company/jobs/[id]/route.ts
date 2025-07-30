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

    const jobId = params.id
    const body = await request.json()
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salaryMin,
      salaryMax,
      isActive
    } = body

    // Verify job posting belongs to the company
    const existingJob = await db.jobPosting.findFirst({
      where: {
        id: jobId,
        companyId: user.company.id
      }
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 })
    }

    const updatedJob = await db.jobPosting.update({
      where: { id: jobId },
      data: {
        title,
        description,
        requirements,
        location: location || null,
        jobType,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        isActive: Boolean(isActive)
      },
      include: {
        applications: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job posting:', error)
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

    const jobId = params.id

    // Verify job posting belongs to the company
    const existingJob = await db.jobPosting.findFirst({
      where: {
        id: jobId,
        companyId: user.company.id
      }
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 })
    }

    // Delete related data first (applications)
    await db.jobApplication.deleteMany({
      where: { jobId }
    })

    // Delete the job posting
    await db.jobPosting.delete({
      where: { id: jobId }
    })

    return NextResponse.json({ message: 'Job posting deleted successfully' })
  } catch (error) {
    console.error('Error deleting job posting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}