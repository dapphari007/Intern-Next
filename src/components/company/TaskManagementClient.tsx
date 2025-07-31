"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { TaskCard } from '@/components/task-card'
import { CreateTaskModal } from '@/components/modals/tasks/CreateTaskModal'
import { ViewTaskModal } from '@/components/modals/tasks/ViewTaskModal'
import { AssignTaskModal } from '@/components/modals/tasks/AssignTaskModal'
import { 
  CheckSquare, 
  Users, 
  Target, 
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface TaskManagementClientProps {
  tasksByDomain: Record<string, any[]>
  studentsWithTasks: any[]
  companyId: string
  availableInternships: any[]
  availableStudents: any[]
}

export function TaskManagementClient({ 
  tasksByDomain, 
  studentsWithTasks, 
  companyId,
  availableInternships,
  availableStudents
}: TaskManagementClientProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string>()

  const domains = Object.keys(tasksByDomain)
  const activeDomain = selectedDomain || domains[0] || 'General'

  const getTaskStats = (tasks: any[]) => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'COMPLETED').length
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length
    const pending = tasks.filter(task => task.status === 'PENDING').length
    const overdue = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
    ).length

    return { total, completed, inProgress, pending, overdue }
  }

  const getStudentTaskCompletion = (student: any) => {
    if (student.tasks.length === 0) return 0
    const completed = student.tasks.filter((task: any) => task.status === 'COMPLETED').length
    return Math.round((completed / student.tasks.length) * 100)
  }

  const handleTaskSubmit = (taskId: string) => {
    // This will be handled by the modal
    console.log('Submit task:', taskId)
  }

  const handleTaskReview = (taskId: string) => {
    const task = Object.values(tasksByDomain).flat().find(t => t.id === taskId)
    setSelectedTask(task)
    setIsViewModalOpen(true)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">
              Manage tasks across different internship domains
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(tasksByDomain).flat().length}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all domains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsWithTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                With assigned tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(tasksByDomain).flat().filter(task => task.status === 'COMPLETED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(tasksByDomain).flat().filter(task => 
                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab-based Interface */}
        <Tabs value={activeDomain} onValueChange={setSelectedDomain}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4">
              {domains.map((domain) => (
                <TabsTrigger key={domain} value={domain} className="relative">
                  {domain}
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs"
                  >
                    {tasksByDomain[domain]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedDomain(activeDomain)
                setIsAssignModalOpen(true)
              }}
            >
              <Target className="h-4 w-4 mr-2" />
              Assign Tasks
            </Button>
          </div>

          {domains.map((domain) => (
            <TabsContent key={domain} value={domain} className="space-y-6">
              {/* Domain Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {domain} Domain Overview
                  </CardTitle>
                  <CardDescription>Task statistics for this domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const stats = getTaskStats(tasksByDomain[domain] || [])
                      return (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                            <div className="text-xs text-muted-foreground">In Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                            <div className="text-xs text-muted-foreground">Overdue</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(tasksByDomain[domain] || []).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSubmit={handleTaskSubmit}
                    onReview={handleTaskReview}
                  />
                ))}
              </div>

              {(tasksByDomain[domain] || []).length === 0 && (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks in {domain}</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first task for this domain to get started.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Student-wise Task Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Student Task Progress
            </CardTitle>
            <CardDescription>Track completion status by student</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsWithTasks.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No students with tasks</h3>
                <p className="text-muted-foreground">
                  Students will appear here once tasks are assigned to them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentsWithTasks.map((student) => {
                  const completionRate = getStudentTaskCompletion(student)
                  const completedTasks = student.tasks.filter((task: any) => task.status === 'COMPLETED').length
                  
                  return (
                    <div key={student.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.image || undefined} />
                        <AvatarFallback>
                          {student.name?.charAt(0) || student.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium truncate">
                            {student.name || student.email}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {student.internshipDomain}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {student.internshipTitle}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Progress value={completionRate} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground min-w-0">
                            {completedTasks}/{student.tasks.length} ({completionRate}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {student.tasks.length} tasks
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {completedTasks} completed
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        companyId={companyId}
        availableInternships={availableInternships}
        availableStudents={availableStudents}
      />
      
      <ViewTaskModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        task={selectedTask}
      />
      
      <AssignTaskModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        domain={activeDomain}
        companyId={companyId}
      />
    </div>
  )
}