"use client"

import { BaseModal } from "./BaseModal"
import { Button } from "@/components/ui/button"
import { Save, X } from "lucide-react"

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  onSubmit?: () => Promise<void> | void
  submitText?: string
  isLoading?: boolean
  showFooter?: boolean
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  onSubmit,
  submitText = "Save",
  isLoading = false,
  showFooter = true
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      await onSubmit()
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-1 py-2">
          <div className="space-y-4">
            {children}
          </div>
        </div>
        
        {showFooter && (
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {onSubmit && (
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {submitText}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </form>
    </BaseModal>
  )
}