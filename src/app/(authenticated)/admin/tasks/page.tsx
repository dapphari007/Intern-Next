import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminTaskManagementClient } from "@/components/admin/AdminTaskManagementClient"

export default async function AdminTasksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect("/dashboard")
  }

  // Fetch all tasks across all internships
  const tasks = await db.task.findMany({
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
    const domain = task.internship.domain || 'General'
    if (!acc[domain]) {
      acc[domain] = []
    }
    acc[domain].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  // Get all students with tasks
  const studentsWithTasks = await db.user.findMany({
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

  return (
    <AdminTaskManagementClient 
      tasks={tasks}
      taskStats={taskStats}
      tasksByDomain={tasksByDomain}
      studentsWithTasks={studentsWithTasks}
    />
  )
}