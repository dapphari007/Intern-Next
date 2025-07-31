"use client"

import { useState } from 'react'
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
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface AdminTaskManagementClientProps {
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
}

export function AdminTaskManagementClient({ 
  tasks,
  taskStats,
  tasksByDomain, 
  studentsWithTasks 
}: AdminTaskManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

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

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Task Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage all tasks across the platform
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">
                <Target className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
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
                  <p className="text-muted-foreground">
                    {searchTerm || selectedDomain !== 'All' || statusFilter !== 'ALL' 
                      ? 'Try adjusting your search terms or filters.'
                      : 'No tasks have been created yet.'
                    }
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
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
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/tasks/${task.id}`}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Link>
                              </Button>
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
            <div className="grid grid-cols-1 gap-4">
              {studentsWithTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No students with tasks</h3>
                  <p className="text-muted-foreground">
                    Students will appear here once tasks are assigned to them.
                  </p>
                </div>
              ) : (
                studentsWithTasks.map((student) => {
                  const completionRate = getStudentTaskCompletion(student)
                  const completedTasks = student.tasks.filter((task: any) => task.status === 'COMPLETED').length
                  const totalTasks = student.tasks.length
                  
                  return (
                    <Card key={student.id} className="hover:shadow-md transition-shadow">
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
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/users/${student.id}`}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Profile
                                </Link>
                              </Button>
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
      </div>
    </div>
  )
}