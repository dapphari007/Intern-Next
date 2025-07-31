import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/lib/services/user.service'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can access their own data, admins and company admins can access users in their company
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    const targetUser = await db.user.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Allow access if:
    // 1. User is accessing their own data
    // 2. User is a global admin
    // 3. User is a company admin accessing someone from their company
    const canAccess = session.user.id === params.id ||
                     session.user.role === 'ADMIN' ||
                     (currentUser?.role === 'COMPANY_ADMIN' && 
                      currentUser?.companyId === targetUser?.companyId)

    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        internships: {
          include: {
            internship: true
          }
        },
        mentorships: true,
        certificates: true,
        creditHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        companyApplications: {
          include: {
            internship: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Transform the data to match the expected format
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      isActive: user.isActive,
      bio: user.bio,
      phone: user.phone,
      linkedin: user.linkedin,
      github: user.github,
      website: user.website,
      location: user.location,
      skillCredits: user.skillCredits,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      company: user.company ? {
        id: user.company.id,
        name: user.company.name
      } : null,
      internships: user.role === 'INTERN' ? user.internships.map(app => app.internship) : user.companyApplications.map(app => app.internship),
      mentorships: user.mentorships,
      certificates: user.certificates,
      creditHistory: user.creditHistory
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can update their own data, admins can update any user's data
    if (session.user.id !== params.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, bio, role, image } = body

    // Only admins can change roles
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (image !== undefined) updateData.image = image
    if (role !== undefined && session.user.role === 'ADMIN') {
      updateData.role = role
    }

    const updatedUser = await UserService.updateUser(params.id, updateData)

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      image: updatedUser.image,
      skillCredits: updatedUser.skillCredits,
      joinedAt: updatedUser.createdAt.toISOString().split('T')[0],
      status: 'active',
      updatedAt: updatedUser.updatedAt
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    // Check if user is company admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    const targetUser = await db.user.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if current user is company admin and both users are in the same company
    if (currentUser?.role !== 'COMPANY_ADMIN' || 
        currentUser?.companyId !== targetUser?.companyId) {
      return NextResponse.json({ error: 'Only company admin can manage users' }, { status: 403 })
    }

    // Prevent self-modification
    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
    }

    if (action === 'toggle-status') {
      const updatedUser = await db.user.update({
        where: { id: params.id },
        data: { isActive: !targetUser.isActive }
      })

      return NextResponse.json({
        id: updatedUser.id,
        isActive: updatedUser.isActive
      })
    }

    if (action === 'update-role') {
      const { role } = body

      // Validate role
      if (!['INTERN', 'MENTOR', 'COMPANY_ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }

      // Only company admins and global admins can change roles
      if (currentUser?.role !== 'COMPANY_ADMIN' && currentUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const updatedUser = await db.user.update({
        where: { id: params.id },
        data: { role }
      })

      return NextResponse.json({
        id: updatedUser.id,
        role: updatedUser.role
      })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is company admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    const targetUser = await db.user.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if current user is company admin and both users are in the same company
    if (currentUser?.role !== 'COMPANY_ADMIN' || 
        currentUser?.companyId !== targetUser?.companyId) {
      return NextResponse.json({ error: 'Only company admin can delete users' }, { status: 403 })
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Soft delete: remove user from company and deactivate
    await db.user.update({
      where: { id: params.id },
      data: { 
        companyId: null,
        isActive: false
      }
    })

    return NextResponse.json({ success: true, message: 'User removed from company successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}