import { db } from "@/lib/db"
import { UserRole, ApplicationStatus, InternshipStatus, CertificateStatus } from "@prisma/client"

export interface AnalyticsOverview {
  totalUsers: number
  totalInternships: number
  totalApplications: number
  totalCertificates: number
  userGrowth: number
  internshipGrowth: number
  applicationGrowth: number
  certificateGrowth: number
}

export interface UserStats {
  interns: number
  mentors: number
  admins: number
  activeUsers: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
}

export interface InternshipStats {
  active: number
  completed: number
  pending: number
  cancelled: number
}

export interface MonthlyData {
  month: string
  users: number
  internships: number
  applications: number
  certificates: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  userStats: UserStats
  internshipStats: InternshipStats
  monthlyData: MonthlyData[]
  completionRate?: {
    totalInternships: number
    completedInternships: number
    completionRate: number
    completionText: string
  }
}

export class AnalyticsService {
  private static async getDateRanges() {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    
    return { now, lastMonth, lastWeek, lastDay, sixMonthsAgo }
  }

  static async getOverviewStats(): Promise<AnalyticsOverview> {
    const { now, lastMonth } = await this.getDateRanges()

    // Current totals
    const [
      totalUsers,
      totalInternships,
      totalApplications,
      totalCertificates
    ] = await Promise.all([
      db.user.count(),
      db.internship.count(),
      db.internshipApplication.count(),
      db.certificate.count()
    ])

    // Previous month totals for growth calculation
    const [
      usersLastMonth,
      internshipsLastMonth,
      applicationsLastMonth,
      certificatesLastMonth
    ] = await Promise.all([
      db.user.count({
        where: { createdAt: { lt: lastMonth } }
      }),
      db.internship.count({
        where: { createdAt: { lt: lastMonth } }
      }),
      db.internshipApplication.count({
        where: { appliedAt: { lt: lastMonth } }
      }),
      db.certificate.count({
        where: { issueDate: { lt: lastMonth } }
      })
    ])

    // Calculate growth percentages
    const userGrowth = usersLastMonth > 0 ? 
      ((totalUsers - usersLastMonth) / usersLastMonth * 100) : 0
    const internshipGrowth = internshipsLastMonth > 0 ? 
      ((totalInternships - internshipsLastMonth) / internshipsLastMonth * 100) : 0
    const applicationGrowth = applicationsLastMonth > 0 ? 
      ((totalApplications - applicationsLastMonth) / applicationsLastMonth * 100) : 0
    const certificateGrowth = certificatesLastMonth > 0 ? 
      ((totalCertificates - certificatesLastMonth) / certificatesLastMonth * 100) : 0

    return {
      totalUsers,
      totalInternships,
      totalApplications,
      totalCertificates,
      userGrowth: Math.round(userGrowth * 10) / 10,
      internshipGrowth: Math.round(internshipGrowth * 10) / 10,
      applicationGrowth: Math.round(applicationGrowth * 10) / 10,
      certificateGrowth: Math.round(certificateGrowth * 10) / 10
    }
  }

  static async getUserStats(): Promise<UserStats> {
    const { lastDay, lastWeek, lastMonth } = await this.getDateRanges()

    const [
      interns,
      mentors,
      admins,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers
    ] = await Promise.all([
      db.user.count({ where: { role: UserRole.INTERN } }),
      db.user.count({ where: { role: UserRole.MENTOR } }),
      db.user.count({ 
        where: { 
          role: { 
            in: [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER] 
          } 
        } 
      }),
      // Daily active users (users who have submitted tasks, applied, or logged in recently)
      db.user.count({
        where: {
          OR: [
            { submissions: { some: { submittedAt: { gte: lastDay } } } },
            { internships: { some: { appliedAt: { gte: lastDay } } } },
            { updatedAt: { gte: lastDay } }
          ]
        }
      }),
      // Weekly active users
      db.user.count({
        where: {
          OR: [
            { submissions: { some: { submittedAt: { gte: lastWeek } } } },
            { internships: { some: { appliedAt: { gte: lastWeek } } } },
            { updatedAt: { gte: lastWeek } }
          ]
        }
      }),
      // Monthly active users
      db.user.count({
        where: {
          OR: [
            { submissions: { some: { submittedAt: { gte: lastMonth } } } },
            { internships: { some: { appliedAt: { gte: lastMonth } } } },
            { updatedAt: { gte: lastMonth } }
          ]
        }
      })
    ])

    return {
      interns,
      mentors,
      admins,
      activeUsers: monthlyActiveUsers,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers
    }
  }

  static async getInternshipStats(): Promise<InternshipStats> {
    const [active, completed, pending, cancelled] = await Promise.all([
      db.internship.count({ where: { status: InternshipStatus.ACTIVE } }),
      db.internship.count({ where: { status: InternshipStatus.COMPLETED } }),
      db.internshipApplication.count({ where: { status: ApplicationStatus.PENDING } }),
      db.internship.count({ where: { status: InternshipStatus.INACTIVE } })
    ])

    return { active, completed, pending, cancelled }
  }

