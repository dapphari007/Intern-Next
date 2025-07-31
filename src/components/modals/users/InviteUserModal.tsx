"use client"

import { useState } from "react"
import { FormModal } from "../base/FormModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const roleOptions = [
  { value: 'INTERN', label: 'Intern' },
  { value: 'MENTOR', label: 'Mentor' },
  { value: 'COMPANY_ADMIN', label: 'Company Admin' }
]

const domainOptions = [
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'AI_ML', label: 'AI/ML' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'UI_UX', label: 'UI/UX Design' },
  { value: 'PRODUCT_MANAGEMENT', label: 'Product Management' }
]

export function InviteUserModal({
  isOpen,
  onClose,
  onSuccess
}: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    domain: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/company/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send invitation')
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      })
      
      // Reset form
      setFormData({
        email: "",
        role: "",
        domain: "",
        message: ""
      })
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
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
      title="Invite User"
      description="Send an invitation to join your company"
      size="md"
      onSubmit={handleSubmit}
      submitText="Send Invitation"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">Domain (Optional)</Label>
          <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              {domainOptions.map((domain) => (
                <SelectItem key={domain.value} value={domain.value}>
                  {domain.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Welcome Message (Optional)</Label>
          <Input
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Welcome to our team!"
          />
        </div>
      </div>
    </FormModal>
  )
}