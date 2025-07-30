import { AnalyticsService } from "./analytics.service"
import { db } from "@/lib/db"

export class AnalyticsUpdaterService {
  private static updateInterval: NodeJS.Timeout | null = null
  private static isRunning = false

  /**
   * Start the analytics updater service
   * This will run periodically to update user analytics
   */
  static start(intervalMinutes: number = 60) {
    if (this.isRunning) {
      console.log('Analytics updater is already running')
      return
    }

    this.isRunning = true
    console.log(`Starting analytics updater service (interval: ${intervalMinutes} minutes)`)

    // Run immediately
    this.updateAllUserAnalytics()

    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.updateAllUserAnalytics()
    }, intervalMinutes * 60 * 1000)
  }

  /**
   * Stop the analytics updater service
   */
  static stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.isRunning = false
    console.log('Analytics updater service stopped')
  }

  /**
   * Update analytics for all users
   */
  static async updateAllUserAnalytics() {
    try {
      console.log('Starting analytics update for all users...')
      
      // Get all users with INTERN role
      const users = await db.user.findMany({
        where: { role: 'INTERN' },
        select: { id: true }
      })

      console.log(`Found ${users.length} users to update`)

      // Update analytics for each user in batches
      const batchSize = 10
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(user => 
            AnalyticsService.updateUserAnalytics(user.id).catch(error => {
              console.error(`Failed to update analytics for user ${user.id}:`, error)
            })
          )
        )

        // Small delay between batches to avoid overwhelming the database
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log('Analytics update completed successfully')
    } catch (error) {
      console.error('Error updating user analytics:', error)
    }
  }

  /**
   * Update analytics for a specific user
   */
  static async updateUserAnalytics(userId: string) {
    try {
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId}`)
    } catch (error) {
      console.error(`Failed to update analytics for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get service status
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.updateInterval !== null
    }
  }

  /**
   * Force update analytics for all users (manual trigger)
   */
  static async forceUpdate() {
    console.log('Force updating analytics for all users...')
    await this.updateAllUserAnalytics()
  }

  /**
   * Clean up old analytics data (optional maintenance)
   */
  static async cleanupOldData(daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      // This is a placeholder for cleanup logic
      // In a real application, you might want to archive or delete old analytics data
      console.log(`Cleanup would remove analytics data older than ${cutoffDate.toISOString()}`)
      
      // Example: Remove old credit history entries
      const deletedRecords = await db.creditHistory.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })

      console.log(`Cleaned up ${deletedRecords.count} old credit history records`)
    } catch (error) {
      console.error('Error cleaning up old analytics data:', error)
    }
  }
}

// Auto-start the service in production
if (process.env.NODE_ENV === 'production') {
  // Start with 30-minute intervals in production
  AnalyticsUpdaterService.start(30)
} else if (process.env.NODE_ENV === 'development') {
  // Start with 5-minute intervals in development for testing
  AnalyticsUpdaterService.start(5)
}

// Graceful shutdown
process.on('SIGTERM', () => {
  AnalyticsUpdaterService.stop()
})

process.on('SIGINT', () => {
  AnalyticsUpdaterService.stop()
})