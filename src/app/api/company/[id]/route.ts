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

    if (!user?.company || user.company.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized to update this company' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      website,
      industry,
      size,
      location,
      logo
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
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
      }
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}