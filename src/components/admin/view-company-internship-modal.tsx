"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Briefcase, 
  Users, 
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  User
} from "lucide-react"
import { AddTaskModal } from "./add-company-task-modal"
import { EditTaskModal } from "./edit-company-task-modal"
import { DeleteConfirmationModal } from "../delete-confirmation-modal"

interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend?: number
  status: string
  isActive: boolean
  createdAt: string
  mentor?: {
    id: string
    name: string
    email: string
  }
  applications: Array<{
    id: string
    status: string
    appliedAt: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    applications: number
  }
}

interface CompanyTask {
  id: string
  title: string
  description: string
  status: string
  dueDate?: string
  createdAt: string
  internship: {
    id: string
    title: string
    company: {
      id: string
      name: string
    }
  }
  assignee: {
    id: string
    name: string
    email: string
  }
  submissions: Array<{
    id: string
    status: string
    submittedAt: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    submissions: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface ViewInternshipModalProps {
  companyId: string
  internship: Internship
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ViewInternshipModal({ companyId, internship, open, onOpenChange, onSuccess }: ViewInternshipModalProps) {
  const [tasks, setTasks] = useState<CompanyTask[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<CompanyTask | null>(null)
  const [deletingTask, setDeletingTask] = useState<CompanyTask | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (open && internship) {
      fetchTasks()
      fetchUsers()
      setActiveTab("overview")
    }
  }, [open, internship])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/companies/${companyId}/internships/${internship.id}/tasks`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setActionLoading(taskId)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/internships/${internship.id}/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTasks()
        setDeletingTask(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "default" as const, label: "Active" },
      INACTIVE: { variant: "secondary" as const, label: "Inactive" },
      COMPLETED: { variant: "outline" as const, label: "Completed" },
      PENDING: { variant: "secondary" as const, label: "Pending" },
      IN_PROGRESS: { variant: "default" as const, label: "In Progress" },
      OVERDUE: { variant: "destructive" as const, label: "Overdue" },
      SUBMITTED: { variant: "default" as const, label: "Submitted" },
      APPROVED: { variant: "default" as const, label: "Approved" },
      REJECTED: { variant: "destructive" as const, label: "Rejected" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleTaskSuccess = () => {
    fetchTasks()
    onSuccess()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{internship.title}</DialogTitle>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusBadge(internship.status)}
                  <Badge variant={internship.isActive ? 'default' : 'secondary'}>
                    {internship.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {internship.isPaid && (
                    <Badge variant="outline">
                      Paid {internship.stipend ? `$${internship.stipend}` : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications ({internship._count.applications})</TabsTrigger>
                <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="overview" className="space-y-4 mt-0">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{internship._count.applications}</div>
                          <div className="text-xs text-muted-foreground">Applications</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{tasks.length}</div>
                          <div className="text-xs text-muted-foreground">Tasks</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{internship.duration}</div>
                          <div className="text-xs text-muted-foreground">Weeks</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{internship.isPaid ? 'Paid' : 'Unpaid'}</div>
                          <div className="text-xs text-muted-foreground">Type</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Internship Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Internship Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-muted-foreground text-sm">{internship.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Domain</h4>
                            <Badge variant="outline">{internship.domain}</Badge>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Duration</h4>
                            <p className="text-muted-foreground text-sm">{internship.duration} weeks</p>
                          </div>
                          {internship.mentor && (
                            <div>
                              <h4 className="font-medium mb-1">Mentor</h4>
                              <p className="text-muted-foreground text-sm">{internship.mentor.name}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium mb-1">Created</h4>
                            <p className="text-muted-foreground text-sm">
                              {new Date(internship.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {internship.isPaid && internship.stipend && (
                          <div>
                            <h4 className="font-medium mb-1">Stipend</h4>
                            <p className="text-muted-foreground text-sm">${internship.stipend}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="applications" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    {internship.applications.map((application) => (
                      <Card key={application.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{application.user.name}</p>
                                <p className="text-sm text-muted-foreground">{application.user.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(application.status)}
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied: {new Date(application.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {internship.applications.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No applications found for this internship
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 mt-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Internship Tasks</h3>
                    <Button 
                      onClick={() => setShowAddTaskModal(true)}
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <Card key={task.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{task.title}</CardTitle>
                                <div className="flex items-center space-x-2 mt-2">
                                  {getStatusBadge(task.status)}
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingTask(task)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingTask(task)}
                                  disabled={actionLoading === task.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Assigned to:</span>
                                  <p className="font-medium">{task.assignee.name}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Submissions:</span>
                                  <p className="font-medium">{task._count.submissions}</p>
                                </div>
                              </div>

                              {task.dueDate && (
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-muted-foreground">Due:</span>
                                  <span className="ml-2">{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}

                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">Created:</span>
                                <span className="ml-2">{new Date(task.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {tasks.length === 0 && (
                        <div className="text-center py-12">
                          <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                          <p className="text-muted-foreground mb-4">
                            Get started by adding the first task for this internship.
                          </p>
                          <Button onClick={() => setShowAddTaskModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <AddTaskModal
        companyId={companyId}
        internships={[internship]}
        users={users}
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        onSuccess={handleTaskSuccess}
      />

      {editingTask && (
        <EditTaskModal
          companyId={companyId}
          task={editingTask}
          internships={[internship]}
          users={users}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSuccess={handleTaskSuccess}
        />
      )}

      {deletingTask && (
        <DeleteConfirmationModal
          open={!!deletingTask}
          onOpenChange={(open) => !open && setDeletingTask(null)}
          onConfirm={() => handleDeleteTask(deletingTask.id)}
          title="Delete Task"
          description={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
          loading={actionLoading === deletingTask.id}
        />
      )}
    </>
  )
}