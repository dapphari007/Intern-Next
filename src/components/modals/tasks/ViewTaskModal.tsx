"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BaseModal } from '../base/BaseModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  FileText,
  Loader2,
  Download,
  Check,
  X
} from 'lucide-react'
import { format } from 'date-fns'

interface ViewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: any
}

export function ViewTaskModal({ isOpen, onClose, task }: ViewTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  if (!task) return null

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { 
        icon: Clock, 
        color: 'bg-gray-100 text-gray-800', 
        text: 'Pending',
        progress: 0
      },
      IN_PROGRESS: { 
        icon: AlertCircle, 
        color: 'bg-blue-100 text-blue-800', 
        text: 'In Progress',
        progress: 50
      },
      COMPLETED: { 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-800', 
        text: 'Completed',
        progress: 100
      },
      OVERDUE: { 
        icon: AlertCircle, 
        color: 'bg-red-100 text-red-800', 
        text: 'Overdue',
        progress: 25
      },
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  const statusConfig = getStatusConfig(task.status)
  const StatusIcon = statusConfig.icon
  const latestSubmission = task.submissions?.[0]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'

  const handleReviewSubmission = async (submissionId: string, action: 'approve' | 'reject') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error('Failed to review submission')
      }

      toast({
        title: "Submission Reviewed",
        description: `Submission has been ${action}d successfully.`,
      })

      router.refresh()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review submission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
      <div className="space-y-6">
        {/* Task Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
            <p className="text-muted-foreground mb-3">{task.description}</p>
            <div className="flex items-center space-x-2">
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {isOverdue ? 'Overdue' : statusConfig.text}
              </Badge>
              <Badge variant="outline">{task.internship?.domain || 'General'}</Badge>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {statusConfig.progress}%
            </span>
          </div>
          <Progress value={statusConfig.progress} />
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">Assigned to:</span>
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assignee?.image} />
                  <AvatarFallback className="text-xs">
                    {task.assignee?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignee?.name || task.assignee?.email}</span>
              </div>
            </div>

            {task.dueDate && (
              <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium mr-2">Due:</span>
                <span>{format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium mr-2">Created:</span>
              <span>{format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="w-4 h-4 mr-2" />
              <span className="font-medium mr-2">Internship:</span>
              <span>{task.internship?.title}</span>
            </div>

            {task.internship?.mentor && (
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium mr-2">Mentor:</span>
                <span>{task.internship.mentor.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Submissions */}
        {latestSubmission && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Latest Submission</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    latestSubmission.status === 'APPROVED' ? 'default' :
                    latestSubmission.status === 'REJECTED' ? 'destructive' :
                    latestSubmission.status === 'NEEDS_REVISION' ? 'secondary' :
                    'outline'
                  }>
                    {latestSubmission.status === 'SUBMITTED' ? 'Under Review' : latestSubmission.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(latestSubmission.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>

              {latestSubmission.content && (
                <div>
                  <span className="text-sm font-medium">Submission:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {latestSubmission.content}
                  </p>
                </div>
              )}

              {latestSubmission.fileUrl && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Button variant="outline" size="sm" asChild>
                    <a href={latestSubmission.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-3 h-3 mr-1" />
                      Download File
                    </a>
                  </Button>
                </div>
              )}

              {latestSubmission.status === 'SUBMITTED' && (
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm"
                    onClick={() => handleReviewSubmission(latestSubmission.id, 'approve')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReviewSubmission(latestSubmission.id, 'reject')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <X className="w-3 h-3 mr-1" />
                    )}
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}