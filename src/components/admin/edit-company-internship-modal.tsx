"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend?: number
  mentorId?: string
  maxInterns: number
  status: string
  isActive: boolean
  mentor?: {
    id: string
    name: string
    email: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface EditInternshipModalProps {
  companyId: string
  internship: Internship
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const domains = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "Digital Marketing",
  "Content Writing",
  "Business Development",
  "Human Resources",
  "Finance",
  "Operations",
  "Other"
]

const statuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "COMPLETED", label: "Completed" }
]

export function EditInternshipModal({ companyId, internship, users, open, onOpenChange, onSuccess }: EditInternshipModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "",
    duration: "",
    isPaid: false,
    stipend: "",
    mentorId: "none",
    maxInterns: "",
    status: "ACTIVE",
    isActive: true
  })

  // Filter users to show only mentors and company admins
  const availableMentors = users.filter(user => 
    user.isActive && (user.role === 'MENTOR' || user.role === 'COMPANY_ADMIN')
  )

  useEffect(() => {
    if (internship) {
      setFormData({
        title: internship.title || "",
        description: internship.description || "",
        domain: internship.domain || "",
        duration: internship.duration?.toString() || "",
        isPaid: internship.isPaid || false,
        stipend: internship.stipend?.toString() || "",
        mentorId: internship.mentorId || "none",
        maxInterns: internship.maxInterns?.toString() || "1",
        status: internship.status || "ACTIVE",
        isActive: internship.isActive !== undefined ? internship.isActive : true
      })
    }
  }, [internship])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.domain || !formData.duration) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        domain: formData.domain,
        duration: parseInt(formData.duration),
        isPaid: formData.isPaid,
        stipend: formData.isPaid && formData.stipend ? parseFloat(formData.stipend) : null,
        mentorId: formData.mentorId && formData.mentorId !== "none" ? formData.mentorId : null,
        maxInterns: parseInt(formData.maxInterns),
        status: formData.status,
        isActive: formData.isActive
      }

      const response = await fetch(`/api/admin/companies/${companyId}/internships/${internship.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        console.error('Update error:', error)
        alert(error.error || 'Failed to update internship')
      }
    } catch (error) {
      console.error('Error updating internship:', error)
      alert('Failed to update internship')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Internship</DialogTitle>
          <DialogDescription>
            Update the internship information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Internship Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Frontend Developer Intern"
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
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the internship role and responsibilities"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="52"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxInterns">Max Interns</Label>
              <Input
                id="maxInterns"
                type="number"
                min="1"
                max="100"
                value={formData.maxInterns}
                onChange={(e) => handleInputChange('maxInterns', e.target.value)}
                placeholder="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentorId">Mentor</Label>
            <Select value={formData.mentorId} onValueChange={(value) => handleInputChange('mentorId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mentor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No mentor assigned</SelectItem>
                {availableMentors.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.name} ({mentor.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => handleInputChange('isPaid', checked)}
              />
              <Label htmlFor="isPaid">This is a paid internship</Label>
            </div>
            
            {formData.isPaid && (
              <div className="space-y-2">
                <Label htmlFor="stipend">Stipend Amount</Label>
                <Input
                  id="stipend"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.stipend}
                  onChange={(e) => handleInputChange('stipend', e.target.value)}
                  placeholder="1000.00"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Internship is active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Internship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}