import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AnalyticsUpdaterService } from "@/lib/services/analytics-updater.service"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Trigger analytics update for all users
    await AnalyticsUpdaterService.forceUpdate()

    return NextResponse.json({ 
      message: "Analytics update triggered successfully",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error triggering analytics update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get service status
    const status = AnalyticsUpdaterService.getStatus()

    return NextResponse.json({
      status,
      message: status.isRunning ? "Analytics updater is running" : "Analytics updater is stopped"
    })
  } catch (error) {
    console.error("Error getting analytics updater status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}