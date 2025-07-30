import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AnalyticsService } from "@/lib/services/analytics.service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get complete analytics data from service
    const analyticsData = await AnalyticsService.getCompleteAnalytics()
    
    // Get additional system health data
    const systemHealth = await AnalyticsService.getSystemHealth()
    
    // Get top performers
    const topPerformers = await AnalyticsService.getTopPerformers(5)

    const response = {
      ...analyticsData,
      systemHealth,
      topPerformers: topPerformers.map(performer => ({
        id: performer.user.id,
        name: performer.user.name,
        email: performer.user.email,
        image: performer.user.image,
        averageScore: performer.averageScore,
        totalCredits: performer.totalCredits,
        completedTasks: performer.completedTasks,
        totalTasks: performer.totalTasks
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching admin analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}