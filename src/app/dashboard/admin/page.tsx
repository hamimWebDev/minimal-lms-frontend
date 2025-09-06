'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses } from '@/store/slices/courseSlice';
import { fetchBlogs } from '@/store/slices/blogSlice';
import { fetchUsers, fetchAdmins } from '@/store/slices/userSlice';
import { fetchAllEnrollmentRequests } from '@/store/slices/enrollmentSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Calendar,
  TrendingUp,
  PenTool,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  GraduationCap,
  Target,
  Award,
  Zap,
  Trophy,
  Bookmark,
  Play,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function AdminDashboardContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { courses, isLoading: coursesLoading } = useAppSelector((state) => state.course);
  const { blogs, isLoading: blogsLoading } = useAppSelector((state) => state.blog);
  const { users, admins, isLoading: usersLoading } = useAppSelector((state) => state.user);
  const { enrollmentRequests, isLoading: enrollmentLoading } = useAppSelector((state) => state.enrollment);

  useEffect(() => {
    dispatch(fetchCourses({})); // Fetch all courses for admin
    dispatch(fetchBlogs()); // Fetch all blogs for admin
    dispatch(fetchUsers()); // Fetch all users for admin
    dispatch(fetchAdmins()); // Fetch all admins for admin
    dispatch(fetchAllEnrollmentRequests({})); // Fetch all enrollment requests
  }, [dispatch]);

  // Calculate statistics
  const publishedCourses = courses?.filter(course => course.isPublished) || [];
  const pendingEnrollments = enrollmentRequests?.filter(req => req.status === 'pending') || [];
  const approvedEnrollments = enrollmentRequests?.filter(req => req.status === 'approved') || [];
  const rejectedEnrollments = enrollmentRequests?.filter(req => req.status === 'rejected') || [];
  const activeUsers = users?.filter(user => user.status === 'in-progress') || [];
  const blockedUsers = users?.filter(user => user.status === 'blocked') || [];

  const stats = [
    {
      title: 'Total Courses',
      value: courses?.length || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All courses in the system',
      trend: '+2 this month'
    },
    {
      title: 'Published Courses',
      value: publishedCourses.length,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Publicly available courses',
      trend: `${courses?.length ? Math.round((publishedCourses.length / courses.length) * 100) : 0}% published`
    },
    {
      title: 'Pending Requests',
      value: pendingEnrollments.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Enrollment requests to review',
      trend: 'Requires attention'
    },
    {
      title: 'Active Users',
      value: activeUsers.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Users with active accounts',
      trend: '+12 this week'
    },
  ];

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Add a new course to the platform',
      icon: Plus,
      href: '/admin/courses/create',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Enrollments',
      description: 'Review enrollment requests',
      icon: FileText,
      href: '/admin/enrollment-requests',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      title: 'Create Blog',
      description: 'Publish new blog posts',
      icon: PenTool,
      href: '/admin/blog/create',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600'
    },
  ];

  const isLoading = coursesLoading || blogsLoading || usersLoading || enrollmentLoading;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
                  Welcome back, {user?.name}! Manage your learning platform
                </p>
              </div>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
                <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                  {user?.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    dispatch(fetchCourses({}));
                    dispatch(fetchBlogs());
                    dispatch(fetchUsers());
                    dispatch(fetchAdmins());
                    dispatch(fetchAllEnrollmentRequests({}));
                  }}
                  className="text-xs sm:text-sm py-2 sm:py-2.5"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} dark:bg-gray-700 flex-shrink-0`}>
                      <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs px-1 sm:px-2 py-0.5 sm:py-1 hidden xs:inline-flex">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {stat.description}
                    </p>
                    <Badge variant="outline" className="text-xs px-1 sm:px-2 py-0.5 sm:py-1 mt-2 xs:hidden">
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    className={`${action.color} text-white w-full h-auto p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 text-sm sm:text-base`}
                    onClick={() => router.push(action.href)}
                  >
                    <action.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                    <div className="text-center min-w-0">
                      <p className="font-medium text-xs sm:text-sm lg:text-base break-words">{action.title}</p>
                      <p className="text-xs opacity-90 line-clamp-2">{action.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 sm:py-3">
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="text-xs sm:text-sm py-2 sm:py-3">
                <span className="hidden sm:inline">Courses</span>
                <span className="sm:hidden">Courses</span>
              </TabsTrigger>
              <TabsTrigger value="enrollments" className="text-xs sm:text-sm py-2 sm:py-3">
                <span className="hidden sm:inline">Enrollments</span>
                <span className="sm:hidden">Enroll</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm py-2 sm:py-3">
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 sm:py-3">
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Enrollment Requests */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Recent Enrollment Requests</span>
                      <span className="sm:hidden">Recent Requests</span>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Latest requests requiring your attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : pendingEnrollments.length > 0 ? (
                      <div className="space-y-3">
                        {pendingEnrollments.slice(0, 5).map((request) => {
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
                          
                          const getUserIdFromRequest = (request: any) => {
                            if (request.user && typeof request.user === 'object' && request.user._id) {
                              return request.user._id;
                            }
                            return request.userId;
                          };
                          
                          const course = courses.find(c => c._id === getCourseIdFromRequest(request));
                          const user = users.find(u => u._id === getUserIdFromRequest(request));
                          return (
                            <div key={request._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={course?.thumbnail || '/placeholder-course.jpg'}
                                    alt={course?.title || 'Course'}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                    {course?.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                    Requested by {user?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => router.push('/admin/enrollment-requests')}
                                className="w-full sm:w-auto text-xs sm:text-sm py-2 sm:py-2.5"
                              >
                                <span className="hidden sm:inline">Review</span>
                                <span className="sm:hidden">Review</span>
                              </Button>
                            </div>
                          );
                        })}
                        <Button 
                          variant="outline" 
                          className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                          onClick={() => router.push('/admin/enrollment-requests')}
                        >
                          <span className="hidden sm:inline">View All Requests</span>
                          <span className="sm:hidden">View All</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                          No pending enrollment requests
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Platform Statistics */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Platform Statistics</span>
                      <span className="sm:hidden">Statistics</span>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Key metrics and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium">Course Completion Rate</span>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            {courses?.length ? Math.round((publishedCourses.length / courses.length) * 100) : 0}%
                          </span>
                        </div>
                        <Progress value={courses?.length ? (publishedCourses.length / courses.length) * 100 : 0} className="h-1.5 sm:h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium">Enrollment Approval Rate</span>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            {enrollmentRequests?.length ? Math.round((approvedEnrollments.length / enrollmentRequests.length) * 100) : 0}%
                          </span>
                        </div>
                        <Progress value={enrollmentRequests?.length ? (approvedEnrollments.length / enrollmentRequests.length) * 100 : 0} className="h-1.5 sm:h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium">Active User Rate</span>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            {users?.length ? Math.round((activeUsers.length / users.length) * 100) : 0}%
                          </span>
                        </div>
                        <Progress value={users?.length ? (activeUsers.length / users.length) * 100 : 0} className="h-1.5 sm:h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {blogs?.length || 0}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Blog Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {admins?.length || 0}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Administrators</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Course Management</span>
                        <span className="sm:hidden">Courses</span>
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Manage all courses in the platform
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => router.push('/admin/courses/create')}
                      className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Create Course</span>
                      <span className="sm:hidden">Create</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {courses?.map((course) => (
                        <Card key={course._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3 sm:p-4">
                            <div className="relative h-24 sm:h-28 lg:h-32 w-full mb-3 rounded-lg overflow-hidden">
                              <Image
                                src={course.thumbnail || '/placeholder-course.jpg'}
                                alt={course.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                                <Badge variant={course.isPublished ? "default" : "secondary"} className="text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                                  {course.isPublished ? 'Published' : 'Draft'}
                                </Badge>
                              </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm sm:text-base">
                              {course.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
                              <span className="truncate">{course.level || 'Beginner'}</span>
                              <span className="flex-shrink-0">{course.duration || '0'} hours</span>
                            </div>
                            <div className="flex flex-col xs:flex-row gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
                                onClick={() => router.push(`/courses/${course._id}`)}
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">View</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
                                onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                                <span className="sm:hidden">Edit</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enrollments Tab */}
            <TabsContent value="enrollments" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Enrollment Management</span>
                        <span className="sm:hidden">Enrollments</span>
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Review and manage enrollment requests
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => router.push('/admin/enrollment-requests')}
                      className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Manage Requests</span>
                      <span className="sm:hidden">Manage</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Card className="bg-yellow-50 dark:bg-yellow-900/20">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {pendingEnrollments.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Pending Requests</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {approvedEnrollments.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Approved</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-900/20">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {rejectedEnrollments.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Rejected</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {pendingEnrollments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Recent Pending Requests</h4>
                      {pendingEnrollments.slice(0, 3).map((request) => {
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
                        
                        const getUserIdFromRequest = (request: any) => {
                          if (request.user && typeof request.user === 'object' && request.user._id) {
                            return request.user._id;
                          }
                          return request.userId;
                        };
                        
                        const course = courses.find(c => c._id === getCourseIdFromRequest(request));
                        const user = users.find(u => u._id === getUserIdFromRequest(request));
                        return (
                          <div key={request._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={course?.thumbnail || '/placeholder-course.jpg'}
                                  alt={course?.title || 'Course'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                  {course?.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                                  Requested by {user?.name} • {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm px-2 py-1 w-fit">
                              Pending
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">User Management</span>
                        <span className="sm:hidden">Users</span>
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Manage user accounts and permissions
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => router.push('/admin/users')}
                      className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Manage Users</span>
                      <span className="sm:hidden">Manage</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Card className="bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {activeUsers.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Active Users</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-900/20">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {blockedUsers.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Blocked Users</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {admins.length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Administrators</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Recent Users</h4>
                    {users?.slice(0, 5).map((user) => (
                      <div key={user._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {user.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={user.status === 'in-progress' ? 'default' : 'destructive'} className="text-xs px-2 py-1">
                            {user.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Platform Analytics</span>
                    <span className="sm:hidden">Analytics</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Detailed insights and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Course Statistics</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Total Courses</span>
                          <span className="font-medium text-sm sm:text-base">{courses?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Published</span>
                          <span className="font-medium text-sm sm:text-base">{publishedCourses.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Draft</span>
                          <span className="font-medium text-sm sm:text-base">{(courses?.length || 0) - publishedCourses.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Average Rating</span>
                          <span className="font-medium text-sm sm:text-base">4.8/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">User Statistics</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Total Users</span>
                          <span className="font-medium text-sm sm:text-base">{users?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Active Users</span>
                          <span className="font-medium text-sm sm:text-base">{activeUsers.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Blocked Users</span>
                          <span className="font-medium text-sm sm:text-base">{blockedUsers.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm">Admins</span>
                          <span className="font-medium text-sm sm:text-base">{admins?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Enrollment Trends</h4>
                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">{enrollmentRequests?.length || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Requests</p>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{approvedEnrollments.length}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Approved</p>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-xl sm:text-2xl font-bold text-red-600">{rejectedEnrollments.length}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Rejected</p>
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

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}
