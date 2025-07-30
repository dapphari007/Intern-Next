import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
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

    const mentors = await db.user.findMany({
      where: {
        companyId: user.company.id,
        role: 'MENTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(mentors)
  } catch (error) {
    console.error('Error fetching mentors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}