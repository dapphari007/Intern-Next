import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export class UserService {
  static async getUserById(id: string) {
    return await db.user.findUnique({
      where: { id },
      include: {
        internships: {
          include: {
            internship: {
              select: {
                id: true,
                title: true,
                domain: true,
                status: true
              }
            }
          }
        },
        mentorships: {
          select: {
            id: true,
            title: true,
            domain: true,
            status: true
          }
        },
        certificates: {
          select: {
            id: true,
            title: true,
            description: true,
            issueDate: true,
            status: true
          }
        },
        creditHistory: {
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })
  }

  static async getUserByEmail(email: string) {
    return await db.user.findUnique({
      where: { email },
      include: {
        internships: {
          include: {
            internship: {
              select: {
                id: true,
                title: true,
                domain: true,
                status: true
              }
            }
          }
        },
        mentorships: {
          select: {
            id: true,
            title: true,
            domain: true,
            status: true
          }
        },
        certificates: true,
        creditHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })
  }

  static async updateUser(id: string, data: {
    name?: string
    bio?: string
    role?: UserRole
    image?: string
  }) {
    return await db.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async getAllUsers(page = 1, limit = 10, role?: UserRole) {
    const skip = (page - 1) * limit
    
    const where = role ? { role } : {}
    
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          internships: {
            include: {
              internship: {
                select: {
                  title: true,
                  domain: true,
                  status: true
                }
              }
            }
          },
          mentorships: {
            select: {
              title: true,
              domain: true,
              status: true
            }
          },
          certificates: true
        }
      }),
      db.user.count({ where })
    ])

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  }

  static async deleteUser(id: string) {
    return await db.user.delete({
      where: { id }
    })
  }

  static async getUserStats(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        internships: {
          include: {
            internship: true
          }
        },
        mentorships: true,
        certificates: true,
        tasks: true,
        submissions: true
      }
    })

    if (!user) return null

    return {
      totalInternships: user.role === 'INTERN' ? user.internships.length : user.mentorships.length,
      completedInternships: user.certificates.length,
      totalTasks: user.tasks.length,
      completedTasks: user.submissions.filter(s => s.status === 'APPROVED').length,
      skillCredits: user.skillCredits,
      certificates: user.certificates.length
    }
  }
}