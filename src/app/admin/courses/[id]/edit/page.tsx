'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourseById, updateCourse } from '@/store/slices/courseSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react';
import Image from 'next/image';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentCourse, isLoading, error } = useAppSelector((state) => state.course);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    instructor: '',
    duration: 0,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    isPublished: false,
    thumbnail: ''
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const courseId = params.id as string;

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }
  }, [dispatch, courseId]);

  useEffect(() => {
    if (currentCourse) {
      setFormData({
        title: currentCourse.title,
        description: currentCourse.description,
        price: currentCourse.price,
        instructor: currentCourse.instructor || '',
        duration: currentCourse.duration || 0,
        level: currentCourse.level || 'beginner',
        category: currentCourse.category || '',
        isPublished: currentCourse.isPublished || false,
        thumbnail: currentCourse.thumbnail
      });
      setThumbnailPreview(currentCourse.thumbnail);
    }
  }, [currentCourse]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const courseData = new FormData();
      courseData.append('title', formData.title);
      courseData.append('description', formData.description);
      courseData.append('price', formData.price.toString());
      courseData.append('instructor', formData.instructor);
      courseData.append('duration', formData.duration.toString());
      courseData.append('level', formData.level);
      courseData.append('category', formData.category);
      courseData.append('isPublished', formData.isPublished.toString());
      
      if (thumbnailFile) {
        courseData.append('thumbnail', thumbnailFile);
      }

      await dispatch(updateCourse({ id: courseId, data: courseData })).unwrap();
      router.push('/admin/courses');
    } catch (err) {
      // Error is handled by the slice
    }
  };

  const isFormValid = formData.title && formData.description && formData.price > 0;

  if (isLoading && !currentCourse) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner size={48} />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!currentCourse) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
        <MainLayout>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Course not found</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit Course
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Update course information and settings
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Update essential details about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter course title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      <Input
                        id="instructor"
                        placeholder="Course instructor name"
                        value={formData.instructor}
                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn in this course..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Programming, Design"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Difficulty Level</Label>
                      <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isPublished">Publish Status</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPublished"
                          checked={formData.isPublished}
                          onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                        />
                        <Label htmlFor="isPublished">
                          {formData.isPublished ? 'Published' : 'Draft'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Thumbnail Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Course Thumbnail
                  </CardTitle>
                  <CardDescription>
                    Update the course thumbnail image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </div>

                  {thumbnailPreview && (
                    <div className="space-y-2">
                      <Label>Current Thumbnail</Label>
                      <div className="relative h-48 w-full max-w-xs rounded-lg overflow-hidden border">
                        <Image
                          src={thumbnailPreview}
                          alt="Course thumbnail"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Course Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{currentCourse.modulesCount || 0}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Modules</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{currentCourse.totalDuration || 0}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Minutes</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">{currentCourse.isPublished ? 'Published' : 'Draft'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Status</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-lg font-bold text-orange-600">${currentCourse.price}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Price</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Updated Course Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Title:</span>
                        <span className="font-medium">{formData.title || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Instructor:</span>
                        <span className="font-medium">{formData.instructor || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Price:</span>
                        <span className="font-medium">${formData.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Duration:</span>
                        <span className="font-medium">
                          {formData.duration ? `${Math.floor(formData.duration / 60)}h ${formData.duration % 60}m` : 'Not set'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Level:</span>
                        <span className="font-medium capitalize">{formData.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Category:</span>
                        <span className="font-medium">{formData.category || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Status:</span>
                        <span className="font-medium">
                          {formData.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Thumbnail:</span>
                        <span className="font-medium">
                          {thumbnailFile ? 'New uploaded' : 'Current'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/admin/courses/${courseId}/modules`)}
                  >
                    Manage Modules
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size={16} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Course
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
