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

    let preferences = await db.notificationPreferences.findUnique({
      where: { userId: session.user.id }
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await db.notificationPreferences.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          taskReminders: true,
          mentorMessages: true,
          certificateUpdates: true,
          marketingEmails: false,
          pushNotifications: true
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
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
      emailNotifications,
      taskReminders,
      mentorMessages,
      certificateUpdates,
      marketingEmails,
      pushNotifications
    } = body

    const preferences = await db.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications: emailNotifications ?? true,
        taskReminders: taskReminders ?? true,
        mentorMessages: mentorMessages ?? true,
        certificateUpdates: certificateUpdates ?? true,
        marketingEmails: marketingEmails ?? false,
        pushNotifications: pushNotifications ?? true,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        emailNotifications: emailNotifications ?? true,
        taskReminders: taskReminders ?? true,
        mentorMessages: mentorMessages ?? true,
        certificateUpdates: certificateUpdates ?? true,
        marketingEmails: marketingEmails ?? false,
        pushNotifications: pushNotifications ?? true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}