  static async getInternshipCompletionRate(): Promise<{
    totalInternships: number
    completedInternships: number
    completionRate: number
    completionText: string
  }> {
    const [totalInternships, completedInternships] = await Promise.all([
      db.internship.count(),
      db.internship.count({ where: { status: InternshipStatus.COMPLETED } })
    ])

    const completionRate = totalInternships > 0 ? (completedInternships / totalInternships) * 100 : 0

    return {
      totalInternships,
      completedInternships,
      completionRate: Math.round(completionRate * 10) / 10,
      completionText: `${completedInternships} out of ${totalInternships} finished internships`
    }
  }

  static async getMonthlyData(): Promise<MonthlyData[]> {
    const { sixMonthsAgo } = await this.getDateRanges()
    const months = []
    const now = new Date()

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const [users, internships, applications, certificates] = await Promise.all([
        db.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth
            }
          }
        }),
        db.internship.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth
            }
          }
        }),
        db.internshipApplication.count({
          where: {
            appliedAt: {
              gte: date,
              lt: nextMonth
            }
          }
        }),
        db.certificate.count({
          where: {
            issueDate: {
              gte: date,
              lt: nextMonth
            }
          }
        })
      ])

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users,
        internships,
        applications,
        certificates
      })
    }

    return months
  }

  static async getCompleteAnalytics(): Promise<AnalyticsData> {
    const [overview, userStats, internshipStats, monthlyData, completionRate] = await Promise.all([
      this.getOverviewStats(),
      this.getUserStats(),
      this.getInternshipStats(),
      this.getMonthlyData(),
      this.getInternshipCompletionRate()
    ])

    return {
      overview,
      userStats,
      internshipStats,
      monthlyData,
      completionRate
    }
  }

  static async updateUserAnalytics(userId: string) {
    try {
      // Get user's task and submission stats
      const [totalTasks, completedTasks, pendingTasks, overdueTasks, submissions] = await Promise.all([
        db.task.count({ where: { assignedTo: userId } }),
        db.task.count({ 
          where: { 
            assignedTo: userId, 
            status: 'COMPLETED' 
          } 
        }),
        db.task.count({ 
          where: { 
            assignedTo: userId, 
            status: 'PENDING' 
          } 
        }),
        db.task.count({ 
          where: { 
            assignedTo: userId, 
            status: 'OVERDUE' 
          } 
        }),
        db.taskSubmission.findMany({
          where: { userId },
          include: { task: true }
        })
      ])

      const totalSubmissions = submissions.length
      const onTimeSubmissions = submissions.filter(sub => 
        sub.task.dueDate ? sub.submittedAt <= sub.task.dueDate : true
      ).length
      const lateSubmissions = totalSubmissions - onTimeSubmissions

      // Calculate average score (based on approved submissions)
      const approvedSubmissions = submissions.filter(sub => sub.status === 'APPROVED')
      const averageScore = approvedSubmissions.length > 0 ? 
        (approvedSubmissions.length / totalSubmissions) * 100 : 0

      // Get total credits
      const creditHistory = await db.creditHistory.findMany({
        where: { userId }
      })
      const totalCredits = creditHistory.reduce((sum, credit) => 
        credit.type === 'EARNED' || credit.type === 'BONUS' ? 
          sum + credit.amount : sum - credit.amount, 0
      )

      // Upsert analytics record
      await db.studentAnalytics.upsert({
        where: { userId },
        update: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          averageScore,
          totalSubmissions,
          onTimeSubmissions,
          lateSubmissions,
          totalCredits,
          lastActive: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId,
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          averageScore,
          totalSubmissions,
          onTimeSubmissions,
          lateSubmissions,
          totalCredits,
          lastActive: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating user analytics:', error)
    }
  }

  static async getTopPerformers(limit: number = 10) {
    return await db.studentAnalytics.findMany({
      take: limit,
      orderBy: [
        { averageScore: 'desc' },
        { totalCredits: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })
  }

  static async getSystemHealth() {
    const [
      totalUsers,
      activeUsers,
      pendingApplications,
      systemErrors
    ] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last week
          }
        }
      }),
      db.internshipApplication.count({
        where: { status: ApplicationStatus.PENDING }
      }),
      // Simulate system error count (in real app, this would come from logs)
      Promise.resolve(0)
    ])

    const userEngagement = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    const systemHealth = Math.max(0, 100 - (pendingApplications * 0.1) - (systemErrors * 5))

    return {
      userEngagement: Math.round(userEngagement * 10) / 10,
      systemHealth: Math.round(systemHealth * 10) / 10,
      pendingApplications,
      systemErrors
    }
  }
}