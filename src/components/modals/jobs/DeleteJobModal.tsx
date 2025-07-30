"use client"

import { useState } from "react"
import { ConfirmModal } from "../base/ConfirmModal"
import { useToast } from "@/components/ui/use-toast"

interface JobPosting {
  id: string
  title: string
  applications: Array<{
    id: string
    status: string
  }>
}

interface DeleteJobModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobPosting
  onSuccess: () => void
}

export function DeleteJobModal({
  isOpen,
  onClose,
  job,
  onSuccess
}: DeleteJobModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const activeApplications = job.applications.filter(
    app => app.status === 'ACCEPTED' || app.status === 'PENDING'
  ).length

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/company/jobs/${job.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete job posting')
      }

      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      })
      
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job posting",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getWarningMessage = () => {
    if (activeApplications > 0) {
      return `This job posting has ${activeApplications} active application(s). Deleting this job posting will permanently remove all associated data including applications and candidate information. This action cannot be undone.`
    }
    return `Are you sure you want to delete "${job.title}"? This action cannot be undone.`
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Job Posting"
      description={getWarningMessage()}
      confirmText="Delete Job Posting"
      cancelText="Cancel"
      variant="destructive"
      isLoading={isLoading}
    />
  )
}