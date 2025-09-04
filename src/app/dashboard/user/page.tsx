'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses } from '@/store/slices/courseSlice';
import { fetchUserEnrollmentRequests } from '@/store/slices/enrollmentSlice';

import { MainLayout } from '@/components/layout/main-layout';
import { UserRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  CheckCircle,
  Calendar,
  Target,
  Star,
  Bookmark,
  History,
  FileText,
  Users,
  AlertCircle,
  Eye,
  BarChart3,
  GraduationCap,
  Zap,
  Trophy,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function UserDashboardContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { courses, isLoading: coursesLoading } = useAppSelector((state) => state.course);

  const { userEnrollmentRequests, isLoading: enrollmentLoading } = useAppSelector((state) => state.enrollment);
  


  useEffect(() => {
    dispatch(fetchCourses({ isPublished: true }));
    if (user?._id) {
      dispatch(fetchUserEnrollmentRequests({}));
    }
  }, [dispatch, user?._id]);

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

  // Calculate enrollment statistics
  const pendingRequests = userEnrollmentRequests?.filter(req => req.status === 'pending') || [];
  const approvedRequests = userEnrollmentRequests?.filter(req => req.status === 'approved') || [];
  const rejectedRequests = userEnrollmentRequests?.filter(req => req.status === 'rejected') || [];

  // Get enrolled courses (courses with approved enrollment requests)
  const enrolledCourses = courses?.filter(course => 
    approvedRequests.some(req => getCourseIdFromRequest(req) === course._id)
  ) || [];

  // Get courses with pending requests
  const pendingCourses = courses?.filter(course => 
    pendingRequests.some(req => getCourseIdFromRequest(req) === course._id)
  ) || [];



  const stats = [
    {
      title: 'Enrolled Courses',
      value: enrolledCourses.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Courses you have access to'
    },

    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Awaiting admin approval'
    },

  ];

  const isLoading = coursesLoading || enrollmentLoading;

  return (
    <MainLayout>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Learning Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back, {user?.name}! Continue your learning journey
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  Student
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/user/enrollment-requests')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  My Requests
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-gray-700`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>



          {/* Main Content Tabs */}
          <Tabs defaultValue="enrolled" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
              <TabsTrigger value="pending">Pending Requests</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Enrolled Courses Tab */}
            <TabsContent value="enrolled" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Enrolled Courses
                  </CardTitle>
                  <CardDescription>
                    Continue learning from your approved courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {enrolledCourses.map((course) => {
                        return (
                          <Card key={course._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden">
                                <Image
                                  src={course.thumbnail || '/placeholder-course.jpg'}
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {course.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {course.description}
                              </p>
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => router.push(`/courses/${course._id}`)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Continue Learning
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        You haven't enrolled in any courses yet
                      </p>
                      <Button onClick={() => router.push('/courses')}>
                        Browse Courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Requests Tab */}
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Enrollment Requests
                  </CardTitle>
                  <CardDescription>
                    Your course access requests awaiting admin approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => {
                        const course = courses.find(c => c._id === getCourseIdFromRequest(request));
                        return (
                          <div key={request._id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={course?.thumbnail || '/placeholder-course.jpg'}
                                alt={course?.title || 'Course'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {course?.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Requested on {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                              {request.requestMessage && (
                                <p className="text-sm text-gray-500 mt-1">
                                  "{request.requestMessage}"
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Pending Review
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        No pending enrollment requests
                      </p>
                      <Button onClick={() => router.push('/courses')}>
                        Browse Courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommended Courses Tab */}
            <TabsContent value="recommended" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recommended for You
                  </CardTitle>
                  <CardDescription>
                    Courses tailored to your interests and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {courses?.slice(0, 6).map((course) => {
                        const isEnrolled = enrolledCourses.some(c => c._id === course._id);
                        const isPending = pendingRequests.some(req => getCourseIdFromRequest(req) === course._id);
                        
                        return (
                          <Card key={course._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden">
                                <Image
                                  src={course.thumbnail || '/placeholder-course.jpg'}
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {course.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {course.description}
                              </p>
                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <span>{course.level || 'Beginner'}</span>
                                <span>{course.duration || '0'} hours</span>
                              </div>
                              {isEnrolled ? (
                                <Button size="sm" className="w-full" variant="outline" disabled>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Enrolled
                                </Button>
                              ) : isPending ? (
                                <Button size="sm" className="w-full" variant="outline" disabled>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Request Pending
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => router.push(`/courses/${course._id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Course
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Learning Achievements
                  </CardTitle>
                  <CardDescription>
                    Track your progress and celebrate milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Goals */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Current Goals
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              Complete 5 courses
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              Progress: {enrolledCourses.length}/5 enrolled
                            </p>
                          </div>
                          <Progress value={(enrolledCourses.length / 5) * 100} className="w-20" />
                        </div>

                      </div>
                    </div>

                    {/* Recent Achievements */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Recent Achievements
                      </h4>
                      <div className="space-y-3">
                        {enrolledCourses.length > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                First Course Enrolled!
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                You enrolled in your first course
                              </p>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

export default function UserDashboardPage() {
  return (
    <UserRoute>
      <UserDashboardContent />
    </UserRoute>
  );
}
