import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/lib/services/user.service'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let wallet = await UserService.getUserWallet(session.user.id)

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await UserService.createUserWallet(session.user.id)
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error fetching user wallet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}