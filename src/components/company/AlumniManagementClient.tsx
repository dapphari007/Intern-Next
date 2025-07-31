"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { TaskCard } from '@/components/task-card'
import { InviteAlumniModal } from '@/components/modals/alumni/InviteAlumniModal'
import { ViewAlumniModal } from '@/components/modals/alumni/ViewAlumniModal'
import { 
  Users, 
  Award, 
  Calendar,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  UserPlus,
  Filter,
  Search,
  Target,
  CheckSquare,
  Clock,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface AlumniManagementClientProps {
  alumni: any[]
  taskPipeline: any[]
  companyId: string
}

export function AlumniManagementClient({ 
  alumni, 
  taskPipeline, 
  companyId 
}: AlumniManagementClientProps) {
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Calculate statistics
  const totalAlumni = alumni.length
  const certificatedAlumni = alumni.filter(alum => alum.certificates?.length > 0).length
  const activeAlumni = alumni.filter(alum => alum.isActive).length
  const engagementRate = totalAlumni > 0 ? ((activeAlumni / totalAlumni) * 100) : 0

  // Task pipeline statistics
  const totalTasks = taskPipeline.length
  const completedTasks = taskPipeline.filter(task => task.status === 'COMPLETED').length
  const pendingTasks = taskPipeline.filter(task => task.status === 'PENDING').length
  const overdueTasks = taskPipeline.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
  ).length

  // Filter alumni based on search and filter
  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = !searchTerm || 
      alum.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.internshipDomain?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'active' && alum.isActive) ||
      (activeFilter === 'certified' && alum.certificates?.length > 0) ||
      (activeFilter === 'inactive' && !alum.isActive)

    return matchesSearch && matchesFilter
  })

  const handleViewAlumni = (alumni: any) => {
    setSelectedAlumni(alumni)
    setIsViewModalOpen(true)
  }

  const handleTaskSubmit = (taskId: string) => {
    console.log('Submit task:', taskId)
  }

  const handleTaskReview = (taskId: string) => {
    console.log('Review task:', taskId)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Alumni Management</h1>
            <p className="text-muted-foreground">
              Connect with and manage your company's alumni network and task pipeline
            </p>
          </div>
        </div>

        {/* Tab-based Interface */}
        <Tabs defaultValue="alumni" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alumni" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Alumni Directory</span>
              <Badge variant="secondary" className="ml-1">
                {totalAlumni}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Task Pipeline</span>
              <Badge variant="secondary" className="ml-1">
                {totalTasks}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Alumni Directory Tab */}
          <TabsContent value="alumni" className="space-y-6">
            {/* Alumni Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAlumni}</div>
                  <p className="text-xs text-muted-foreground">
                    Former interns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alumni</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeAlumni}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificated</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{certificatedAlumni}</div>
                  <p className="text-xs text-muted-foreground">
                    With certificates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {engagementRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active participation
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alumni..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={activeFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={activeFilter === 'active' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveFilter('active')}
                  >
                    Active
                  </Button>
                  <Button 
                    variant={activeFilter === 'certified' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveFilter('certified')}
                  >
                    Certified
                  </Button>
                </div>
              </div>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Alumni
              </Button>
            </div>

            {/* Alumni Grid - Enhanced responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAlumni.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-3">
                    {searchTerm ? 'No alumni found' : 'No alumni yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchTerm 
                      ? 'Try adjusting your search terms or filters.'
                      : 'Alumni will appear here once interns complete their programs.'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsInviteModalOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Alumni
                    </Button>
                  )}
                </div>
              ) : (
                filteredAlumni.map((alum) => (
                  <Card key={alum.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardContent className="p-6 h-full flex flex-col min-h-[280px]">
                      {/* Header */}
                      <div className="flex items-start space-x-4 mb-6">
                        <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-background shadow-sm">
                          <AvatarImage src={alum.image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-medium">
                            {alum.name?.charAt(0) || alum.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-base leading-tight line-clamp-2 pr-2">
                              {alum.name || alum.email.split('@')[0]}
                            </h3>
                            <Badge 
                              variant={alum.isActive ? 'default' : 'secondary'} 
                              className="text-xs flex-shrink-0 px-2 py-1"
                            >
                              {alum.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
                            {alum.email}
                          </p>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {alum.internshipDomain && (
                          <div>
                            <Badge variant="outline" className="text-xs font-medium px-3 py-1">
                              {alum.internshipDomain}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Bio/Description */}
                        {alum.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {alum.bio}
                          </p>
                        )}
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="text-center">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                              <Award className="h-4 w-4 mr-1" />
                            </div>
                            <div className="text-lg font-semibold">{alum.certificates?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Certificates</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                              <Calendar className="h-4 w-4 mr-1" />
                            </div>
                            <div className="text-lg font-semibold">{new Date(alum.createdAt).getFullYear()}</div>
                            <div className="text-xs text-muted-foreground">Joined</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3 mt-6 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
                          <Link href={`/messages?to=${alum.id}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Message
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 h-9"
                          onClick={() => handleViewAlumni(alum)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Task Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            {/* Pipeline Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    In pipeline
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckSquare className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully finished
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting action
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <Clock className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overdueTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Progress</CardTitle>
                <CardDescription>Overall task completion progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} />
                </div>
              </CardContent>
            </Card>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taskPipeline.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks in pipeline</h3>
                  <p className="text-muted-foreground">
                    Tasks will appear here as they are created and assigned.
                  </p>
                </div>
              ) : (
                taskPipeline.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSubmit={handleTaskSubmit}
                    onReview={handleTaskReview}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <InviteAlumniModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        companyId={companyId}
      />
      
      <ViewAlumniModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        alumni={selectedAlumni}
      />
    </div>
  )
}