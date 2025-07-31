"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { 
  Mail,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  MapPin,
  Download,
  X
} from "lucide-react"

interface Application {
  id: string
  status: string
  appliedAt: Date | string
  coverLetter?: string | null
  resumeUrl?: string | null
  resumeLink?: string | null
  phone?: string | null
  linkedin?: string | null
  github?: string | null
  portfolio?: string | null
  experience?: string | null
  motivation?: string | null
  type: 'internship' | 'job'
  position: string
  positionId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    bio?: string | null
    location?: string | null
    certificates: any[]
  }
  internship?: {
    id: string
    title: string
    domain: string
    companyId: string
  } | null
  jobPosting?: {
    id: string
    title: string
    jobType: string
    companyId: string
  } | null
}

interface ApplicationDetailsModalProps {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate?: (applicationId: string, newStatus: 'ACCEPTED' | 'REJECTED') => void
}

export function ApplicationDetailsModal({ 
  application, 
  isOpen, 
  onClose,
  onStatusUpdate 
}: ApplicationDetailsModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()

  if (!application) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'ACCEPTED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const handleApplicationAction = async (action: 'accept' | 'reject') => {
    setIsLoading(action)
    try {
      const response = await fetch(`/api/company/applications/${application.id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} application`)
      }

      const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED'
      onStatusUpdate?.(application.id, newStatus)

      toast({
        title: "Success",
        description: `Application ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} application`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const positionTitle = application.internship?.title || application.jobPosting?.title || application.position
  const positionType = application.type === 'internship' ? 'Internship' : 'Job'
  const positionDetails = application.internship?.domain || application.jobPosting?.jobType || ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Application Details</DialogTitle>
              <DialogDescription>
                {positionTitle} • {positionType}
              </DialogDescription>
            </div>
            
            {application.status === 'PENDING' && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleApplicationAction('accept')}
                  disabled={isLoading !== null}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading === 'accept' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Accept
                </Button>
                <Button 
                  onClick={() => handleApplicationAction('reject')}
                  disabled={isLoading !== null}
                  size="sm"
                  variant="destructive"
                >
                  {isLoading === 'reject' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pr-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Applicant Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Applicant Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={application.user.image || undefined} />
                      <AvatarFallback className="text-lg">
                        {application.user.name?.charAt(0) || application.user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold">
                          {application.user.name || application.user.email}
                        </h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{application.user.email}</p>
                      {application.user.bio && (
                        <p className="text-sm">{application.user.bio}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                        {application.user.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {application.user.location}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cover Letter */}
              {application.coverLetter && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {application.coverLetter}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Experience & Motivation */}
              {(application.experience || application.motivation) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {application.experience && (
                      <div>
                        <h4 className="font-medium mb-2">Experience</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {application.experience}
                        </p>
                      </div>
                    )}
                    {application.motivation && (
                      <div>
                        <h4 className="font-medium mb-2">Motivation</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {application.motivation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={`mailto:${application.user.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                  {application.phone && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`tel:${application.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Phone
                      </a>
                    </Button>
                  )}
                  {application.resumeUrl && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Links */}
              {(application.linkedin || application.github || application.portfolio) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {application.linkedin && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={application.linkedin} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          LinkedIn Profile
                        </a>
                      </Button>
                    )}
                    {application.github && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={application.github} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          GitHub Profile
                        </a>
                      </Button>
                    )}
                    {application.portfolio && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={application.portfolio} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{positionTitle}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{positionType}</span>
                  </div>
                  {positionDetails && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {application.internship ? 'Domain:' : 'Job Type:'}
                      </span>
                      <span>{positionDetails}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(application.status)} variant="outline">
                      {application.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applied:</span>
                    <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Certificates:</span>
                    <span>{application.user.certificates.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}