import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/lib/services/user.service'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN']),
  bio: z.string().optional(),
  image: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const roleParam = searchParams.get('role')
    const statusParam = searchParams.get('status')
    const searchTerm = searchParams.get('search')
    const role = roleParam && roleParam !== 'all' ? roleParam as UserRole : undefined

    const result = await UserService.getAllUsers(
      page, 
      limit, 
      role,
      statusParam && statusParam !== 'all' ? statusParam : undefined,
      searchTerm || undefined
    )

    // Transform the data to match the expected format
    const transformedUsers = result.users.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      avatar: user.image,
      bio: user.bio,
      skillCredits: user.skillCredits,
      joinedAt: user.createdAt.toISOString().split('T')[0],
      status: user.isActive ? 'active' : 'inactive',
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      resumeGDriveLink: user.resumeGDriveLink,
      phone: user.phone,
      linkedin: user.linkedin,
      github: user.github,
      website: user.website,
      location: user.location,
      completedInternships: user.certificates.length,
      currentInternships: user.role === 'INTERN' ? user.internships.length : user.mentorships.length,
      internships: user.role === 'INTERN' ? user.internships.map(app => app.internship) : user.mentorships,
      certificates: user.certificates,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action, data } = body

    if (action === 'updateStatus') {
      const updatedUser = await UserService.updateUserStatus(userId, data.status === 'active')
      return NextResponse.json({ 
        success: true, 
        message: 'Status updated successfully',
        user: updatedUser
      })
    }

    if (action === 'verifyEmail') {
      const updatedUser = await UserService.verifyUserEmail(userId)
      return NextResponse.json({ 
        success: true, 
        message: 'Email verified successfully',
        user: updatedUser
      })
    }

    if (action === 'updateUser') {
      const updatedUser = await UserService.updateUser(userId, {
        name: data.name,
        bio: data.bio,
        role: data.role,
        image: data.image,
        resumeGDriveLink: data.resumeGDriveLink,
        phone: data.phone,
        linkedin: data.linkedin,
        github: data.github,
        website: data.website,
        location: data.location
      })

      return NextResponse.json(updatedUser)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (session.user.id === userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user and all related data (cascading deletes are handled by Prisma)
    await UserService.deleteUser(userId)

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user with email already exists
    const existingUser = await UserService.getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const newUser = await UserService.createUser(validatedData)

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.image,
      bio: newUser.bio,
      skillCredits: newUser.skillCredits,
      joinedAt: newUser.createdAt.toISOString().split('T')[0],
      status: 'active',
      completedInternships: 0,
      currentInternships: 0,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}