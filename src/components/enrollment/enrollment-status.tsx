'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { checkEnrollmentStatus } from '@/store/slices/enrollmentSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  AlertCircle,
  Play
} from 'lucide-react';

interface EnrollmentStatusProps {
  courseId: string;
  onRequestAccess?: () => void;
  onStartLearning?: () => void;
}

export function EnrollmentStatus({ 
  courseId, 
  onRequestAccess, 
  onStartLearning 
}: EnrollmentStatusProps) {
  const dispatch = useAppDispatch();
  const { enrollmentStatus, isLoading } = useAppSelector((state) => state.enrollment);

  useEffect(() => {
    dispatch(checkEnrollmentStatus(courseId));
  }, [dispatch, courseId]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size={24} />
          <span className="ml-2">Checking enrollment status...</span>
        </CardContent>
      </Card>
    );
  }

  if (!enrollmentStatus) {
    return null;
  }

  const { hasRequest, status, request } = enrollmentStatus;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          title: 'Request Pending',
          description: 'Your enrollment request is being reviewed by the admin.',
          action: null,
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          borderColor: 'border-green-200 dark:border-green-700',
          title: 'Access Granted',
          description: 'Your enrollment request has been approved! You can now access this course.',
          action: {
            label: 'Start Learning',
            onClick: onStartLearning,
            variant: 'default' as const,
            icon: Play,
          },
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          borderColor: 'border-red-200 dark:border-red-700',
          title: 'Request Rejected',
          description: request?.adminResponse || 'Your enrollment request has been rejected.',
          action: {
            label: 'Request Again',
            onClick: onRequestAccess,
            variant: 'outline' as const,
            icon: BookOpen,
          },
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          borderColor: 'border-blue-200 dark:border-blue-700',
          title: 'No Request',
          description: 'You need to request access to enroll in this course.',
          action: {
            label: 'Request Access',
            onClick: onRequestAccess,
            variant: 'default' as const,
            icon: BookOpen,
          },
        };
    }
  };

  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  return (
    <Card className={`w-full max-w-md mx-auto border-2 ${statusConfig.borderColor}`}>
      <CardHeader className="text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${statusConfig.color}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{statusConfig.title}</CardTitle>
        <CardDescription className="text-sm">
          {statusConfig.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {request?.requestMessage && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Your message:</p>
            <p className="text-sm">{request.requestMessage}</p>
          </div>
        )}
        
        {statusConfig.action && (
          <Button 
            onClick={statusConfig.action.onClick}
            variant={statusConfig.action.variant}
            className="w-full"
          >
            <statusConfig.action.icon className="mr-2 h-4 w-4" />
            {statusConfig.action.label}
          </Button>
        )}

        {hasRequest && (
          <div className="mt-4 text-xs text-gray-500">
            Requested on: {new Date(request?.createdAt || '').toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
