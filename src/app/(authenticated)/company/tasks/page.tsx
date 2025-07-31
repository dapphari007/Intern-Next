import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { TaskManagementClient } from "@/components/company/TaskManagementClient"

export default async function CompanyTasksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
    redirect("/dashboard")
  }

  // Fetch company data with tasks organized by domain
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true, 
      companyId: true 
    }
  })

  if (!user?.companyId) {
    redirect("/company/dashboard")
  }

  // Fetch all tasks where the company admin is the mentor for independent internships
  // This allows company admins to manage tasks for internships they mentor
  const tasks = await db.task.findMany({
    where: {
      internship: {
        mentor: {
          companyId: user.companyId
        }
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

  // Group tasks by domain
  const tasksByDomain = tasks.reduce((acc, task) => {
    const domain = task.internship.domain || 'General'
    if (!acc[domain]) {
      acc[domain] = []
    }
    acc[domain].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  // Get all students with tasks from company mentored internships
  const studentsWithTasks = await db.user.findMany({
    where: {
      role: 'INTERN',
      tasks: {
        some: {
          internship: {
            mentor: {
              companyId: user.companyId
            }
          }
        }
      }
    },
    include: {
      tasks: {
        where: {
          internship: {
            mentor: {
              companyId: user.companyId
            }
          }
        },
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

  // Get available internships for task creation (where company users are mentors)
  const availableInternships = await db.internship.findMany({
    where: {
      mentor: {
        companyId: user.companyId
      },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      title: true,
      domain: true
    }
  })

  // Get available students (interns who have applied to company's internships)
  const availableStudents = await db.user.findMany({
    where: {
      role: 'INTERN',
      internships: {
        some: {
          status: 'ACCEPTED',
          internship: {
            mentor: {
              companyId: user.companyId
            }
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  })

  return (
    <TaskManagementClient 
      tasksByDomain={tasksByDomain}
      studentsWithTasks={studentsWithTasks}
      companyId={user.companyId}
      availableInternships={availableInternships}
      availableStudents={availableStudents}
    />
  )
}