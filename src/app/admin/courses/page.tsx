'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses, deleteCourse } from '@/store/slices/courseSlice';
import { fetchModulesByCourse } from '@/store/slices/moduleSlice';
import { fetchLectures } from '@/store/slices/lectureSlice';
import { Course } from '@/types';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Plus, 
  Edit, 
  Eye, 
  BookOpen, 
  Play, 
  Search,
  Filter,
  Clock,
  User,
  DollarSign,
  BarChart3,
  FileText,
  Video,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Calendar,
  Star,
  TrendingUp,
  MoreHorizontal,
  Grid3X3,
  List,
  Settings,
  Download,
  Share2,
  Heart
} from 'lucide-react';
import Image from 'next/image';

export default function AdminCoursesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { courses, isLoading: coursesLoading } = useAppSelector((state) => state.course);
  const { modules, isLoading: modulesLoading } = useAppSelector((state) => state.module);
  const { lectures, isLoading: lecturesLoading } = useAppSelector((state) => state.lecture);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchCourses({}));
  }, [dispatch]);

  useEffect(() => {
    if (selectedCourse) {
      dispatch(fetchModulesByCourse(selectedCourse._id));
    }
  }, [dispatch, selectedCourse]);

  useEffect(() => {
    if (modules.length > 0) {
      dispatch(fetchLectures({ moduleId: modules[0]._id }));
    }
  }, [dispatch, modules]);

  const isLoading = coursesLoading || modulesLoading || lecturesLoading;

  // Filter courses based on search and filters
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'published' && course.isPublished) ||
      (selectedStatus === 'draft' && !course.isPublished);

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  }) || [];

  // Get unique categories and levels for filters
  const categories = [...new Set(courses?.map(course => course.category).filter(Boolean) || [])];
  const levels = ['beginner', 'intermediate', 'advanced'];

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Published
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
        <XCircle className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  const getLevelBadge = (level?: string) => {
    const levelColors = {
      beginner: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200',
      intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200'
    };
    
    return (
      <Badge variant="outline" className={levelColors[level as keyof typeof levelColors] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}>
        {level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Not Set'}
      </Badge>
    );
  };

  const getApprovedEnrollmentCount = (course: Course) => {
    const count = course.approvedEnrollmentCount;
    if (typeof count === 'number') return count;
    if (count && typeof count === 'object' && 'count' in count) return (count as any).count;
    return 0;
  };

  const getTotalDuration = (course: Course) => {
    const duration = course.totalDuration;
    if (typeof duration === 'number') return duration;
    if (duration && typeof duration === 'object' && 'totalDuration' in duration) return (duration as any).totalDuration;
    return course.duration || 0;
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteCourse(courseToDelete._id)).unwrap();
      setCourseToDelete(null);
    } catch (error) {
      console.error('Failed to delete course:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                        Course Management
                      </h1>
                      <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
                        Manage your learning content with powerful insights
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="flex items-center gap-2"
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                    {viewMode === 'grid' ? 'List View' : 'Grid View'}
                  </Button>
                  <Button 
                    onClick={() => router.push('/admin/courses/create')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-white dark:bg-slate-700"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-11 bg-white dark:bg-slate-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category || ''}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="h-11 bg-white dark:bg-slate-700">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-11 bg-white dark:bg-slate-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedLevel('all');
                      setSelectedStatus('all');
                    }}
                    className="h-11 bg-white dark:bg-slate-700"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <LoadingSpinner size={48} />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">Loading your courses...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we fetch your data</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredCourses.map((course) => (
                  <Card key={course._id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
                    <div className="relative">
                      {/* Course Image */}
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={course.thumbnail || '/placeholder-course.jpg'}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(course.isPublished || false)}
                        </div>
                        
                        {/* Student Count Badge */}
                        {getApprovedEnrollmentCount(course) > 0 && (
                          <div className="absolute top-4 left-4">
                            <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200">
                              <User className="h-3 w-3 mr-1" />
                              {getApprovedEnrollmentCount(course)} students
                            </Badge>
                          </div>
                        )}
                        
                        {/* Course Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="font-bold text-white text-xl line-clamp-2">
                            {course.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Course Description */}
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Instructor</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                              {course.instructor || 'No instructor'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Duration</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                              {formatDuration(getTotalDuration(course))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Price</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                              ${course.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Modules</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                              {course.modulesCount || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Level and Category Badges */}
                      <div className="flex items-center gap-2 mb-6">
                        {getLevelBadge(course.level)}
                        {course.category && (
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {course.category}
                          </Badge>
                        )}
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 mb-6" />

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 h-10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 h-10 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          onClick={() => router.push(`/admin/courses/${course._id}/modules`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Modules
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setCourseToDelete(course)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredCourses.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="p-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  No courses found
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto text-lg">
                  No courses match your current filters. Try adjusting your search criteria or create your first course to get started.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedLevel('all');
                      setSelectedStatus('all');
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button 
                    onClick={() => router.push('/admin/courses/create')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                </div>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div style={{ display: 'none' }} />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete Course
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone and will permanently remove the course and all its associated modules and lectures.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCourseToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCourse}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size={16} />
                        Deleting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Course
                      </div>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
