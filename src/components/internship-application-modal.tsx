"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, 
  Link as LinkIcon, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Building,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend: number | null
  maxInterns: number
  skills?: string[]
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  createdAt: string
  mentor: {
    name: string | null
  }
  _count: {
    applications: number
  }
}

interface InternshipApplicationModalProps {
  internship: Internship | null
  isOpen: boolean
  onClose: () => void
  mode: 'view' | 'apply'
}

export function InternshipApplicationModal({ 
  internship, 
  isOpen, 
  onClose, 
  mode 
}: InternshipApplicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeUrl: '',
    resumeLink: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    experience: '',
    motivation: ''
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!internship) return

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: internship.id,
          ...formData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit application')
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. You'll hear back from the mentor soon.",
        duration: 5000,
      })

      onClose()
      
      // Reset form
      setFormData({
        coverLetter: '',
        resumeUrl: '',
        resumeLink: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: '',
        experience: '',
        motivation: ''
      })
    } catch (error) {
      console.error('Error submitting application:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!internship) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'view' ? 'Internship Details' : 'Apply for Internship'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? 'Learn more about this internship opportunity'
              : 'Fill out the form below to apply for this internship'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Internship Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{internship.title}</h3>
              <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                <div className="flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  {internship.domain}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {internship.duration} weeks
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {internship._count.applications} applicants
                </div>
              </div>
              <div className="mt-2">
                {internship.isPaid && internship.stipend ? (
                  <Badge className="bg-green-100 text-green-800">
                    <DollarSign className="mr-1 h-3 w-3" />
                    ${internship.stipend}/month
                  </Badge>
                ) : (
                  <Badge variant="outline">Unpaid</Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{internship.description}</p>
            </div>

            {internship.skills && internship.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {internship.requirements && internship.requirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {internship.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {internship.responsibilities && internship.responsibilities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {internship.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {internship.benefits && internship.benefits.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {internship.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Mentor</h4>
              <p className="text-muted-foreground">{internship.mentor.name || 'TBD'}</p>
            </div>
          </div>

          {/* Application Form */}
          {mode === 'apply' && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Application Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub Profile</Label>
                  <Input
                    id="github"
                    type="url"
                    placeholder="https://github.com/yourusername"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio">Portfolio Website</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resumeLink">Resume Link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="resumeLink"
                    type="url"
                    placeholder="https://drive.google.com/your-resume-link"
                    value={formData.resumeLink}
                    onChange={(e) => handleInputChange('resumeLink', e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Provide a link to your resume or upload a file
                </p>
              </div>

              <div>
                <Label htmlFor="experience">Relevant Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your relevant experience, projects, and skills..."
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="motivation">Why are you interested in this internship?</Label>
                <Textarea
                  id="motivation"
                  placeholder="Tell us why you're interested in this internship and what you hope to learn..."
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Write a brief cover letter explaining why you're the perfect fit for this role..."
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode === 'apply' && (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}