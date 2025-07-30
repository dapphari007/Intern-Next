import { AnalyticsService } from "./analytics.service"

export class AnalyticsHooksService {
  /**
   * Hook to call when a task is submitted
   */
  static async onTaskSubmitted(userId: string, taskId: string) {
    try {
      // Update user analytics after task submission
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId} after task submission`)
    } catch (error) {
      console.error(`Failed to update analytics after task submission for user ${userId}:`, error)
    }
  }

  /**
   * Hook to call when a task is completed/reviewed
   */
  static async onTaskReviewed(userId: string, taskId: string, approved: boolean) {
    try {
      // Update user analytics after task review
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId} after task review (approved: ${approved})`)
    } catch (error) {
      console.error(`Failed to update analytics after task review for user ${userId}:`, error)
    }
  }

  /**
   * Hook to call when an internship application is submitted
   */
  static async onApplicationSubmitted(userId: string, internshipId: string) {
    try {
      // Update user analytics after application submission
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId} after application submission`)
    } catch (error) {
      console.error(`Failed to update analytics after application submission for user ${userId}:`, error)
    }
  }

  /**
   * Hook to call when an internship application status changes
   */
  static async onApplicationStatusChanged(userId: string, internshipId: string, status: string) {
    try {
      // Update user analytics after application status change
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId} after application status change to ${status}`)
    } catch (error) {
      console.error(`Failed to update analytics after application status change for user ${userId}:`, error)
    }
  }

  /**
   * Hook to call when credits are awarded
   */
  static async onCreditsAwarded(userId: string, amount: number, reason: string) {
    try {
      // Update user analytics after credits are awarded
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId} after ${amount} credits awarded for ${reason}`)
    } catch (error) {
      console.error(`Failed to update analytics after credits awarded for user ${userId}:`, error)
    }
  }

  /**
   * Hook to call when a certificate is issued
   */
  static async onCertificateIssued(userId: string, certificateId: string) {
    try {
      // Update user analytics after certificate issuance
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId} after certificate issuance`)
    } catch (error) {
      console.error(`Failed to update analytics after certificate issuance for user ${userId}:`, error)
    }
  }

  /**
   * Hook to call when a user logs in (for activity tracking)
   */
  static async onUserActivity(userId: string) {
    try {
      // Update last active timestamp
      await AnalyticsService.updateUserAnalytics(userId)
      console.log(`Analytics updated for user ${userId} after activity`)
    } catch (error) {
      console.error(`Failed to update analytics after user activity for user ${userId}:`, error)
    }
  }

  /**
   * Batch update analytics for multiple users
   */
  static async batchUpdateAnalytics(userIds: string[]) {
    try {
      const updatePromises = userIds.map(userId => 
        AnalyticsService.updateUserAnalytics(userId).catch(error => {
          console.error(`Failed to update analytics for user ${userId}:`, error)
          return null
        })
      )

      await Promise.all(updatePromises)
      console.log(`Batch analytics update completed for ${userIds.length} users`)
    } catch (error) {
      console.error('Failed to perform batch analytics update:', error)
    }
  }
}