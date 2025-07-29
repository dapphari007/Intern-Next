"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  FileText,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    dueDate?: string;
    createdAt: string;
    internship: {
      id: string;
      title: string;
      mentor: {
        id: string;
        name: string;
      };
    };
    assignee: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    submissions: Array<{
      id: string;
      status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
      submittedAt: string;
    }>;
  };
  currentUserId?: string;
  userRole?: string;
  onSubmit?: (taskId: string) => void;
  onReview?: (taskId: string) => void;
}

export function TaskCard({ 
  task, 
  currentUserId, 
  userRole,
  onSubmit,
  onReview
}: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { 
        icon: Clock, 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', 
        text: 'Pending',
        progress: 0
      },
      IN_PROGRESS: { 
        icon: AlertCircle, 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', 
        text: 'In Progress',
        progress: 50
      },
      COMPLETED: { 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
        text: 'Completed',
        progress: 100
      },
      OVERDUE: { 
        icon: AlertCircle, 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
        text: 'Overdue',
        progress: 25
      },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const getSubmissionStatusConfig = (status: string) => {
    const configs = {
      SUBMITTED: { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
      APPROVED: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      NEEDS_REVISION: { color: 'bg-orange-100 text-orange-800', text: 'Needs Revision' },
    };
    return configs[status as keyof typeof configs];
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;
  const latestSubmission = task.submissions[0];

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  const canSubmit = currentUserId === task.assignee.id && task.status !== 'COMPLETED';
  const canReview = userRole === 'MENTOR' && latestSubmission && latestSubmission.status === 'SUBMITTED';

  const handleAction = async (action: 'submit' | 'review') => {
    setIsLoading(true);
    try {
      if (action === 'submit' && onSubmit) {
        onSubmit(task.id);
      } else if (action === 'review' && onReview) {
        onReview(task.id);
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to perform action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {task.title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {task.internship.title}
            </CardDescription>
          </div>
          <Badge className={statusConfig.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {isOverdue ? 'Overdue' : statusConfig.text}
          </Badge>
        </div>
        
        <Progress value={statusConfig.progress} className="mt-2" />
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {task.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <Avatar className="w-5 h-5 mr-2">
              <AvatarImage src={task.assignee.image} />
              <AvatarFallback className="text-xs">
                {task.assignee.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {task.assignee.name}
          </div>

          {task.dueDate && (
            <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
              <Calendar className="w-4 h-4 mr-2" />
              Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
            </div>
          )}

          {latestSubmission && (
            <div className="flex items-center text-sm">
              <FileText className="w-4 h-4 mr-2" />
              <Badge className={getSubmissionStatusConfig(latestSubmission.status)?.color}>
                {getSubmissionStatusConfig(latestSubmission.status)?.text}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex gap-2 w-full">
          {canSubmit && (
            <Button 
              onClick={() => handleAction('submit')}
              disabled={isLoading}
              className="flex-1"
              variant={latestSubmission ? "outline" : "default"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : latestSubmission ? (
                'Resubmit'
              ) : (
                'Submit Work'
              )}
            </Button>
          )}

          {canReview && (
            <Button 
              onClick={() => handleAction('review')}
              disabled={isLoading}
              className="flex-1"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Review Submission'
              )}
            </Button>
          )}

          {!canSubmit && !canReview && (
            <Button variant="outline" className="w-full" disabled>
              {task.status === 'COMPLETED' ? 'Task Completed' : 'View Details'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}