"use client"

import { useState } from "react"
import { ConfirmModal } from "../base/ConfirmModal"
import { useToast } from "@/components/ui/use-toast"

interface Internship {
  id: string
  title: string
  applications: Array<{
    id: string
    status: string
  }>
}

interface DeleteInternshipModalProps {
  isOpen: boolean
  onClose: () => void
  internship: Internship
  onSuccess: () => void
}

export function DeleteInternshipModal({
  isOpen,
  onClose,
  internship,
  onSuccess
}: DeleteInternshipModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const activeApplications = internship.applications.filter(
    app => app.status === 'ACCEPTED' || app.status === 'PENDING'
  ).length

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/company/internships/${internship.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete internship')
      }

      toast({
        title: "Success",
        description: "Internship deleted successfully",
      })
      
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete internship",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getWarningMessage = () => {
    if (activeApplications > 0) {
      return `This internship has ${activeApplications} active application(s). Deleting this internship will permanently remove all associated data including applications, tasks, and submissions. This action cannot be undone.`
    }
    return `Are you sure you want to delete "${internship.title}"? This action cannot be undone.`
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Internship"
      description={getWarningMessage()}
      confirmText="Delete Internship"
      cancelText="Cancel"
      variant="destructive"
      isLoading={isLoading}
    />
  )
}