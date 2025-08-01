"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Briefcase, 
  Users, 
  Calendar,
  IndianRupee,
  Plus,
  Edit,
  Eye,
  Trash2,
  Power,
  PowerOff,
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertCircle
} from "lucide-react"
import { CreateInternshipModal } from "@/components/modals/internships/CreateInternshipModal"
import { ViewInternshipModal } from "@/components/modals/internships/ViewInternshipModal"
import { EditInternshipModal } from "@/components/modals/internships/EditInternshipModal"
import { DeleteInternshipModal } from "@/components/modals/internships/DeleteInternshipModal"
import { ViewApplicationsModal } from "@/components/modals/internships/ViewApplicationsModal"

interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend: number | null
  isActive: boolean
  maxInterns: number
  createdAt: Date
  mentorId: string | null
  mentor: {
    id: string
    name: string | null
    email: string
    image: string | null
  } | null
  applications: Array<{
    id: string
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    createdAt: string
    coverLetter?: string
    resumeUrl?: string
    resumeLink?: string
    phone?: string
    linkedin?: string
    github?: string
    portfolio?: string
    experience?: string
    motivation?: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }>
  tasks?: Task[]
}

interface Task {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  dueDate?: string
  createdAt: string
  internshipId: string
  internship: {
    id: string
    title: string
    domain: string
    mentor?: {
      id: string
      name: string
    }
  }
  assignee: {
    id: string
    name: string
    email: string
    image?: string
  }
  submissions: Array<{
    id: string
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'
    submittedAt: string
  }>
}

interface InternshipManagementTabProps {
  initialInternships: Internship[]
  totalInternships: number
  activeInternships: number
  totalApplications: number
  acceptedApplications: number
  avgStipend: number
  companyId: string
}

