"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useSmoothSearch } from "@/hooks/use-smooth-search"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { AddInternshipTaskModal } from "@/components/admin/add-internship-task-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { 
  BookOpen, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  Calendar,
  IndianRupee,
  Star,
  Building,
  User
} from "lucide-react"
import Link from "next/link"
import { AddInternshipModal } from "@/components/admin/add-internship-modal"
import { EditInternshipForm } from "@/components/admin/edit-internship-form"

interface Internship {
  id: string
  title: string
  company: string
  location: string
  duration: number
  isPaid: boolean
  stipend?: number
  domain: string
  description: string
  mentor: string
  mentorId: string
  rating: number
  applicants: number
  maxInterns: number
  skills: string[]
  postedAt: string
  status: 'active' | 'inactive' | 'completed' | 'pending'
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
}

export default function AdminInternshipsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Use smooth search hook
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    filteredItems: searchFilteredInternships,
    clearSearch,
    hasActiveSearch
  } = useSmoothSearch(internships, ['title', 'company', 'mentor'], {
    debounceMs: 300,
    minSearchLength: 0
  })
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showAddInternshipModal, setShowAddInternshipModal] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [statusChangeConfirmOpen, setStatusChangeConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    internshipId: string
    newStatus: 'active' | 'inactive' | 'completed'
    actionType: 'activate' | 'deactivate' | 'complete'
  } | null>(null)
  const [internshipToDelete, setInternshipToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [internshipTasks, setInternshipTasks] = useState<any[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [viewingTask, setViewingTask] = useState<any>(null)
  const [deletingTask, setDeletingTask] = useState<any>(null)
  const { toast } = useToast()

  // Check authentication and authorization
  useEffect(() => {
    if (status === "loading") return

    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  // Fetch internships from database
  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/internships')
      
      if (!response.ok) {
        throw new Error('Failed to fetch internships')
      }
      
      const data = await response.json()
      setInternships(data)
    } catch (error) {
      console.error('Error fetching internships:', error)
      toast({
        title: "Error",
        description: "Failed to fetch internships. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInternshipTasks = async (internshipId: string) => {
    try {
      setTasksLoading(true)
      const response = await fetch(`/api/admin/internships/${internshipId}/tasks`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      
      const data = await response.json()
      setInternshipTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTasksLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (selectedInternship) {
          await fetchInternshipTasks(selectedInternship.id)
        }
        setDeletingTask(null)
        toast({
          title: "Success",
          description: "Task deleted successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || 'Failed to delete task',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const handleTaskSuccess = () => {
    if (selectedInternship) {
      fetchInternshipTasks(selectedInternship.id)
    }
  }

  // Apply additional filters to search results
  const filteredInternships = useMemo(() => {
    return searchFilteredInternships.filter(internship => {
      const matchesDomain = domainFilter === "all" || internship.domain === domainFilter
      const matchesStatus = statusFilter === "all" || internship.status === statusFilter
      
      return matchesDomain && matchesStatus
    })
  }, [searchFilteredInternships, domainFilter, statusFilter])



  const handleDeleteInternship = async (internshipId: string) => {
    setInternshipToDelete(internshipId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteInternship = async () => {
    if (!internshipToDelete) return

    try {
      const response = await fetch(`/api/admin/internships/${internshipToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete internship')
      }

      setInternships(prev => prev.filter(internship => internship.id !== internshipToDelete))
      
      toast({
        title: "Success",
        description: "Internship deleted successfully",
      })
    } catch (error: any) {
      console.error('Error deleting internship:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete internship",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setInternshipToDelete(null)
    }
  }

  const handleStatusChange = (internshipId: string, newStatus: 'active' | 'inactive' | 'completed') => {
    const actionType = newStatus === 'active' ? 'activate' : newStatus === 'inactive' ? 'deactivate' : 'complete'
    setPendingAction({ internshipId, newStatus, actionType })
    setStatusChangeConfirmOpen(true)
  }

  const confirmStatusChange = async () => {
    if (!pendingAction) return

    try {
      const response = await fetch(`/api/admin/internships/${pendingAction.internshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: pendingAction.newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update internship status')
      }

      const updatedInternship = await response.json()
      
      setInternships(prev => prev.map(internship => 
        internship.id === pendingAction.internshipId ? updatedInternship : internship
      ))
      
      toast({
        title: "Success",
        description: `Internship ${pendingAction.actionType}d successfully`,
      })
    } catch (error) {
      console.error('Error updating internship status:', error)
      toast({
        title: "Error",
        description: "Failed to update internship status",
        variant: "destructive",
      })
    } finally {
      setStatusChangeConfirmOpen(false)
      setPendingAction(null)
    }
  }

  const handleEditInternship = async (internshipData: Partial<Internship>) => {
    if (!selectedInternship) return

    try {
      const response = await fetch(`/api/admin/internships/${selectedInternship.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(internshipData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update internship')
      }

      const updatedInternship = await response.json()
      
      setInternships(prev => prev.map(internship => 
        internship.id === selectedInternship.id ? updatedInternship : internship
      ))
      
      toast({
        title: "Success",
        description: "Internship updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedInternship(null)
    } catch (error: any) {
      console.error('Error updating internship:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update internship",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'completed': return 'destructive'
      default: return 'outline'
    }
  }

  const getDomains = () => {
    const domains = Array.from(new Set(internships.map(i => i.domain)))
    return domains
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading internships...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <BookOpen className="mr-3 h-8 w-8" />
                Internship Management
              </h1>
              <p className="text-muted-foreground">
                Manage internship postings, approvals, and monitoring
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAddInternshipModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Internship
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internships.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all domains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {internships.filter(i => i.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently accepting applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {internships.filter(i => i.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {internships.reduce((sum, i) => sum + i.applicants, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                From all internships
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search internships by title, company, or mentor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {getDomains().map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `Showing ${filteredInternships.length} of ${internships.length} internships`}
            </p>
            {domainFilter !== "all" && (
              <Badge variant="outline" className="text-xs">
                Domain: {domainFilter}
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="outline" className="text-xs">
                Status: {statusFilter}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {(hasActiveSearch || domainFilter !== "all" || statusFilter !== "all") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  clearSearch()
                  setDomainFilter("all")
                  setStatusFilter("all")
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Internships Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Internships ({filteredInternships.length})</h2>
          </div>
          
          {filteredInternships.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No internships found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveSearch || domainFilter !== "all" || statusFilter !== "all" 
                  ? "No internships match your current filters."
                  : "Get started by adding your first internship."
                }
              </p>
              <Button onClick={() => setShowAddInternshipModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Internship
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <Card key={internship.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                  setSelectedInternship(internship)
                  setIsViewDialogOpen(true)
                }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{internship.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <Building className="h-3 w-3" />
                          <span className="line-clamp-1">{internship.company}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{internship.location}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInternship(internship)
                            setIsEditDialogOpen(true)
                          }}
                          title="Edit internship"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInternship(internship.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete internship"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Status and Domain */}
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(internship.status)}>{internship.status}</Badge>
                        <Badge variant="outline">{internship.domain}</Badge>
                        {/* Stipend */}
                      {internship.isPaid && (
                        <div className="flex items-center justify-center">
                          <Badge variant="secondary" className="text-green-600">
                            <IndianRupee className="h-3 w-3 mr-1" />
                            {internship.stipend}
                          </Badge>
                        </div>
                      )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{internship.applicants}</div>
                          <div className="text-xs text-muted-foreground">Applications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{internship.duration}w</div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                        </div>
                      </div>

                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* View Internship Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
          setIsViewDialogOpen(open)
          if (!open) {
            setActiveTab("overview")
            setInternshipTasks([])
          }
        }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedInternship?.title}
              </DialogTitle>
              <DialogDescription>
                Manage internship details and tasks
              </DialogDescription>
            </DialogHeader>
            {selectedInternship && (
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks" onClick={() => {
                      if (activeTab !== "tasks") {
                        fetchInternshipTasks(selectedInternship.id)
                      }
                    }}>
                      Tasks ({internshipTasks.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto mt-4">
                    <TabsContent value="overview" className="space-y-6 mt-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 text-muted-foreground">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {selectedInternship.company}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {selectedInternship.location}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {selectedInternship.duration} weeks
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{selectedInternship.domain}</Badge>
                            <Badge variant={getStatusBadgeVariant(selectedInternship.status)}>
                              {selectedInternship.status}
                            </Badge>
                            {selectedInternship.isPaid && (
                              <Badge variant="secondary" className="text-green-600">
                                <IndianRupee className="h-3 w-3 mr-1" />
                                ₹{selectedInternship.stipend}/month
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{selectedInternship.rating}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedInternship.applicants} applications
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{selectedInternship.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Mentor Information</h4>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {selectedInternship.mentor.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{selectedInternship.mentor}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-sm text-muted-foreground">{selectedInternship.rating} rating</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Internship Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-primary">{selectedInternship.applicants}</p>
                        <p className="text-sm text-muted-foreground">Applications</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{selectedInternship.maxInterns}</p>
                        <p className="text-sm text-muted-foreground">Max Interns</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedInternship.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Responsibilities</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedInternship.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedInternship.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Posted on {new Date(selectedInternship.postedAt).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2">
                          {selectedInternship.status === 'active' && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                handleStatusChange(selectedInternship.id, 'inactive')
                                setIsViewDialogOpen(false)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Deactivate
                            </Button>
                          )}
                          {selectedInternship.status === 'inactive' && (
                            <Button
                              onClick={() => {
                                handleStatusChange(selectedInternship.id, 'active')
                                setIsViewDialogOpen(false)
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </Button>
                          )}
                          {(selectedInternship.status === 'active' || selectedInternship.status === 'inactive') && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                handleStatusChange(selectedInternship.id, 'completed')
                                setIsViewDialogOpen(false)
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-4 mt-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Internship Tasks</h3>
                        <Button size="sm" onClick={() => setShowAddTaskModal(true)}>
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
                          {internshipTasks.length === 0 ? (
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
                          ) : (
                            internshipTasks.map((task) => (
                              <Card key={task.id}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <CardTitle className="text-base">{task.title}</CardTitle>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <Badge variant={task.status === 'COMPLETED' ? 'default' : task.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                                          {task.status.replace('_', ' ')}
                                        </Badge>
                                        {task.dueDate && (
                                          <Badge variant="outline" className="text-xs">
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setViewingTask(task)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
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
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setDeletingTask(task)}
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
                                        <p className="font-medium">{task.assignee?.name || 'Unassigned'}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Submissions:</span>
                                        <p className="font-medium">{task.submissions?.length || 0}</p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Internship Modal */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Internship</DialogTitle>
              <DialogDescription>
                Update internship details and requirements
              </DialogDescription>
            </DialogHeader>
            {selectedInternship && (
              <EditInternshipForm
                internship={selectedInternship}
                onSubmit={handleEditInternship}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Internship Modal */}
        <AddInternshipModal
          open={showAddInternshipModal}
          onOpenChange={setShowAddInternshipModal}
          onSuccess={fetchInternships}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Internship</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this internship? This action cannot be undone.
                All applications and related data will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteInternship}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Internship
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Change Confirmation Modal */}
        <Dialog open={statusChangeConfirmOpen} onOpenChange={setStatusChangeConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {pendingAction?.actionType === 'activate' && 'Activate Internship'}
                {pendingAction?.actionType === 'deactivate' && 'Deactivate Internship'}
                {pendingAction?.actionType === 'complete' && 'Mark Internship as Completed'}
              </DialogTitle>
              <DialogDescription>
                {pendingAction?.actionType === 'activate' && 
                  'This will make the internship visible to students and allow new applications.'}
                {pendingAction?.actionType === 'deactivate' && 
                  'This will hide the internship from students and prevent new applications.'}
                {pendingAction?.actionType === 'complete' && 
                  'This will mark the internship as completed. No further applications will be accepted.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusChangeConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmStatusChange}>
                {pendingAction?.actionType === 'activate' && (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
                {pendingAction?.actionType === 'deactivate' && (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                )}
                {pendingAction?.actionType === 'complete' && (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Internship</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this internship? This action cannot be undone.
                Note: Internships with existing applications or tasks cannot be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteInternship}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Modals */}
        {selectedInternship && (
          <>
            <AddInternshipTaskModal
              internshipId={selectedInternship.id}
              open={showAddTaskModal}
              onOpenChange={setShowAddTaskModal}
              onSuccess={handleTaskSuccess}
            />

            {deletingTask && (
              <DeleteConfirmationModal
                open={!!deletingTask}
                onOpenChange={(open) => !open && setDeletingTask(null)}
                onConfirm={() => handleDeleteTask(deletingTask.id)}
                title="Delete Task"
                description={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
                loading={false}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}