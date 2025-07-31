"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BaseModal } from '../base/BaseModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Briefcase, Users, UserPlus, Plus } from 'lucide-react'
import Link from 'next/link'

interface AddTalentModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
}

export function AddTalentModal({ isOpen, onClose, companyId }: AddTalentModalProps) {
  const router = useRouter()
  const { toast } = useToast()

  const talentSources = [
    {
      id: 'internship',
      title: 'Create Internship',
      description: 'Post a new internship opportunity to attract student talent',
      icon: Briefcase,
      color: 'blue',
      href: '/company/internships/create'
    },
    {
      id: 'job',
      title: 'Create Job Posting',
      description: 'Post a job opening to attract experienced professionals',
      icon: Users,
      color: 'green',
      href: '/company/jobs/create'
    },
    {
      id: 'invite',
      title: 'Invite Directly',
      description: 'Send direct invitations to specific candidates',
      icon: UserPlus,
      color: 'purple',
      action: 'invite'
    },
    {
      id: 'import',
      title: 'Import from LinkedIn',
      description: 'Import candidate profiles from LinkedIn or other sources',
      icon: Plus,
      color: 'orange',
      action: 'import'
    }
  ]

  const handleAction = (source: any) => {
    if (source.href) {
      router.push(source.href)
      onClose()
    } else if (source.action === 'invite') {
      // TODO: Open invite modal
      toast({
        title: "Feature Coming Soon",
        description: "Direct invitation feature will be available soon.",
      })
    } else if (source.action === 'import') {
      // TODO: Open import modal
      toast({
        title: "Feature Coming Soon",
        description: "Import feature will be available soon.",
      })
    }
  }

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500'
    }
    return colors[color as keyof typeof colors] || 'text-gray-500'
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Add Talent to Pipeline" size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Choose How to Add Talent</h3>
          <p className="text-muted-foreground">
            Select the method you'd like to use to add new talent to your pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talentSources.map((source) => {
            const Icon = source.icon
            return (
              <Card 
                key={source.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleAction(source)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-8 w-8 ${getIconColor(source.color)}`} />
                    <div>
                      <CardTitle className="text-base">{source.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {source.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Quick Actions</h4>
          <div className="flex space-x-2">
            <Button asChild className="flex-1">
              <Link href="/company/internships/create">
                <Briefcase className="h-4 w-4 mr-2" />
                Create Internship
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/company/jobs/create">
                <Users className="h-4 w-4 mr-2" />
                Create Job
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}