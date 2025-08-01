"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  CheckSquare, 
  Users, 
  Target, 
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserX
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TaskManagementClientProps {
  tasks: any[]
  taskStats: {
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }
  tasksByDomain: Record<string, any[]>
  studentsWithTasks: any[]
  userRole: string
  companyInfo?: {
    id: string
    name: string
    industry?: string | null
  } | null
  companyInternships: any[]
}

export function TaskManagementClient({ 
  tasks,
  taskStats,
  tasksByDomain, 
  studentsWithTasks,
  userRole: propUserRole,
  companyInfo,
  companyInternships
}: TaskManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const { toast } = useToast()
  
  // Use the user role passed as prop
  const userRole = propUserRole

  const domains = ['All', ...Object.keys(tasksByDomain)]

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.internship.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDomain = selectedDomain === 'All' || 
      task.internship.domain === selectedDomain

    const matchesStatus = statusFilter === 'ALL' || 
      task.status === statusFilter

    return matchesSearch && matchesDomain && matchesStatus
  })

  const getStudentTaskCompletion = (student: any) => {
    if (student.tasks.length === 0) return 0
    const completed = student.tasks.filter((task: any) => task.status === 'COMPLETED').length
    return Math.round((completed / student.tasks.length) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (dueDate: string | null) => {
    if (!dueDate) return 'bg-gray-100 text-gray-800'
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'bg-red-100 text-red-800'
    if (days <= 3) return 'bg-orange-100 text-orange-800'
    if (days <= 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const handleViewTask = (task: any) => {
    setSelectedTask(task)
    setIsViewModalOpen(true)
  }

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student)
    setIsStudentModalOpen(true)
  }

  const handleCreateTask = async () => {
    try {
      const title = (document.getElementById('create-title') as HTMLInputElement)?.value
      const description = (document.getElementById('create-description') as HTMLTextAreaElement)?.value
      const internshipId = (document.getElementById('create-internship') as HTMLSelectElement)?.value
      const credits = (document.getElementById('create-credits') as HTMLInputElement)?.value
      const dueDate = (document.getElementById('create-due-date') as HTMLInputElement)?.value
      const assigneeEmail = (document.getElementById('create-assignee') as HTMLInputElement)?.value

      if (!title || !description || !internshipId) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          internshipId,
          credits: credits || 10,
          dueDate: dueDate || null,
          assigneeEmail: assigneeEmail || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task')
      }

      toast({
        title: "Success",
        description: "Task created successfully",
      })

      setIsCreateModalOpen(false)
      
      // Reset form
      ;(document.getElementById('create-title') as HTMLInputElement).value = ''
      ;(document.getElementById('create-description') as HTMLTextAreaElement).value = ''
      ;(document.getElementById('create-internship') as HTMLSelectElement).value = ''
      ;(document.getElementById('create-credits') as HTMLInputElement).value = '10'
      ;(document.getElementById('create-due-date') as HTMLInputElement).value = ''
      ;(document.getElementById('create-assignee') as HTMLInputElement).value = ''

      // Refresh the page to show the new task
      window.location.reload()

    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleDeactivateTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'INACTIVE' })
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate task')
      }

      toast({
        title: "Success",
        description: "Task deactivated successfully",
      })

      // Refresh the page to update the task list
      window.location.reload()
    } catch (error) {
      console.error('Error deactivating task:', error)
      toast({
        title: "Error",
        description: "Failed to deactivate task",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete task')
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })

      // Refresh the page to update the task list
      window.location.reload()
    } catch (error: any) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsDeleteModalOpen(false)
      setTaskToDelete(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">
              {companyInfo ? (
                <>Monitor and manage tasks for <span className="font-medium text-foreground">{companyInfo.name}</span></>
              ) : (
                "Monitor and manage your tasks"
              )}
            </p>
            {companyInfo?.industry && (
              <p className="text-sm text-muted-foreground mt-1">
                Industry: {companyInfo.industry}
              </p>
            )}
          </div>
        
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all domains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting start
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, students, or internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border rounded-md text-sm"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border rounded-md text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4" />
              <span>All Tasks</span>
              <Badge variant="secondary" className="ml-1">
                {filteredTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Student Progress</span>
              <Badge variant="secondary" className="ml-1">
                {studentsWithTasks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedDomain !== 'All' || statusFilter !== 'ALL' 
                      ? 'Try adjusting your search terms or filters.'
                      : (userRole === 'ADMIN' || userRole === 'COMPANY_ADMIN') 
                        ? (companyInternships?.length || 0) === 0
                          ? 'Create internships first, then you can add tasks to them.'
                          : 'No tasks have been created yet. Click "Create Task" to get started.'
                        : 'No tasks have been created yet.'
                    }
                  </p>
                  {(userRole === 'ADMIN' || userRole === 'COMPANY_ADMIN') && !searchTerm && selectedDomain === 'All' && statusFilter === 'ALL' && (
                    <div className="flex justify-center">
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Task
                        </Button>
                    </div>
                  )}
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewTask(task)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{task.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              {task.dueDate && (
                                <Badge className={getPriorityColor(task.dueDate)}>
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={task.assignee.image || undefined} />
                                  <AvatarFallback>
                                    {task.assignee.name?.charAt(0) || task.assignee.email.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {task.assignee.name || task.assignee.email}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {task.internship.title}
                                  </p>
                                </div>
                              </div>
                              
                              <Badge variant="outline" className="text-xs">
                                {task.internship.domain}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {task.submissions.length} submission(s)
                              </span>
                              
                              {/* Only show edit/delete buttons for non-admin users */}
                              {userRole !== 'ADMIN' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTask(task);
                                    }}
                                    title="Edit Task"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeactivateTask(task.id);
                                    }}
                                    className="text-orange-600 hover:text-orange-600"
                                    title="Deactivate Task"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(task.id);
                                    }}
                                    className="text-red-600 hover:text-red-600"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {/* Students Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Student Progress</h2>
                <p className="text-muted-foreground">
                  {companyInfo ? (
                    <>Track progress of students working on <span className="font-medium text-foreground">{companyInfo.name}</span> tasks</>
                  ) : (
                    "Track student progress and task completion"
                  )}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {studentsWithTasks.length} student{studentsWithTasks.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {studentsWithTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No students with tasks</h3>
                  <p className="text-muted-foreground">
                    {companyInfo ? (
                      <>Students from <span className="font-medium">{companyInfo.name}</span> will appear here once tasks are assigned to them.</>
                    ) : (
                      "Students will appear here once tasks are assigned to them."
                    )}
                  </p>
                </div>
              ) : (
                studentsWithTasks.map((student) => {
                  const completionRate = getStudentTaskCompletion(student)
                  const completedTasks = student.tasks.filter((task: any) => task.status === 'COMPLETED').length
                  const totalTasks = student.tasks.length
                  
                  return (
                    <Card 
                      key={student.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewStudent(student)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.image || undefined} />
                            <AvatarFallback>
                              {student.name?.charAt(0) || student.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">
                                  {student.name || student.email}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {student.email}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {student.tasks[0]?.internship?.domain || 'General'}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>Task Progress</span>
                                <span>{completedTasks}/{totalTasks} ({completionRate}%)</span>
                              </div>
                              <Progress value={completionRate} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Latest: {student.tasks[0]?.internship?.title || 'No internship'}
                              </span>
                              <div className="flex items-center text-blue-600">
                                <Eye className="h-3 w-3 mr-1" />
                                <span>Click to view details</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Task Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Task Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this task
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-6">
                {/* Task Header */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{selectedTask.title}</h3>
                  <p className="text-muted-foreground">{selectedTask.description}</p>
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <Badge className={getStatusColor(selectedTask.status)}>
                            {selectedTask.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Credits</p>
                          <p className="text-lg font-semibold">{selectedTask.credits}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedTask.dueDate && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <Clock className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Due Date</p>
                            <p className="text-sm font-semibold">
                              {new Date(selectedTask.dueDate).toLocaleDateString()}
                            </p>
                            <Badge className={getPriorityColor(selectedTask.dueDate)} variant="outline">
                              {Math.ceil((new Date(selectedTask.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Assignee and Internship Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Assigned To
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedTask.assignee?.image || undefined} />
                          <AvatarFallback>
                            {selectedTask.assignee?.name?.charAt(0) || selectedTask.assignee?.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {selectedTask.assignee?.name || selectedTask.assignee?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedTask.assignee?.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Internship Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">{selectedTask.internship?.title}</p>
                          <Badge variant="outline">{selectedTask.internship?.domain}</Badge>
                        </div>
                        {selectedTask.internship?.company && (
                          <p className="text-sm text-muted-foreground">
                            Company: {selectedTask.internship.company.name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Submissions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Submissions ({selectedTask.submissions?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTask.submissions && selectedTask.submissions.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTask.submissions.map((submission: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div>
                              <p className="text-sm font-medium">
                                Submission {index + 1}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {submission.user?.name || submission.user?.email}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No submissions yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Task Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update task information
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    defaultValue={selectedTask.title}
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    defaultValue={selectedTask.description}
                    placeholder="Task description"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-credits">Credits</Label>
                    <Input
                      id="edit-credits"
                      type="number"
                      defaultValue={selectedTask.credits}
                      placeholder="Credits"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-due-date">Due Date</Label>
                    <Input
                      id="edit-due-date"
                      type="date"
                      defaultValue={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // TODO: Implement save functionality
                toast({
                  title: "Info",
                  description: "Edit functionality will be implemented soon",
                })
                setIsEditModalOpen(false)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Student Details Modal */}
        <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Progress Details
              </DialogTitle>
              <DialogDescription>
                Complete overview of student's task progress and performance
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6">
                {/* Student Header */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedStudent.image || undefined} />
                      <AvatarFallback className="text-lg">
                        {selectedStudent.name?.charAt(0) || selectedStudent.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedStudent.name || selectedStudent.email}
                      </h3>
                      <p className="text-muted-foreground">{selectedStudent.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {selectedStudent.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Tasks</p>
                          <p className="text-2xl font-bold">{selectedStudent.tasks?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Completed</p>
                          <p className="text-2xl font-bold">
                            {selectedStudent.tasks?.filter((task: any) => task.status === 'COMPLETED').length || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">In Progress</p>
                          <p className="text-2xl font-bold">
                            {selectedStudent.tasks?.filter((task: any) => task.status === 'IN_PROGRESS').length || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-red-100 rounded-full">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Overdue</p>
                          <p className="text-2xl font-bold">
                            {selectedStudent.tasks?.filter((task: any) => 
                              task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                            ).length || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Bar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Overall Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Task Completion Rate</span>
                        <span>
                          {getStudentTaskCompletion(selectedStudent)}%
                        </span>
                      </div>
                      <Progress value={getStudentTaskCompletion(selectedStudent)} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Task List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      All Tasks ({selectedStudent.tasks?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.tasks && selectedStudent.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStudent.tasks.map((task: any, index: number) => (
                          <div key={task.id || index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{task.title}</h4>
                                <Badge className={getStatusColor(task.status)}>
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Credits: {task.credits}</span>
                                <span>Internship: {task.internship?.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {task.internship?.domain}
                                </Badge>
                                {task.dueDate && (
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Task Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Task
              </DialogTitle>
              <DialogDescription>
                Create a new task for your company's internship program
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-title">Task Title</Label>
                <Input
                  id="create-title"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  placeholder="Describe the task requirements and objectives"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-internship">Internship</Label>
                  <select
                    id="create-internship"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Select an internship</option>
                    {companyInternships?.map((internship) => (
                      <option key={internship.id} value={internship.id}>
                        {internship.title} ({internship.domain})
                      </option>
                    )) || []}
                  </select>
                </div>
                <div>
                  <Label htmlFor="create-credits">Credits</Label>
                  <Input
                    id="create-credits"
                    type="number"
                    placeholder="Task credits"
                    min="0"
                    defaultValue="10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="create-due-date">Due Date (Optional)</Label>
                <Input
                  id="create-due-date"
                  type="date"
                />
              </div>
              <div>
                <Label htmlFor="create-assignee">Assign To (Optional)</Label>
                <Input
                  id="create-assignee"
                  placeholder="Student email (leave empty to assign later)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Task Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
                Note: Tasks with existing submissions cannot be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteTask}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}