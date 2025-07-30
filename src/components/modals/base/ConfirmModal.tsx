"use client"

import { BaseModal } from "./BaseModal"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default',
  isLoading = false
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          {variant === 'destructive' ? (
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          )}
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                {variant === 'destructive' && <Trash2 className="h-4 w-4 mr-2" />}
                {confirmText}
              </>
            )}
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}