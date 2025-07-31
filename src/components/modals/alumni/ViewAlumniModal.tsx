"use client"

import { BaseModal } from '../base/BaseModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Award, 
  Calendar,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  MapPin,
  Phone,
  User,
  Building,
  GraduationCap,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface ViewAlumniModalProps {
  isOpen: boolean
  onClose: () => void
  alumni: any
}

export function ViewAlumniModal({ isOpen, onClose, alumni }: ViewAlumniModalProps) {
  if (!alumni) return null

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Alumni Profile" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={alumni.image || undefined} />
            <AvatarFallback className="text-lg">
              {alumni.name?.charAt(0) || alumni.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-semibold">
                {alumni.name || alumni.email}
              </h2>
              <Badge variant={alumni.isActive ? 'default' : 'secondary'}>
                {alumni.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-2">{alumni.email}</p>
            {alumni.bio && (
              <p className="text-sm text-muted-foreground">{alumni.bio}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <User className="h-4 w-4 mr-2" />
              Contact Information
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{alumni.email}</span>
              </div>
              
              {alumni.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{alumni.phone}</span>
                </div>
              )}
              
              {alumni.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{alumni.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {format(new Date(alumni.createdAt), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Internship Details
            </h3>
            
            <div className="space-y-3 text-sm">
              {alumni.internshipTitle && (
                <div>
                  <span className="font-medium">Program:</span>
                  <span className="ml-2">{alumni.internshipTitle}</span>
                </div>
              )}
              
              {alumni.internshipDomain && (
                <div>
                  <span className="font-medium">Domain:</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {alumni.internshipDomain}
                  </Badge>
                </div>
              )}
              
              {alumni.completionDate && (
                <div>
                  <span className="font-medium">Completed:</span>
                  <span className="ml-2">
                    {format(new Date(alumni.completionDate), 'MMMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center">
            <GraduationCap className="h-4 w-4 mr-2" />
            Professional & Academic Background
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              {alumni.currentRole && (
                <div>
                  <span className="font-medium">Current Role:</span>
                  <span className="ml-2">{alumni.currentRole}</span>
                </div>
              )}
              
              {alumni.currentCompany && (
                <div>
                  <span className="font-medium">Company:</span>
                  <span className="ml-2">{alumni.currentCompany}</span>
                </div>
              )}
              
              {alumni.education && (
                <div>
                  <span className="font-medium">Education:</span>
                  <span className="ml-2">{alumni.education}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="font-medium">Certificates:</span>
                <span className="ml-2 font-semibold text-purple-600">
                  {alumni.certificates?.length || 0}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Skill Credits:</span>
                <span className="ml-2 font-semibold text-blue-600">
                  {alumni.skillCredits || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates */}
        {alumni.certificates && alumni.certificates.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Certificates ({alumni.certificates.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alumni.certificates.map((cert: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="font-medium text-sm">{cert.name || `Certificate ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuedDate ? format(new Date(cert.issuedDate), 'MMM yyyy') : 'Date not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-semibold">Connect</h3>
          <div className="flex items-center space-x-2">
            {alumni.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <Link href={alumni.linkedin} target="_blank">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Link>
              </Button>
            )}
            
            {alumni.github && (
              <Button variant="outline" size="sm" asChild>
                <Link href={alumni.github} target="_blank">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
            )}
            
            {alumni.website && (
              <Button variant="outline" size="sm" asChild>
                <Link href={alumni.website} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </Link>
              </Button>
            )}
            
            <Button variant="outline" size="sm" asChild>
              <Link href={`/messages?to=${alumni.id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Link>
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <Link href={`/messages?to=${alumni.id}`}>
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Link>
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}