"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Users, 
  Briefcase, 
  MapPin,
  Globe,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Phone,
  Linkedin,
  Github,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { AddInternshipModal } from "./add-company-internship-modal"
import { ViewInternshipModal } from "./view-company-internship-modal"
import { EditInternshipModal } from "./edit-company-internship-modal"
import { AddTaskModal } from "./add-company-task-modal"
import { EditTaskModal } from "./edit-company-task-modal"
import { DeleteConfirmationModal } from "../delete-confirmation-modal"

interface CompanyDetail {
  id: string
  name: string
  description?: string
  website?: string
  industry?: string
  size?: string
  location?: string
  logo?: string
  createdAt: string
  updatedAt: string
  users: Array<{
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
    phone?: string
    linkedin?: string
    github?: string
  }>
  internships: Array<{
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
      user: {
        id: string
        name: string
        email: string
      }
    }>
    _count: {
      applications: number
    }
  }>
  jobPostings: Array<{
    id: string
    title: string
    isActive: boolean
    applications: Array<{
      id: string
      status: string
      user: {
        id: string
        name: string
        email: string
      }
    }>
  }>
  stats: {
    totalUsers: number
    activeUsers: number
    totalInternships: number
    activeInternships: number
    totalJobPostings: number
    activeJobPostings: number
    totalApplications: number
    pendingApplications: number
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

interface ViewCompanyModalProps {
  companyId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ViewCompanyModal({ companyId, open, onOpenChange, onSuccess }: ViewCompanyModalProps) {
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [tasks, setTasks] = useState<CompanyTask[]>([])
  const [loading, setLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddInternshipModal, setShowAddInternshipModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [viewingInternship, setViewingInternship] = useState<any>(null)
  const [editingInternship, setEditingInternship] = useState<any>(null)
  const [editingTask, setEditingTask] = useState<CompanyTask | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ type: string; item: any } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (open && companyId) {
      fetchCompanyDetails()
      setActiveTab("overview")
    }
  }, [open, companyId])

  useEffect(() => {
    if (activeTab === "tasks" && company) {
      fetchTasks()
    }
  }, [activeTab, company])

  const fetchCompanyDetails = async () => {
    if (!companyId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/companies/${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
      } else {
        console.error('Failed to fetch company details')
      }
    } catch (error) {
      console.error('Error fetching company details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    if (!company) return

    try {
      setTasksLoading(true)
      const allTasks: CompanyTask[] = []

      // Fetch tasks for each internship
      for (const internship of company.internships) {
        const response = await fetch(`/api/admin/companies/${companyId}/internships/${internship.id}/tasks`)
        if (response.ok) {
          const data = await response.json()
          allTasks.push(...data.tasks)
        }
      }

      setTasks(allTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleDeleteInternship = async (internshipId: string) => {
    if (!companyId) return
    
    setActionLoading(internshipId)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/internships/${internshipId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCompanyDetails()
        setDeletingItem(null)
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete internship')
      }
    } catch (error) {
      console.error('Error deleting internship:', error)
      alert('Failed to delete internship')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTask = async (taskId: string, internshipId: string) => {
    if (!companyId) return
    
    setActionLoading(taskId)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/internships/${internshipId}/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTasks()
        setDeletingItem(null)
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
      OVERDUE: { variant: "destructive" as const, label: "Overdue" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleInternshipSuccess = () => {
    fetchCompanyDetails()
    onSuccess()
  }

  if (!company && loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!company) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{company.name}</DialogTitle>
                <div className="flex items-center space-x-4 mt-2">
                  {company.industry && (
                    <Badge variant="secondary">{company.industry}</Badge>
                  )}
                  {company.location && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {company.location}
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Globe className="h-3 w-3 mr-1" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users ({company.stats.totalUsers})</TabsTrigger>
                <TabsTrigger value="internships">Internships ({company.stats.totalInternships})</TabsTrigger>
                <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="overview" className="space-y-4 mt-0">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{company.stats.totalUsers}</div>
                          <div className="text-xs text-muted-foreground">Users</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{company.stats.activeInternships}</div>
                          <div className="text-xs text-muted-foreground">Active Internships</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{company.stats.totalApplications}</div>
                          <div className="text-xs text-muted-foreground">Applications</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{company.stats.pendingApplications}</div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Company Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {company.description && (
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-muted-foreground text-sm">{company.description}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {company.size && (
                            <div>
                              <h4 className="font-medium mb-1">Company Size</h4>
                              <p className="text-muted-foreground text-sm">{company.size}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium mb-1">Created</h4>
                            <p className="text-muted-foreground text-sm">
                              {new Date(company.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    {company.users.map((user) => (
                      <Card key={user.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{user.name || 'No name'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={user.role === 'COMPANY_ADMIN' ? 'default' : 'secondary'} className="text-xs">
                                    {user.role}
                                  </Badge>
                                  <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {company.users.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found for this company
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="internships" className="space-y-4 mt-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Company Internships</h3>
                    <Button onClick={() => setShowAddInternshipModal(true)} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Internship
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.internships.map((internship) => (
                      <Card key={internship.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewingInternship(internship)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{internship.title}</CardTitle>
                              <div className="flex items-center space-x-2 mt-2">
                                {getStatusBadge(internship.status)}
                                <Badge variant={internship.isActive ? 'default' : 'secondary'} className="text-xs">
                                  {internship.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {internship.isPaid && (
                                  <Badge variant="outline" className="text-xs">
                                    Paid {internship.stipend ? `$${internship.stipend}` : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingInternship(internship)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingItem({ type: 'internship', item: internship })}
                                disabled={actionLoading === internship.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {internship.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Domain:</span>
                              <Badge variant="outline" className="text-xs">{internship.domain}</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Duration:</span>
                              <span>{internship.duration} weeks</span>
                            </div>

                            <div className="flex items-center justify-between text-sm pt-2 border-t">
                              <span className="text-muted-foreground">Applications:</span>
                              <span className="font-medium">{internship._count.applications}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {company.internships.length === 0 && (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No internships found</h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by adding the first internship for this company.
                      </p>
                      <Button onClick={() => setShowAddInternshipModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Internship
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 mt-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Company Tasks</h3>
                    <Button 
                      onClick={() => setShowAddTaskModal(true)}
                      disabled={company.internships.length === 0}
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </div>

                  {tasksLoading ? (
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
                                  <Badge variant="outline" className="text-xs">{task.internship.title}</Badge>
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
                                  onClick={() => setDeletingItem({ type: 'task', item: task })}
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
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {tasks.length === 0 && (
                        <div className="text-center py-12">
                          <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                          <p className="text-muted-foreground mb-4">
                            {company.internships.length === 0 
                              ? "Add internships first to create tasks."
                              : "Get started by adding the first task for this company's internships."
                            }
                          </p>
                          {company.internships.length > 0 && (
                            <Button onClick={() => setShowAddTaskModal(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Task
                            </Button>
                          )}
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
      {companyId && (
        <>
          <AddInternshipModal
            companyId={companyId}
            open={showAddInternshipModal}
            onOpenChange={setShowAddInternshipModal}
            onSuccess={handleInternshipSuccess}
          />

          <AddTaskModal
            companyId={companyId}
            internships={company?.internships || []}
            users={company?.users || []}
            open={showAddTaskModal}
            onOpenChange={setShowAddTaskModal}
            onSuccess={fetchTasks}
          />

          {viewingInternship && (
            <ViewInternshipModal
              companyId={companyId}
              internship={viewingInternship}
              open={!!viewingInternship}
              onOpenChange={(open) => !open && setViewingInternship(null)}
              onSuccess={handleInternshipSuccess}
            />
          )}

          {editingInternship && (
            <EditInternshipModal
              companyId={companyId}
              internship={editingInternship}
              users={company?.users || []}
              open={!!editingInternship}
              onOpenChange={(open) => !open && setEditingInternship(null)}
              onSuccess={handleInternshipSuccess}
            />
          )}

          {editingTask && (
            <EditTaskModal
              companyId={companyId}
              task={editingTask}
              internships={company?.internships || []}
              users={company?.users || []}
              open={!!editingTask}
              onOpenChange={(open) => !open && setEditingTask(null)}
              onSuccess={fetchTasks}
            />
          )}

          {deletingItem && (
            <DeleteConfirmationModal
              open={!!deletingItem}
              onOpenChange={(open) => !open && setDeletingItem(null)}
              onConfirm={() => {
                if (deletingItem.type === 'internship') {
                  handleDeleteInternship(deletingItem.item.id)
                } else if (deletingItem.type === 'task') {
                  handleDeleteTask(deletingItem.item.id, deletingItem.item.internship.id)
                }
              }}
              title={`Delete ${deletingItem.type === 'internship' ? 'Internship' : 'Task'}`}
              description={`Are you sure you want to delete "${deletingItem.item.title}"? This action cannot be undone.`}
              loading={actionLoading === deletingItem.item.id}
            />
          )}
        </>
      )}
    </>
  )
}