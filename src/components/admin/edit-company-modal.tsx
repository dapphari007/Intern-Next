"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  role: string
  companyId?: string | null
}

interface Company {
  id: string
  name: string
  description?: string
  website?: string
  industry?: string
  size?: string
  location?: string
  logo?: string
  users?: User[]
}

interface EditCompanyModalProps {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const companySizes = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
]

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Non-profit",
  "Government",
  "Other"
]

export function EditCompanyModal({ company, open, onOpenChange, onSuccess }: EditCompanyModalProps) {
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [currentAdminUser, setCurrentAdminUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    size: "",
    location: "",
    logo: "",
    adminUserId: ""
  })

  useEffect(() => {
    if (company) {
      // Find current admin user
      const adminUser = company.users?.find(user => user.role === 'COMPANY_ADMIN') || null
      setCurrentAdminUser(adminUser)
      
      setFormData({
        name: company.name || "",
        description: company.description || "",
        website: company.website || "",
        industry: company.industry || "",
        size: company.size || "",
        location: company.location || "",
        logo: company.logo || "",
        adminUserId: adminUser?.id || "no-admin"
      })
    }
  }, [company])

  useEffect(() => {
    if (open) {
      fetchAvailableUsers()
    }
  }, [open, company])

  const fetchAvailableUsers = async () => {
    try {
      setUsersLoading(true)
      // Fetch users with COMPANY_ADMIN role
      const response = await fetch('/api/users?role=COMPANY_ADMIN')
      if (response.ok) {
        const data = await response.json()
        // Filter users who don't have a company assigned OR are assigned to current company
        const availableUsersForCompany = data.users?.filter((user: User) => 
          !user.companyId || user.companyId === company.id
        ) || []
        setAvailableUsers(availableUsersForCompany)
      } else {
        console.error('Failed to fetch users')
        setAvailableUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setAvailableUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Company name is required")
      return
    }

    setLoading(true)
    try {
      // Prepare form data, converting "no-admin" to empty string
      const submitData = {
        ...formData,
        adminUserId: formData.adminUserId === "no-admin" ? "" : formData.adminUserId
      }
      
      const response = await fetch(`/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update company')
      }
    } catch (error) {
      console.error('Error updating company:', error)
      alert('Failed to update company')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the company information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the company"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => handleInputChange('logo', e.target.value)}
                placeholder="https://company.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminUser">Company Admin (Optional)</Label>
            <Select value={formData.adminUserId} onValueChange={(value) => handleInputChange('adminUserId', value)}>
              <SelectTrigger>
                <SelectValue placeholder={usersLoading ? "Loading users..." : "Select company admin"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-admin">No admin assigned</SelectItem>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                    {user.id === currentAdminUser?.id && " (Current)"}
                  </SelectItem>
                ))}
                {availableUsers.length === 0 && !usersLoading && (
                  <SelectItem value="no-users" disabled>
                    No available company admin users
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}