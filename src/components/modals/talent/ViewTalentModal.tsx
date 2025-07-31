"use client"

import { BaseModal } from '../base/BaseModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
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
  MessageSquare,
  TrendingUp,
  Star,
  Target,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface ViewTalentModalProps {
  isOpen: boolean
  onClose: () => void
  talent: any
}

export function ViewTalentModal({ isOpen, onClose, talent }: ViewTalentModalProps) {
  if (!talent) return null

  const getTalentScore = (talent: any) => {
    let score = 0
    score += (talent.certificates?.length || 0) * 10
    score += talent.performance || 0
    score += (talent.skillCredits || 0) / 10
    return Math.min(score, 100)
  }

  const talentScore = getTalentScore(talent)

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Talent Profile" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={talent.image || undefined} />
            <AvatarFallback className="text-lg">
              {talent.name?.charAt(0) || talent.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-semibold">
                {talent.name || talent.email}
              </h2>
              <Badge variant={talent.type === 'intern' ? 'default' : 'secondary'}>
                {talent.type === 'intern' ? 'Intern' : 'Job Applicant'}
              </Badge>
              <Badge variant={
                talent.status === 'ACCEPTED' ? 'default' : 
                talent.status === 'PENDING' ? 'secondary' : 'destructive'
              }>
                {talent.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-2">{talent.email}</p>
            {talent.bio && (
              <p className="text-sm text-muted-foreground">{talent.bio}</p>
            )}
          </div>
        </div>

        {/* Talent Score */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Talent Score
            </h3>
            <span className="text-2xl font-bold">{talentScore.toFixed(0)}%</span>
          </div>
          <Progress value={talentScore} className="mb-2" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{talent.certificates?.length || 0}</div>
              <div className="text-muted-foreground">Certificates</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{talent.skillCredits || 0}</div>
              <div className="text-muted-foreground">Skill Credits</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{talent.performance?.toFixed(0) || 0}%</div>
              <div className="text-muted-foreground">Performance</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Application Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Application Details
            </h3>
            
            <div className="space-y-3 text-sm">
              {talent.internshipTitle && (
                <div>
                  <span className="font-medium">Internship:</span>
                  <span className="ml-2">{talent.internshipTitle}</span>
                </div>
              )}
              
              {talent.jobTitle && (
                <div>
                  <span className="font-medium">Position:</span>
                  <span className="ml-2">{talent.jobTitle}</span>
                </div>
              )}
              
              {talent.internshipDomain && (
                <div>
                  <span className="font-medium">Domain:</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {talent.internshipDomain}
                  </Badge>
                </div>
              )}
              
              {talent.jobType && (
                <div>
                  <span className="font-medium">Job Type:</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {talent.jobType}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Applied {format(new Date(talent.appliedAt), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <User className="h-4 w-4 mr-2" />
              Contact Information
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{talent.email}</span>
              </div>
              
              {talent.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.phone}</span>
                </div>
              )}
              
              {talent.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {format(new Date(talent.createdAt), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Performance & Skills */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance & Skills
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Key Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Overall Performance</span>
                  <span className="font-medium">{talent.performance?.toFixed(0) || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Skill Credits</span>
                  <span className="font-medium">{talent.skillCredits || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Certificates Earned</span>
                  <span className="font-medium">{talent.certificates?.length || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Activity Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Account Status</span>
                  <Badge variant={talent.isActive ? 'default' : 'secondary'} className="text-xs">
                    {talent.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Application Status</span>
                  <Badge variant={
                    talent.status === 'ACCEPTED' ? 'default' : 
                    talent.status === 'PENDING' ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {talent.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates */}
        {talent.certificates && talent.certificates.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Certificates ({talent.certificates.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {talent.certificates.map((cert: any, index: number) => (
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
          <h3 className="font-semibold">Connect & Actions</h3>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {talent.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <Link href={talent.linkedin} target="_blank">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Link>
              </Button>
            )}
            
            {talent.github && (
              <Button variant="outline" size="sm" asChild>
                <Link href={talent.github} target="_blank">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
            )}
            
            {talent.website && (
              <Button variant="outline" size="sm" asChild>
                <Link href={talent.website} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </Link>
              </Button>
            )}
            
            <Button variant="outline" size="sm" asChild>
              <Link href={`/messages?to=${talent.id}`}>
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
            <Link href={`/messages?to=${talent.id}`}>
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Link>
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}