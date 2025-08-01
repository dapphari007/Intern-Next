import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { TaskManagementClient } from "@/components/admin/AdminTaskManagementClient"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/dashboard")
  }

  // Fetch tasks based on user role
  let tasks = []
  
  if (session.user.role === 'ADMIN') {
    // Admin sees only their company's tasks from CompanyInternshipTask
    if (session.user.companyId) {
      const companyTasks = await db.companyInternshipTask.findMany({
        where: {
          internship: {
            companyId: session.user.companyId
          }
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          },
          internship: {
            select: {
              id: true,
              title: true,
              domain: true,
              company: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Transform company tasks to match regular task structure
      tasks = companyTasks as any[]
    }
  } else if (session.user.role === 'COMPANY_ADMIN') {
    // Company admin sees only their company's tasks from CompanyInternshipTask
    if (session.user.companyId) {
      const companyTasks = await db.companyInternshipTask.findMany({
        where: {
          internship: {
            companyId: session.user.companyId
          }
        },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        internship: {
          select: {
            id: true,
            title: true,
            domain: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
      })
      
      // Transform company tasks to match regular task structure
      tasks = companyTasks as any[]
    }
  } else {
    // Regular users see only their assigned tasks
    tasks = await db.task.findMany({
      where: {
        assignedTo: session.user.id
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        internship: {
          select: {
            id: true,
            title: true,
            domain: true,
            mentor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Fetch task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'PENDING').length,
    inProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
    completed: tasks.filter(task => task.status === 'COMPLETED').length,
    overdue: tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
    ).length
  }

  // Group tasks by domain
  const tasksByDomain = tasks.reduce((acc, task) => {
    const domain = task.internship?.domain || 'General'
    if (!acc[domain]) {
      acc[domain] = []
    }
    acc[domain].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  // Get all students with tasks (filtered by company for admin/company_admin)
  let studentsWithTasks: any[] = []
  
  if (session.user.role === 'ADMIN' || session.user.role === 'COMPANY_ADMIN') {
    if (session.user.companyId) {
      // For admin and company admin, show only students with company internship tasks from their company
      studentsWithTasks = await db.user.findMany({
        where: {
          role: 'INTERN',
          companyTaskAssignments: {
            some: {
              internship: {
                companyId: session.user.companyId
              }
            }
          }
        },
        include: {
          companyTaskAssignments: {
            where: {
              internship: {
                companyId: session.user.companyId
              }
            },
            include: {
              internship: {
                select: {
                  title: true,
                  domain: true,
                  company: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      
      // Transform companyTaskAssignments to tasks for consistency
      studentsWithTasks = studentsWithTasks.map(student => ({
        ...student,
        tasks: student.companyTaskAssignments || []
      }))
    } else {
      // If admin/company_admin has no companyId, show empty list
      studentsWithTasks = []
    }
  } else {
    // For regular users, show all students with tasks
    studentsWithTasks = await db.user.findMany({
      where: {
        role: 'INTERN',
        tasks: {
          some: {}
        }
      },
      include: {
        tasks: {
          include: {
            internship: {
              select: {
                title: true,
                domain: true
              }
            }
          }
        }
      }
    })
  }

  // Get company information for context
  let companyInfo = null
  if (session.user.companyId) {
    companyInfo = await db.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        id: true,
        name: true,
        industry: true
      }
    })
  }

  // Get company internships for task creation
  let companyInternships: any[] = []
  if (session.user.role === 'ADMIN' || session.user.role === 'COMPANY_ADMIN') {
    if (session.user.companyId) {
      companyInternships = await db.companyInternship.findMany({
        where: {
          companyId: session.user.companyId,
          status: 'ACTIVE' // Only show active internships for task creation
        },
        select: {
          id: true,
          title: true,
          domain: true,
          status: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }
  }

  return (
    <TaskManagementClient 
      tasks={tasks}
      taskStats={taskStats}
      tasksByDomain={tasksByDomain}
      studentsWithTasks={studentsWithTasks}
      userRole={session.user.role}
      companyInfo={companyInfo}
      companyInternships={companyInternships}
    />
  )
}