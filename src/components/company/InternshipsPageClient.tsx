"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Briefcase, 
  Users, 
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Eye,
  Trash2
} from "lucide-react"
import { CreateInternshipModal } from "@/components/modals/internships/CreateInternshipModal"
import { ViewInternshipModal } from "@/components/modals/internships/ViewInternshipModal"
import { EditInternshipModal } from "@/components/modals/internships/EditInternshipModal"
import { DeleteInternshipModal } from "@/components/modals/internships/DeleteInternshipModal"

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
    status: string
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
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [modals, setModals] = useState({
    create: false,
    view: false,
    edit: false,
    delete: false
  })

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
            <CardDescription>Manage your company's internship programs</CardDescription>
          </CardHeader>
          <CardContent>
            {internships.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No internships yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first internship program to start attracting talent.
                </p>
                <Button onClick={() => openModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Internship
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {internships.map((internship) => (
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
                // TODO: Implement applications modal
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
          </>
        )}
      </div>
    </div>
  )
}