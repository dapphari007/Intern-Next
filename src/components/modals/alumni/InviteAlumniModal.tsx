"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BaseModal } from '../base/BaseModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail } from 'lucide-react'

interface InviteAlumniModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
}

export function InviteAlumniModal({ isOpen, onClose, companyId }: InviteAlumniModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: '',
    role: 'ALUMNI'
  })
  
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/company/alumni/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send invitation')
      }

      toast({
        title: "Invitation Sent",
        description: "Alumni invitation has been sent successfully.",
      })

      onClose()
      setFormData({
        email: '',
        name: '',
        message: '',
        role: 'ALUMNI'
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const defaultMessage = `Hi there!

We would love to have you join our alumni network. As a former intern, your experience and insights would be valuable to our current and future interns.

By joining our alumni network, you'll be able to:
- Connect with other alumni and current interns
- Share your career journey and experiences
- Mentor current interns
- Stay updated with company news and opportunities

Looking forward to having you back in our community!

Best regards,
The Team`

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Invite Alumni" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <Mail className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="font-medium">Invite Alumni to Network</h3>
            <p className="text-sm text-muted-foreground">
              Send an invitation to former interns to join your alumni network
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="alumni@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Alumni Name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Alumni Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALUMNI">Alumni</SelectItem>
              <SelectItem value="MENTOR">Alumni Mentor</SelectItem>
              <SelectItem value="ADVISOR">Alumni Advisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Invitation Message</Label>
          <Textarea
            id="message"
            value={formData.message || defaultMessage}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Personal message to include in the invitation"
            rows={8}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            This message will be included in the invitation email
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}