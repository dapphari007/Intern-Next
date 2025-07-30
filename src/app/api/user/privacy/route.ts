import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let preferences = await db.privacyPreferences.findUnique({
      where: { userId: session.user.id }
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await db.privacyPreferences.create({
        data: {
          userId: session.user.id,
          profileVisibility: "public",
          showEmail: false,
          showPhone: false,
          allowMentorContact: true,
          showOnlineStatus: true,
          allowDataCollection: true
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching privacy preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      profileVisibility,
      showEmail,
      showPhone,
      allowMentorContact,
      showOnlineStatus,
      allowDataCollection
    } = body

    const preferences = await db.privacyPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        profileVisibility: profileVisibility ?? "public",
        showEmail: showEmail ?? false,
        showPhone: showPhone ?? false,
        allowMentorContact: allowMentorContact ?? true,
        showOnlineStatus: showOnlineStatus ?? true,
        allowDataCollection: allowDataCollection ?? true,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        profileVisibility: profileVisibility ?? "public",
        showEmail: showEmail ?? false,
        showPhone: showPhone ?? false,
        allowMentorContact: allowMentorContact ?? true,
        showOnlineStatus: showOnlineStatus ?? true,
        allowDataCollection: allowDataCollection ?? true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Privacy preferences updated successfully',
      preferences
    })
  } catch (error) {
    console.error('Error updating privacy preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}