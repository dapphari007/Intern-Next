import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = params.id

    // Verify user has access to this company (admin can access all, company users can access their own)
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        ...(session.user.role !== 'ADMIN' && {
          users: { some: { id: session.user.id } }
        })
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found or access denied' }, { status: 404 })
    }

    // Fetch all tasks for company internships belonging to this company
    const tasks = await prisma.companyInternshipTask.findMany({
      where: {
        internship: {
          companyId: companyId
        }
      },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            mentor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        submissions: {
          select: {
            id: true,
            status: true,
            submittedAt: true
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching company tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}