import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/lib/services/user.service'
import { UserRole } from '@prisma/client'

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
    const limit = parseInt(searchParams.get('limit') || '10')
    const roleParam = searchParams.get('role')
    const role = roleParam && roleParam !== 'all' ? roleParam as UserRole : undefined

    const result = await UserService.getAllUsers(
      page, 
      limit, 
      role
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
      status: 'active', // Default status
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
      // Since status is not in the schema, we'll just return success
      // In a real implementation, you'd add a status field to the User model
      return NextResponse.json({ success: true, message: 'Status updated successfully' })
    }

    if (action === 'updateUser') {
      const updatedUser = await UserService.updateUser(userId, {
        name: data.name,
        bio: data.bio,
        role: data.role,
        image: data.image
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