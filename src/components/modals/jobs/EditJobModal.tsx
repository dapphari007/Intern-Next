"use client"

import { useState } from "react"
import { FormModal } from "../base/FormModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface JobPosting {
  id: string
  title: string
  description: string
  requirements: string
  location: string | null
  jobType: string
  salaryMin: number | null
  salaryMax: number | null
  isActive: boolean
}

interface EditJobModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobPosting
  onSuccess: () => void
}

const jobTypeOptions = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' }
]

export function EditJobModal({
  isOpen,
  onClose,
  job,
  onSuccess
}: EditJobModalProps) {
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location || "",
    jobType: job.jobType,
    salaryMin: job.salaryMin || 0,
    salaryMax: job.salaryMax || 0,
    isActive: job.isActive
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.requirements || !formData.jobType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.salaryMin > 0 && formData.salaryMax > 0 && formData.salaryMin >= formData.salaryMax) {
      toast({
        title: "Error",
        description: "Maximum salary must be greater than minimum salary",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/company/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin > 0 ? formData.salaryMin : null,
          salaryMax: formData.salaryMax > 0 ? formData.salaryMax : null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update job posting')
      }

      toast({
        title: "Success",
        description: "Job posting updated successfully",
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job posting",
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
      title="Edit Job Posting"
      description="Update job posting details"
      size="lg"
      onSubmit={handleSubmit}
      submitText="Update Job Posting"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobType">Job Type *</Label>
            <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., New York, NY or Remote"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active (Accepting Applications)</Label>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Salary Range (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                value={formData.salaryMin}
                onChange={(e) => handleInputChange('salaryMin', parseInt(e.target.value) || 0)}
                placeholder="Min salary"
              />
              <Input
                type="number"
                min="0"
                value={formData.salaryMax}
                onChange={(e) => handleInputChange('salaryMax', parseInt(e.target.value) || 0)}
                placeholder="Max salary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements *</Label>
          <Textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => handleInputChange('requirements', e.target.value)}
            placeholder="List the required skills, experience, and qualifications..."
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
            rows={4}
            required
          />
        </div>
      </div>
    </FormModal>
  )
}