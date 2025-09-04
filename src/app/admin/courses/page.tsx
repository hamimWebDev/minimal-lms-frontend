'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses } from '@/store/slices/courseSlice';
import { fetchModulesByCourse } from '@/store/slices/moduleSlice';
import { fetchLectures } from '@/store/slices/lectureSlice';
import { Course } from '@/types';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  XCircle
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
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Published
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  const getLevelBadge = (level?: string) => {
    const levelColors = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="outline" className={levelColors[level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}>
        {level || 'Not Set'}
      </Badge>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Course Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage all courses, modules, and lectures
                  </p>
                </div>
                <Button onClick={() => router.push('/admin/courses/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Courses</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses?.length || 0}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Published</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {courses?.filter(c => c.isPublished).length || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Modules</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{modules?.length || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Lectures</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{lectures?.length || 0}</p>
                    </div>
                    <Video className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Courses Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size={48} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
                        <Image
                          src={course.thumbnail || '/placeholder-course.jpg'}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(course.isPublished || false)}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {course.title}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <User className="h-4 w-4" />
                            <span>{course.instructor || 'No instructor'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <DollarSign className="h-4 w-4" />
                            <span>${course.price}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <BarChart3 className="h-4 w-4" />
                            <span>{course.modulesCount || 0} modules</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          {getLevelBadge(course.level)}
                          {course.category && (
                            <Badge variant="outline">
                              {course.category}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/admin/courses/${course._id}/modules`)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Create Modules
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredCourses.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No courses found matching your criteria
                </p>
                <Button onClick={() => router.push('/admin/courses/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
