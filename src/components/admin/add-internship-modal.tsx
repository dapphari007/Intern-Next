"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface Mentor {
  id: string
  name: string
  email: string
  image?: string
  _count: {
    mentorships: number
  }
}

interface FormData {
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend?: number
  maxInterns: number
  mentorId: string
  skills: string[]
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
}

interface AddInternshipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddInternshipModal({ open, onOpenChange, onSuccess }: AddInternshipModalProps) {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [newResponsibility, setNewResponsibility] = useState("")
  const [newBenefit, setNewBenefit] = useState("")
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    domain: "",
    duration: 4,
    isPaid: false,
    maxInterns: 1,
    mentorId: "",
    skills: [],
    requirements: [],
    responsibilities: [],
    benefits: []
  })

  useEffect(() => {
    if (open) {
      fetchMentors()
    }
  }, [open])

  const fetchMentors = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/mentors')
      if (response.ok) {
        const data = await response.json()
        setMentors(data)
      } else {
        console.error('Failed to fetch mentors')
      }
    } catch (error) {
      console.error('Error fetching mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addResponsibility = () => {
    if (newResponsibility.trim() && !formData.responsibilities.includes(newResponsibility.trim())) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()]
      }))
      setNewResponsibility("")
    }
  }

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }))
      setNewBenefit("")
    }
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          domain: "",
          duration: 4,
          isPaid: false,
          maxInterns: 1,
          mentorId: "",
          skills: [],
          requirements: [],
          responsibilities: [],
          benefits: []
        })
        setNewSkill("")
        setNewRequirement("")
        setNewResponsibility("")
        setNewBenefit("")
        onOpenChange(false)
        onSuccess()
      } else {
        const error = await response.json()
        console.error('Failed to create internship:', error)
        alert('Failed to create internship: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating internship:', error)
      alert('Error creating internship')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Internship
          </DialogTitle>
          <DialogDescription>
            Create a new internship opportunity for students
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Frontend Developer Internship"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the internship responsibilities, requirements, and learning outcomes..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="Game Development">Game Development</SelectItem>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentor">Mentor *</Label>
            <Select value={formData.mentorId} onValueChange={(value) => handleInputChange('mentorId', value)}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading mentors..." : "Select mentor"} />
              </SelectTrigger>
              <SelectContent>
                {mentors.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.name} ({mentor.email}) - {mentor._count.mentorships} internships
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxInterns">Maximum Interns</Label>
            <Input
              id="maxInterns"
              type="number"
              min="1"
              max="10"
              value={formData.maxInterns}
              onChange={(e) => handleInputChange('maxInterns', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isPaid">Internship Type</Label>
            <Select value={formData.isPaid ? "paid" : "unpaid"} onValueChange={(value) => handleInputChange('isPaid', value === "paid")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid Internship</SelectItem>
                <SelectItem value="paid">Paid Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.isPaid && (
            <div className="space-y-2">
              <Label htmlFor="stipend">Stipend Amount (per month)</Label>
              <Input
                id="stipend"
                type="number"
                min="0"
                value={formData.stipend || ''}
                onChange={(e) => handleInputChange('stipend', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 5000"
              />
            </div>
          )}

          {/* Skills Section */}
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex space-x-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., React, Python)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements Section */}
          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex space-x-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {formData.requirements.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-sm text-gray-900 dark:text-gray-100">{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Responsibilities Section */}
          <div className="space-y-2">
            <Label>Responsibilities</Label>
            <div className="flex space-x-2">
              <Input
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Add a responsibility"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
              />
              <Button type="button" onClick={addResponsibility} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {formData.responsibilities.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-sm text-gray-900 dark:text-gray-100">{resp}</span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Benefits Section */}
          <div className="space-y-2">
            <Label>Benefits</Label>
            <div className="flex space-x-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a benefit"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <Button type="button" onClick={addBenefit} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {formData.benefits.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-sm text-gray-900 dark:text-gray-100">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? 'Creating...' : 'Create Internship'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}