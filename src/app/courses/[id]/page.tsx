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
  ArrowLeft
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
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size={48} />
        </div>
      </MainLayout>
    );
  }

  if (!currentCourse) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Course not found</p>
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{currentCourse.level || 'All Levels'}</Badge>
                    <Badge variant="outline">{currentCourse.category || 'General'}</Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentCourse.title}
                  </h1>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {currentCourse.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(currentCourse.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>1,234 students enrolled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8 (2,345 reviews)</span>
                    </div>
                  </div>

                  {currentCourse.instructor && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Instructor:</span>
                      <span className="font-medium">{currentCourse.instructor}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <div className="relative h-48 w-full mb-4">
                      <Image
                        src={currentCourse.thumbnail || '/placeholder-course.jpg'}
                        alt={currentCourse.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(currentCourse.price)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                                         {isAuthenticated ? (
                       <EnrollmentStatus 
                         courseId={courseId}
                         onRequestAccess={() => setShowEnrollmentForm(true)}
                                                 onStartLearning={() => {
                          // Check if course has modules and lectures
                          if (modules.length === 0) {
                            showAlert(
                              'No Content Available',
                              'This course doesn\'t have any content yet. Please contact the instructor.',
                              'warning'
                            );
                            return;
                          }
                          
                          // Navigate to first lecture if available
                          const firstLecture = [...lectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
                          router.push(`/courses/${courseId}/lecture/${firstLecture._id}`);
                        }}
                       />
                     ) : (
                      <Button className="w-full" size="lg" onClick={() => router.push('/auth/login')}>
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
                      <Button variant="outline" className="flex-1">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>✓ Full lifetime access</p>
                      <p>✓ Access on mobile and TV</p>
                      <p>✓ Certificate of completion</p>
                      <p>✓ 30-Day Money-back guarantee</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Understand the fundamentals of the subject</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Apply concepts to real-world scenarios</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Build practical projects from scratch</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Master advanced techniques and best practices</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>
                    {modules.length} sections • {lectures.length} lectures • {formatDuration(currentCourse.duration)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {modulesLoading ? (
                    <LoadingSpinner />
                  ) : modules.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Content Available</h3>
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
                          <div key={module._id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {index + 1}. {module.title}
                              </h3>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {moduleLectures.length} lecture{moduleLectures.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {module.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {module.description}
                              </p>
                            )}
                            {sortedLectures.length > 0 && (
                              <div className="space-y-2">
                                {sortedLectures.map((lecture, lectureIndex) => (
                                  <div
                                    key={lecture._id}
                                    className={`flex items-center justify-between p-2 rounded transition-colors ${
                                      enrollmentStatus?.status === 'approved' 
                                        ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' 
                                        : 'opacity-60 cursor-not-allowed'
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
                                    <div className="flex items-center gap-2">
                                      <Play className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {lectureIndex + 1}. {lecture.title}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDuration(lecture.duration)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                  <CardDescription>
                    See what other students have to say about this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No reviews yet. Be the first to review this course!
                    </p>
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