export function InternshipManagementTab({
  initialInternships,
  totalInternships,
  activeInternships,
  totalApplications,
  acceptedApplications,
  avgStipend,
  companyId
}: InternshipManagementTabProps) {
  const [internships, setInternships] = useState(initialInternships)
  const [filteredInternships, setFilteredInternships] = useState(initialInternships)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [taskSearchTerm, setTaskSearchTerm] = useState("")
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all")
  const [modals, setModals] = useState({
    create: false,
    view: false,
    edit: false,
    delete: false,
    applications: false
  })

  useEffect(() => {
    let filtered = internships

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(internship => 
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by domain
    if (domainFilter !== "all") {
      filtered = filtered.filter(internship => internship.domain === domainFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(internship => 
        statusFilter === "active" ? internship.isActive : !internship.isActive
      )
    }

    setFilteredInternships(filtered)
  }, [internships, searchTerm, domainFilter, statusFilter])

  // Fetch tasks for the company
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/admin/companies/${companyId}/tasks`)
        if (response.ok) {
          const data = await response.json()
          setTasks(data)
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    if (companyId) {
      fetchTasks()
    }
  }, [companyId])

  // Filter tasks
  useEffect(() => {
    let filtered = tasks

    // Filter by search term
    if (taskSearchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.internship.title.toLowerCase().includes(taskSearchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (taskStatusFilter !== "all") {
      filtered = filtered.filter(task => task.status === taskStatusFilter)
    }

    setFilteredTasks(filtered)
  }, [tasks, taskSearchTerm, taskStatusFilter])

  const openModal = (type: keyof typeof modals, internship?: Internship) => {
    if (internship) setSelectedInternship(internship)
    setModals(prev => ({ ...prev, [type]: true }))
  }

  const closeModal = (type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: false }))
    setSelectedInternship(null)
  }

  const refreshInternships = async () => {
    window.location.reload()
  }

  const getUniqueValues = (field: keyof Internship) => {
    return Array.from(new Set(internships.map(i => i[field] as string).filter(value => value && value.trim() !== "")))
  }

  const handleInternshipCardClick = (internship: Internship) => {
    setSelectedInternship(internship)
    openModal('view', internship)
  }

  // Task statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length
  const overdueTasks = tasks.filter(task => task.status === 'OVERDUE').length

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInternships}</div>
            <p className="text-xs text-muted-foreground">
              {activeInternships} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {acceptedApplications} accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Past deadline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Stipend</CardTitle>
            <IndianRupee className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgStipend > 0 ? avgStipend.toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average offered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Internship & Task Management</h2>
          <p className="text-muted-foreground">
            Manage your company's internships and tasks
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="internships" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internships" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Internships</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4" />
            <span>Task Management</span>
          </TabsTrigger>
        </TabsList>

        {/* Internships Tab */}
        <TabsContent value="internships" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Internship Opportunities</h3>
              <p className="text-sm text-muted-foreground">
                Manage and monitor your internship programs
              </p>
            </div>
            <Button onClick={() => openModal('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Internship
            </Button>
          </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {getUniqueValues('domain').map(domain => (
              <SelectItem key={domain} value={domain}>{domain}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Internships List */}
      <Card>
        <CardHeader>
          <CardTitle>All Internships</CardTitle>
          <CardDescription>Manage your company's internship opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInternships.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {internships.length === 0 ? "No internships yet" : "No internships match your search"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {internships.length === 0 
                  ? "Create your first internship to start attracting candidates."
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {internships.length === 0 && (
                <Button onClick={() => openModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Internship
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <Card 
                  key={internship.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleInternshipCardClick(internship)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {internship.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {internship.domain}
                        </CardDescription>
                      </div>
                      <Badge variant={internship.isActive ? 'default' : 'secondary'}>
                        {internship.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {internship.isPaid && (
                        <Badge className="bg-green-100 text-green-800">
                          Paid
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {internship.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {internship.duration} weeks
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {internship.applications.length} applications
                      </div>
                      {internship.isPaid && internship.stipend && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <IndianRupee className="h-4 w-4 mr-2" />
                          ${internship.stipend.toLocaleString()}
                        </div>
                      )}
                      {internship.mentor && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Avatar className="h-4 w-4 mr-2">
                            <AvatarImage src={internship.mentor.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {internship.mentor.name?.charAt(0) || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          {internship.mentor.name || 'Mentor'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <div className="px-6 pb-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal('view', internship)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal('edit', internship)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal('applications', internship)
                        }}
                        disabled={internship.applications.length === 0}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal('delete', internship)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Task Management</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage tasks across all internships
              </p>
            </div>
          </div>

          {/* Task Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={taskSearchTerm}
                  onChange={(e) => setTaskSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>Tasks from all company internships</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {tasks.length === 0 ? "No tasks yet" : "No tasks match your search"}
                  </h3>
                  <p className="text-muted-foreground">
                    {tasks.length === 0 
                      ? "Tasks will appear here once they are created for your internships."
                      : "Try adjusting your search criteria or filters."
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold line-clamp-1">
                              {task.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {task.internship.title}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={
                              task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {task.status === 'IN_PROGRESS' ? 'In Progress' : 
                             task.status === 'COMPLETED' ? 'Completed' :
                             task.status === 'OVERDUE' ? 'Overdue' : 'Pending'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {task.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Avatar className="h-4 w-4 mr-2">
                              <AvatarImage src={task.assignee.image} />
                              <AvatarFallback className="text-xs">
                                {task.assignee.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {task.assignee.name}
                          </div>
                          {task.dueDate && (
                            <div className={`flex items-center text-sm ${
                              new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                                ? 'text-red-600' 
                                : 'text-muted-foreground'
                            }`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {task.submissions.length > 0 && (
                            <div className="flex items-center text-sm">
                              <Badge 
                                className={
                                  task.submissions[0].status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  task.submissions[0].status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  task.submissions[0].status === 'NEEDS_REVISION' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {task.submissions[0].status === 'SUBMITTED' ? 'Under Review' :
                                 task.submissions[0].status === 'APPROVED' ? 'Approved' :
                                 task.submissions[0].status === 'REJECTED' ? 'Rejected' :
                                 'Needs Revision'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateInternshipModal
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        onSuccess={refreshInternships}
      />

      {selectedInternship && (
        <>
          <ViewInternshipModal
            isOpen={modals.view}
            onClose={() => closeModal('view')}
            internship={selectedInternship}
            companyId={companyId}
            onEdit={() => {
              closeModal('view')
              openModal('edit', selectedInternship)
            }}
            onDelete={() => {
              closeModal('view')
              openModal('delete', selectedInternship)
            }}
            onViewApplications={() => {
              closeModal('view')
              openModal('applications', selectedInternship)
            }}
          />

          <EditInternshipModal
            isOpen={modals.edit}
            onClose={() => closeModal('edit')}
            internship={selectedInternship}
            onSuccess={refreshInternships}
          />

          <DeleteInternshipModal
            isOpen={modals.delete}
            onClose={() => closeModal('delete')}
            internship={selectedInternship}
            onSuccess={refreshInternships}
          />

          <ViewApplicationsModal
            isOpen={modals.applications}
            onClose={() => closeModal('applications')}
            internship={selectedInternship}
          />
        </>
      )}
    </div>
  )
}