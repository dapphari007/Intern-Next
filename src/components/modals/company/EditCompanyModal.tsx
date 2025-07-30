"use client"

import { useState } from "react"
import { FormModal } from "../base/FormModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Company {
  id: string
  name: string
  description: string | null
  website: string | null
  industry: string | null
  size: string | null
  location: string | null
  logo: string | null
}

interface EditCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company
  onSuccess: () => void
}

const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Transportation",
  "Energy",
  "Non-profit",
  "Government",
  "Other"
]

const sizeOptions = [
  "1-10",
  "11-50", 
  "51-100",
  "101-500",
  "501-1000",
  "1000+"
]

export function EditCompanyModal({
  isOpen,
  onClose,
  company,
  onSuccess
}: EditCompanyModalProps) {
  const [formData, setFormData] = useState({
    name: company.name || "",
    description: company.description || "",
    website: company.website || "",
    industry: company.industry || "",
    size: company.size || "",
    location: company.location || "",
    logo: company.logo || ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/company/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update company')
      }

      toast({
        title: "Success",
        description: "Company information updated successfully",
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Company Information"
      description="Update your company's profile information"
      size="lg"
      onSubmit={handleSubmit}
      submitText="Update Company"
      isLoading={isLoading}
    >
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

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((industry) => (
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
              {sizeOptions.map((size) => (
                <SelectItem key={size} value={size}>
                  {size} employees
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
            placeholder="City, State/Country"
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your company..."
          rows={4}
        />
      </div>
    </FormModal>
  )
}