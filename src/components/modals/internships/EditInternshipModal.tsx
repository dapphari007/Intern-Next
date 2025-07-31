"use client"

import { useState, useEffect } from "react"
import { FormModal } from "../base/FormModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

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
  mentorId: string | null
}

interface EditInternshipModalProps {
  isOpen: boolean
  onClose: () => void
  internship: Internship
  onSuccess: () => void
}

interface Mentor {
  id: string
  name: string | null
  email: string
}

const domainOptions = [
  "Frontend Development",
  "Backend Development", 
  "Full Stack Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "DevOps",
  "UI/UX Design",
  "Digital Marketing",
  "Content Writing",
  "Business Analysis",
  "Quality Assurance",
  "Cybersecurity",
  "Cloud Computing",
  "Other"
]

export function EditInternshipModal({
  isOpen,
  onClose,
  internship,
  onSuccess
}: EditInternshipModalProps) {
  const [formData, setFormData] = useState({
    title: internship.title,
    description: internship.description,
    domain: internship.domain,
    duration: internship.duration,
    isPaid: internship.isPaid,
    stipend: internship.stipend || 0,
    isActive: internship.isActive,
    maxInterns: internship.maxInterns,
    mentorId: internship.mentorId
  })
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchMentors()
    }
  }, [isOpen])

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/company/mentors')
      if (response.ok) {
        const data = await response.json()
        setMentors(data)
      }
    } catch (error) {
      console.error('Failed to fetch mentors:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.domain || !formData.mentorId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/company/internships/${internship.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          stipend: formData.isPaid ? formData.stipend : null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update internship')
      }

      toast({
        title: "Success",
        description: "Internship updated successfully",
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update internship",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Internship"
      description="Update internship program details"
      size="lg"
      onSubmit={handleSubmit}
      submitText="Update Internship"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Internship Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Frontend Development Internship"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domainOptions.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (weeks) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="52"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxInterns">Maximum Interns *</Label>
            <Input
              id="maxInterns"
              type="number"
              min="1"
              max="10"
              value={formData.maxInterns}
              onChange={(e) => handleInputChange('maxInterns', parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentor">Mentor *</Label>
            <Select value={formData.mentorId || undefined} onValueChange={(value) => handleInputChange('mentorId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mentor" />
              </SelectTrigger>
              <SelectContent>
                {mentors.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.name} ({mentor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive" className="text-sm font-medium">
                Active (Accepting Applications)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => handleInputChange('isPaid', checked)}
              />
              <Label htmlFor="isPaid" className="text-sm font-medium">
                Paid Internship
              </Label>
            </div>
            {formData.isPaid && (
              <div className="mt-2">
                <Label htmlFor="stipend" className="text-sm">Monthly Stipend</Label>
                <Input
                  id="stipend"
                  type="number"
                  min="0"
                  value={formData.stipend}
                  onChange={(e) => handleInputChange('stipend', parseInt(e.target.value))}
                  placeholder="Enter amount"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the internship program, responsibilities, and learning outcomes..."
            rows={4}
            required
          />
        </div>
      </div>
    </FormModal>
  )
}