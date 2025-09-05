'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUserEnrollmentRequests } from '@/store/slices/enrollmentSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Calendar,
  MessageSquare,
  RefreshCw,
  Play
} from 'lucide-react';
import Link from 'next/link';

export default function UserEnrollmentRequestsPage() {
  const dispatch = useAppDispatch();
  const { userEnrollmentRequests, isLoading, error } = useAppSelector((state) => state.enrollment);

  // Helper function to get course ID from enrollment request
  const getCourseIdFromRequest = (request: any) => {
    // If course is populated as an object
    if (request.course && typeof request.course === 'object' && request.course._id) {
      return request.course._id;
    }
    // If courseId is a string
    if (typeof request.courseId === 'string') {
      return request.courseId;
    }
    // If courseId is an object (populated)
    if (request.courseId && typeof request.courseId === 'object' && request.courseId._id) {
      return request.courseId._id;
    }
    // Fallback
    return '';
  };

  // Helper function to get course name from enrollment request
  const getCourseNameFromRequest = (request: any) => {
    // If course is populated as an object
    if (request.course && typeof request.course === 'object' && request.course.title) {
      return request.course.title;
    }
    // If courseId is an object (populated)
    if (request.courseId && typeof request.courseId === 'object' && request.courseId.title) {
      return request.courseId.title;
    }
    // Fallback
    return 'Unknown Course';
  };

  useEffect(() => {
    dispatch(fetchUserEnrollmentRequests({}));
  }, [dispatch]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          title: 'Pending',
          description: 'Your request is being reviewed',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          borderColor: 'border-green-200 dark:border-green-700',
          title: 'Approved',
          description: 'You can now access this course',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          borderColor: 'border-red-200 dark:border-red-700',
          title: 'Rejected',
          description: 'Your request was not approved',
        };
      default:
        return {
          icon: BookOpen,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          borderColor: 'border-gray-200 dark:border-gray-700',
          title: 'Unknown',
          description: 'Unknown status',
        };
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['user', 'admin', 'superAdmin']}>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner size={48} />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['user', 'admin', 'superAdmin']}>
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Enrollment Requests
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Track your course enrollment requests
                </p>
              </div>
              <Button 
                onClick={() => dispatch(fetchUserEnrollmentRequests({}))}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {error && (
              <Card className="mb-6 border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {userEnrollmentRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No enrollment requests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You haven't requested enrollment in any courses yet.
                  </p>
                  <Link href="/courses">
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {userEnrollmentRequests.map((request) => {
                  const statusConfig = getStatusConfig(request.status);
                  const IconComponent = statusConfig.icon;
                  const courseName = getCourseNameFromRequest(request);

                  return (
                    <Card 
                      key={request._id} 
                      className={`hover:shadow-md transition-shadow border-2 ${statusConfig.borderColor}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {courseName}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.color}`}>
                                <IconComponent className="h-4 w-4" />
                                <span className="text-sm font-medium">{statusConfig.title}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {statusConfig.description}
                          </p>

                          {request.requestMessage && (
                            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">Your message:</span>
                              </div>
                              <p className="text-sm">{request.requestMessage}</p>
                            </div>
                          )}

                          {request.adminResponse && (
                            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Admin response:</span>
                              </div>
                              <p className="text-sm">{request.adminResponse}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                            {request.approvedAt && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>Processed: {new Date(request.approvedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {request.status === 'approved' && (
                            <div className="mt-4">
                              {getCourseIdFromRequest(request) && (
                                <Link href={`/courses/${getCourseIdFromRequest(request)}`}>
                                  <Button>
                                    <Play className="h-4 w-4 mr-2" />
                                    Access Course
                                  </Button>
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
