"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Plus } from "lucide-react"

interface Internship {
  id: string
  title: string
  company: string
  location: string
  duration: number
  isPaid: boolean
  stipend?: number
  domain: string
  description: string
  mentor: string
  mentorId: string
  rating: number
  applicants: number
  maxInterns: number
  skills: string[]
  postedAt: string
  status: 'active' | 'inactive' | 'completed' | 'pending'
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
}

interface EditInternshipFormProps {
  internship: Internship
  onSubmit: (data: Partial<Internship>) => Promise<void>
  onCancel: () => void
}

const domains = [
  "Web Development",
  "Data Science", 
  "Design",
  "Backend Development",
  "Mobile Development",
  "DevOps",
  "Cybersecurity",
  "Artificial Intelligence",
  "Machine Learning",
  "Cloud Computing",
  "Blockchain",
  "Game Development"
]

export function EditInternshipForm({ internship, onSubmit, onCancel }: EditInternshipFormProps) {
  const [formData, setFormData] = useState({
    title: internship.title,
    description: internship.description,
    domain: internship.domain,
    duration: internship.duration,
    isPaid: internship.isPaid,
    stipend: internship.stipend || 0,
    maxInterns: internship.maxInterns,
    skills: [...internship.skills],
    requirements: [...internship.requirements],
    responsibilities: [...internship.responsibilities],
    benefits: [...internship.benefits]
  })

  const [newSkill, setNewSkill] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [newResponsibility, setNewResponsibility] = useState("")
  const [newBenefit, setNewBenefit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error updating internship:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = (type: 'skills' | 'requirements' | 'responsibilities' | 'benefits', value: string) => {
    if (!value.trim()) return

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }))

    // Clear the input
    switch (type) {
      case 'skills':
        setNewSkill("")
        break
      case 'requirements':
        setNewRequirement("")
        break
      case 'responsibilities':
        setNewResponsibility("")
        break
      case 'benefits':
        setNewBenefit("")
        break
    }
  }

  const removeItem = (type: 'skills' | 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Frontend Developer Intern"
                required
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain *</Label>
              <Select
                value={formData.domain}
                onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the internship opportunity..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration">Duration (weeks) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="52"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxInterns">Max Interns *</Label>
              <Input
                id="maxInterns"
                type="number"
                min="1"
                max="50"
                value={formData.maxInterns}
                onChange={(e) => setFormData(prev => ({ ...prev, maxInterns: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPaid: checked }))}
              />
              <Label htmlFor="isPaid">Paid Internship</Label>
            </div>
          </div>

          {formData.isPaid && (
            <div>
              <Label htmlFor="stipend">Monthly Stipend (₹)</Label>
              <Input
                id="stipend"
                type="number"
                min="0"
                value={formData.stipend}
                onChange={(e) => setFormData(prev => ({ ...prev, stipend: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 15000"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Required Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem('skills', newSkill)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem('skills', newSkill)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeItem('skills', index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add a requirement..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem('requirements', newRequirement)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem('requirements', newRequirement)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{requirement}</span>
                <X
                  className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem('requirements', index)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle>Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              placeholder="Add a responsibility..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem('responsibilities', newResponsibility)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem('responsibilities', newResponsibility)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{responsibility}</span>
                <X
                  className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem('responsibilities', index)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Add a benefit..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem('benefits', newBenefit)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem('benefits', newBenefit)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{benefit}</span>
                <X
                  className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem('benefits', index)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Internship"}
        </Button>
      </div>
    </form>
  )
}