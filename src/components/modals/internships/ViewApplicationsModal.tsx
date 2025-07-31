"use client"

import { useState, useEffect } from "react"
import { BaseModal } from "../base/BaseModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download
} from "lucide-react"

interface Application {
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
}

interface Internship {
  id: string
  title: string
  domain: string
  applications: Application[]
}

interface ViewApplicationsModalProps {
  isOpen: boolean
  onClose: () => void
  internship: Internship | null
}

export function ViewApplicationsModal({
  isOpen,
  onClose,
  internship
}: ViewApplicationsModalProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (internship) {
      setApplications(internship.applications)
      setFilteredApplications(internship.applications)
    }
  }, [internship])

  useEffect(() => {
    let filtered = applications

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter])

  const updateApplicationStatus = async (applicationId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update application status')
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )

      toast({
        title: "Status Updated",
        description: `Application ${newStatus.toLowerCase()} successfully.`,
      })
    } catch (error) {
      console.error('Error updating application status:', error)
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      default: return null
    }
  }

  if (!internship) return null

  const totalApplications = applications.length
  const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED').length
  const pendingApplications = applications.filter(app => app.status === 'PENDING').length
  const rejectedApplications = applications.filter(app => app.status === 'REJECTED').length

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Applications for ${internship.title}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-blue-600">{totalApplications}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-green-600">{acceptedApplications}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{pendingApplications}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-red-600">{rejectedApplications}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {applications.length === 0 
                  ? "No applications yet for this internship."
                  : "No applications match your search criteria."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={application.user.image || undefined} />
                        <AvatarFallback>
                          {application.user.name?.charAt(0) || application.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">
                            {application.user.name || application.user.email}
                          </h4>
                          <Badge className={getStatusColor(application.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(application.status)}
                              <span>{application.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {application.user.email}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </span>
                          {application.phone && (
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {application.phone}
                            </span>
                          )}
                        </div>
                        {application.motivation && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {application.motivation}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {application.resumeLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(application.resumeLink, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {application.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            disabled={isLoading}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <BaseModal
            isOpen={!!selectedApplication}
            onClose={() => setSelectedApplication(null)}
            title="Application Details"
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedApplication.user.image || undefined} />
                  <AvatarFallback>
                    {selectedApplication.user.name?.charAt(0) || selectedApplication.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedApplication.user.name || selectedApplication.user.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.user.email}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status}
                </Badge>
              </div>

              {selectedApplication.phone && (
                <div>
                  <h4 className="font-medium mb-1">Phone</h4>
                  <p className="text-sm text-muted-foreground">{selectedApplication.phone}</p>
                </div>
              )}

              {selectedApplication.experience && (
                <div>
                  <h4 className="font-medium mb-1">Experience</h4>
                  <p className="text-sm text-muted-foreground">{selectedApplication.experience}</p>
                </div>
              )}

              {selectedApplication.motivation && (
                <div>
                  <h4 className="font-medium mb-1">Motivation</h4>
                  <p className="text-sm text-muted-foreground">{selectedApplication.motivation}</p>
                </div>
              )}

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-medium mb-1">Cover Letter</h4>
                  <p className="text-sm text-muted-foreground">{selectedApplication.coverLetter}</p>
                </div>
              )}

              <div className="flex items-center space-x-4">
                {selectedApplication.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedApplication.linkedin, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                {selectedApplication.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedApplication.github, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                )}
                {selectedApplication.portfolio && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedApplication.portfolio, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Portfolio
                  </Button>
                )}
                {selectedApplication.resumeLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedApplication.resumeLink, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </BaseModal>
        )}
      </div>
    </BaseModal>
  )
}