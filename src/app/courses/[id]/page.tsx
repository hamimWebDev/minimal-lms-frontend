'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { fetchModulesByCourse } from '@/store/slices/moduleSlice';
import { fetchLectures } from '@/store/slices/lectureSlice';
import { checkEnrollmentStatus } from '@/store/slices/enrollmentSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertModal } from '@/components/ui/alert-modal';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnrollmentStatus } from '@/components/enrollment/enrollment-status';
import { EnrollmentRequestForm } from '@/components/enrollment/enrollment-request-form';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  Download,
  Share2,
  Heart,
  ArrowLeft,
  Award,
  Globe,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  FileText,
  Video,
  Lock,
  Unlock,
  ChevronRight,
  Bookmark,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentCourse, isLoading } = useAppSelector((state) => state.course);
  const { modules, isLoading: modulesLoading } = useAppSelector((state) => state.module);
  const { lectures, isLoading: lecturesLoading } = useAppSelector((state) => state.lecture);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { enrollmentStatus } = useAppSelector((state) => state.enrollment);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const courseId = params.id as string;

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchModulesByCourse(courseId));
      if (isAuthenticated) {
        dispatch(checkEnrollmentStatus(courseId));
      }
    }
  }, [dispatch, courseId, isAuthenticated]);

  useEffect(() => {
    if (modules.length > 0) {
      // Fetch lectures for all modules
      modules.forEach(module => {
        dispatch(fetchLectures({ moduleId: module._id }));
      });
    }
  }, [dispatch, modules]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
              <LoadingSpinner size={48} />
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading course details...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!currentCourse) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Course Not Found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The course you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => router.push('/courses')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTotalDuration = () => {
    return lectures.reduce((total, lecture) => total + (lecture.duration || 0), 0);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Navigation Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </div>
        </div>

        {/* Course Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {currentCourse.level || 'All Levels'}
                    </Badge>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                      {currentCourse.category || 'General'}
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    {currentCourse.title}
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentCourse.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{formatDuration(currentCourse.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium">1,234 students</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">4.8 (2,345 reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Updated recently</span>
                    </div>
                  </div>

                  {currentCourse.instructor && (
                    <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {currentCourse.instructor.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Created by</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{currentCourse.instructor}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
                      <Image
                        src={currentCourse.thumbnail || '/placeholder-course.jpg'}
                        alt={currentCourse.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {formatPrice(currentCourse.price)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">One-time payment</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isAuthenticated ? (
                      <EnrollmentStatus 
                        courseId={courseId}
                        onRequestAccess={() => setShowEnrollmentForm(true)}
                        onStartLearning={() => {
                          if (modules.length === 0) {
                            showAlert(
                              'No Content Available',
                              'This course doesn\'t have any content yet. Please contact the instructor.',
                              'warning'
                            );
                            return;
                          }
                          
                          const firstLecture = [...lectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
                          router.push(`/courses/${courseId}/lecture/${firstLecture._id}`);
                        }}
                      />
                    ) : (
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" size="lg">
                        <Play className="mr-2 h-4 w-4" />
                        Sign in to Enroll
                      </Button>
                    )}

                    {showEnrollmentForm && (
                      <Dialog open={showEnrollmentForm} onOpenChange={setShowEnrollmentForm}>
                        <DialogContent className="max-w-md">
                          <DialogTitle className="sr-only">Enrollment Request</DialogTitle>
                          <EnrollmentRequestForm
                            courseId={courseId}
                            courseTitle={currentCourse?.title || ''}
                            onSuccess={() => setShowEnrollmentForm(false)}
                            onCancel={() => setShowEnrollmentForm(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Button>
                      <Button variant="outline" className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Access on mobile and TV</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>30-Day Money-back guarantee</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* What You'll Learn */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Target className="h-6 w-6 text-blue-600" />
                    What you'll learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Understand the fundamentals of the subject</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Apply concepts to real-world scenarios</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Build practical projects from scratch</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Master advanced techniques and best practices</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{modules.length}</div>
                    <div className="text-sm opacity-90">Modules</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-6 text-center">
                    <Video className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{lectures.length}</div>
                    <div className="text-sm opacity-90">Lectures</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{formatDuration(getTotalDuration())}</div>
                    <div className="text-sm opacity-90">Total Duration</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">Certificate</div>
                    <div className="text-sm opacity-90">Included</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                    Course Content
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {modules.length} sections • {lectures.length} lectures • {formatDuration(getTotalDuration())}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {modulesLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner size={48} />
                      <p className="mt-4 text-gray-600 dark:text-gray-300">Loading course content...</p>
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Content Available</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        This course doesn't have any modules or lectures yet. Content will be added soon.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modules.map((module, index) => {
                        const moduleLectures = lectures.filter(lecture => lecture.moduleId === module._id);
                        const sortedLectures = [...moduleLectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        
                        return (
                          <Card key={module._id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{module.title}</CardTitle>
                                    {module.description && (
                                      <CardDescription className="mt-1">{module.description}</CardDescription>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {moduleLectures.length} lecture{moduleLectures.length !== 1 ? 's' : ''}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDuration(moduleLectures.reduce((total, lecture) => total + (lecture.duration || 0), 0))}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            {sortedLectures.length > 0 && (
                              <CardContent className="pt-0">
                                <div className="space-y-2">
                                  {sortedLectures.map((lecture, lectureIndex) => (
                                    <div
                                      key={lecture._id}
                                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                        enrollmentStatus?.status === 'approved' 
                                          ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600' 
                                          : 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                                      }`}
                                      onClick={() => {
                                        if (enrollmentStatus?.status === 'approved') {
                                          router.push(`/courses/${courseId}/lecture/${lecture._id}`);
                                        } else {
                                          showAlert(
                                            'Access Required',
                                            'You need to be enrolled in this course to access lectures.',
                                            'info'
                                          );
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        {enrollmentStatus?.status === 'approved' ? (
                                          <Play className="h-4 w-4 text-blue-600" />
                                        ) : (
                                          <Lock className="h-4 w-4 text-gray-400" />
                                        )}
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {lectureIndex + 1}. {lecture.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                          {formatDuration(lecture.duration)}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Student Reviews
                  </CardTitle>
                  <CardDescription>
                    See what other students have to say about this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-10 w-10 text-white fill-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Be the first to review this course and share your experience!
                    </p>
                    <Button variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-900/20">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Write a Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </MainLayout>
  );
}
