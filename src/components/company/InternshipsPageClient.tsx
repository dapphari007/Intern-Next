"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Briefcase, 
  Users, 
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Eye,
  Trash2,
  Power,
  PowerOff,
  Search,
  Filter
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
}

interface InternshipsPageClientProps {
  initialInternships: Internship[]
  totalInternships: number
  activeInternships: number
  totalApplications: number
  acceptedApplications: number
  avgStipend: number
}

export function InternshipsPageClient({
  initialInternships,
  totalInternships,
  activeInternships,
  totalApplications,
  acceptedApplications,
  avgStipend
}: InternshipsPageClientProps) {
  const [internships, setInternships] = useState(initialInternships)
  const [filteredInternships, setFilteredInternships] = useState(initialInternships)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modals, setModals] = useState({
    create: false,
    view: false,
    edit: false,
    delete: false,
    applications: false
  })

  // Filter internships based on search and filters
  useEffect(() => {
    let filtered = internships

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(internship => 
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by domain
    if (domainFilter !== "all") {
      filtered = filtered.filter(internship => internship.domain === domainFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter(internship => internship.isActive === isActive)
    }

    setFilteredInternships(filtered)
  }, [internships, searchTerm, domainFilter, statusFilter])

  const openModal = (type: keyof typeof modals, internship?: Internship) => {
    if (internship) setSelectedInternship(internship)
    setModals(prev => ({ ...prev, [type]: true }))
  }

  const closeModal = (type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: false }))
    setSelectedInternship(null)
  }

  const refreshInternships = async () => {
    // In a real app, you'd refetch the data here
    // For now, we'll just close the modal
    window.location.reload()
  }

  const toggleInternshipStatus = async (internshipId: string) => {
    try {
      const response = await fetch(`/api/internships/${internshipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle-status' })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle internship status')
      }

      const updatedInternship = await response.json()
      
      // Update local state
      setInternships(prev => 
        prev.map(internship => 
          internship.id === internshipId 
            ? { ...internship, isActive: updatedInternship.isActive }
            : internship
        )
      )
    } catch (error) {
      console.error('Error toggling internship status:', error)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Internship Management</h1>
            <p className="text-muted-foreground">
              Manage your company's internship programs
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
                placeholder="Search by title, description, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="WEB_DEVELOPMENT">Web Development</SelectItem>
              <SelectItem value="MOBILE_DEVELOPMENT">Mobile Development</SelectItem>
              <SelectItem value="DATA_SCIENCE">Data Science</SelectItem>
              <SelectItem value="AI_ML">AI/ML</SelectItem>
              <SelectItem value="DEVOPS">DevOps</SelectItem>
              <SelectItem value="CYBERSECURITY">Cybersecurity</SelectItem>
              <SelectItem value="UI_UX">UI/UX Design</SelectItem>
              <SelectItem value="PRODUCT_MANAGEMENT">Product Management</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Stipend</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${avgStipend > 0 ? avgStipend.toFixed(0) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Per month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Internships List */}
        <Card>
          <CardHeader>
            <CardTitle>All Internships</CardTitle>
            <CardDescription>
              {filteredInternships.length} of {internships.length} internships
              {searchTerm && ` matching "${searchTerm}"`}
            </CardDescription>
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
                    ? "Create your first internship program to start attracting talent."
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
              <div className="space-y-4">
                {filteredInternships.map((internship) => (
                  <div key={internship.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{internship.title}</h3>
                          <Badge variant={internship.isActive ? 'default' : 'secondary'}>
                            {internship.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{internship.domain}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {internship.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {internship.duration} weeks
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {internship.applications.length} applications
                          </span>
                          {internship.isPaid && internship.stipend && (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${internship.stipend}/month
                            </span>
                          )}
                          <div className="flex items-center space-x-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={internship.mentor?.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {internship.mentor?.name?.charAt(0) || 'M'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{internship.mentor?.name || 'No mentor assigned'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleInternshipStatus(internship.id)}
                          className={internship.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {internship.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openModal('view', internship)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openModal('edit', internship)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openModal('delete', internship)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
    </div>
  )
}