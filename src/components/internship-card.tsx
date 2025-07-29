"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface InternshipCardProps {
  internship: {
    id: string;
    title: string;
    description: string;
    domain: string;
    duration: number;
    isPaid: boolean;
    stipend?: number;
    maxInterns: number;
    createdAt: string;
    mentor: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    applications: Array<{
      id: string;
      status: string;
    }>;
    _count: {
      applications: number;
    };
  };
  currentUserId?: string;
  userRole?: string;
  onApply?: (internshipId: string) => Promise<void>;
}

export function InternshipCard({ 
  internship, 
  currentUserId, 
  userRole,
  onApply 
}: InternshipCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const userApplication = internship.applications.find(
    app => currentUserId && app.id === currentUserId
  );

  const handleApply = async () => {
    if (!onApply) return;
    
    setIsApplying(true);
    try {
      await onApply(internship.id);
      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getApplicationStatus = () => {
    if (!userApplication) return null;
    
    const statusConfig = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      ACCEPTED: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Accepted' },
      REJECTED: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };

    const config = statusConfig[userApplication.status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {internship.title}
            </CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="secondary" className="mr-2">
                {internship.domain}
              </Badge>
              {internship.isPaid && (
                <Badge variant="outline" className="text-green-600">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${internship.stipend || 'Paid'}
                </Badge>
              )}
            </CardDescription>
          </div>
          {getApplicationStatus()}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {internship.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {internship.duration} weeks
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            {internship._count.applications} / {internship.maxInterns} applicants
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Avatar className="w-5 h-5 mr-2">
              <AvatarImage src={internship.mentor.image} />
              <AvatarFallback className="text-xs">
                {internship.mentor.name?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>
            {internship.mentor.name}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        {userRole === 'INTERN' && (
          <>
            {userApplication ? (
              <Button variant="outline" className="w-full" disabled>
                {userApplication.status === 'PENDING' && 'Application Pending'}
                {userApplication.status === 'ACCEPTED' && 'Application Accepted'}
                {userApplication.status === 'REJECTED' && 'Application Rejected'}
              </Button>
            ) : (
              <Button 
                onClick={handleApply}
                disabled={isApplying || internship._count.applications >= internship.maxInterns}
                className="w-full"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : internship._count.applications >= internship.maxInterns ? (
                  'Position Filled'
                ) : (
                  'Apply Now'
                )}
              </Button>
            )}
          </>
        )}
        
        {userRole === 'MENTOR' && internship.mentor.id === currentUserId && (
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1">
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Manage ({internship._count.applications})
            </Button>
          </div>
        )}

        {!userRole && (
          <Button variant="outline" className="w-full" disabled>
            Sign in to Apply
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}