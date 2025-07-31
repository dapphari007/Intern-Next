"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  className?: string
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg", 
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[95vw] h-[95vh]"
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className
}: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        sizeClasses[size], 
        "max-h-[90vh] overflow-hidden flex flex-col",
        className
      )}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}