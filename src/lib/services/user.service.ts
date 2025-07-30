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
              include: {
                mentor: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        mentorships: {
          include: {
            applications: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    skillCredits: true
                  }
                }
              }
            },
            tasks: {
              include: {
                submissions: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        tasks: {
          include: {
            internship: {
              select: {
                id: true,
                title: true
              }
            },
            submissions: {
              orderBy: {
                submittedAt: 'desc'
              },
              take: 1
            }
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
        },
        company: {
          include: {
            internships: {
              include: {
                applications: {
                  include: {
                    user: true
                  }
                },
                mentor: true
              }
            },
            jobPostings: {
              include: {
                applications: {
                  include: {
                    user: true
                  }
                }
              }
            },
            users: true
          }
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
    isActive?: boolean
    isEmailVerified?: boolean
    emailVerifiedAt?: Date
    resumeGDriveLink?: string
    phone?: string
    linkedin?: string
    github?: string
    website?: string
    location?: string
  }) {
    return await db.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async getAllUsers(page = 1, limit = 10, role?: UserRole, status?: string, search?: string) {
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (role) {
      where.role = role
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
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

  static async createUser(data: {
    name: string
    email: string
    role: UserRole
    bio?: string
    image?: string
  }) {
    return await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        bio: data.bio,
        image: data.image,
        skillCredits: 0
      }
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

  static async updateUserStatus(id: string, isActive: boolean) {
    return await db.user.update({
      where: { id },
      data: {
        updatedAt: new Date()
      }
    })
  }

  static async verifyUserEmail(id: string) {
    return await db.user.update({
      where: { id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  static async updateUserProfile(id: string, data: {
    name?: string
    bio?: string
    phone?: string
    linkedin?: string
    github?: string
    website?: string
    location?: string
    resumeGDriveLink?: string
    image?: string
  }) {
    return await db.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        notificationPreferences: true,
        wallet: true
      }
    })
  }

  static async getUserNotificationPreferences(userId: string) {
    return await db.notificationPreferences.findUnique({
      where: { userId }
    })
  }

  static async updateUserNotificationPreferences(userId: string, preferences: {
    emailNotifications?: boolean
    taskReminders?: boolean
    mentorMessages?: boolean
    certificateUpdates?: boolean
    marketingEmails?: boolean
    pushNotifications?: boolean
  }) {
    return await db.notificationPreferences.upsert({
      where: { userId },
      update: {
        ...preferences,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...preferences
      }
    })
  }

  static async getUserWallet(userId: string) {
    return await db.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })
  }

  static async createUserWallet(userId: string) {
    return await db.wallet.create({
      data: {
        userId,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })
  }
}