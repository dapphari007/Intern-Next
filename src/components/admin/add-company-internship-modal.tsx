"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AddInternshipModalProps {
  companyId: string
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

export function AddInternshipModal({ companyId, open, onOpenChange, onSuccess }: AddInternshipModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "",
    duration: "",
    isPaid: false,
    stipend: "",
    mentorId: "",
    maxInterns: "1",
    status: "ACTIVE"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.domain || !formData.duration) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/internships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          maxInterns: parseInt(formData.maxInterns),
          stipend: formData.isPaid && formData.stipend ? parseFloat(formData.stipend) : null
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          title: "",
          description: "",
          domain: "",
          duration: "",
          isPaid: false,
          stipend: "",
          mentorId: "",
          maxInterns: "1",
          status: "ACTIVE"
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create internship')
      }
    } catch (error) {
      console.error('Error creating internship:', error)
      alert('Failed to create internship')
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
          <DialogTitle>Add New Internship</DialogTitle>
          <DialogDescription>
            Create a new internship for this company. Fill in the required information below.
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Internship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}