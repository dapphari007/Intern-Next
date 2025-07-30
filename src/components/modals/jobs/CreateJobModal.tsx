"use client"

import { useState } from "react"
import { FormModal } from "../base/FormModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const jobTypeOptions = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' }
]

export function CreateJobModal({
  isOpen,
  onClose,
  onSuccess
}: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "",
    salaryMin: 0,
    salaryMax: 0
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
      const response = await fetch('/api/company/jobs', {
        method: 'POST',
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
        throw new Error('Failed to create job posting')
      }

      toast({
        title: "Success",
        description: "Job posting created successfully",
      })
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      location: "",
      jobType: "",
      salaryMin: 0,
      salaryMax: 0
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Job Posting"
      description="Add a new job opportunity to your company"
      size="lg"
      onSubmit={handleSubmit}
      submitText="Create Job Posting"
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