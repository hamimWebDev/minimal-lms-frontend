'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createCourse } from '@/store/slices/courseSlice';
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
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  Tag,
  User,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import Image from 'next/image';

export default function CreateCoursePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.course);

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

      await dispatch(createCourse(courseData)).unwrap();
      router.push('/admin/courses');
    } catch (err) {
      // Error is handled by the slice
    }
  };

  const isFormValid = formData.title && formData.description && formData.price > 0;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Courses
                </Button>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  Create New Course
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                  Build an engaging learning experience for your students with comprehensive course details
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Basic Information
                  </CardTitle>
                  <CardDescription className="text-base">
                    Essential details that will help students understand your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-sm font-semibold">
                        Course Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Complete Web Development Bootcamp"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="instructor" className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Instructor
                      </Label>
                      <Input
                        id="instructor"
                        placeholder="Course instructor name"
                        value={formData.instructor}
                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold">
                      Course Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn, the course objectives, and what makes this course unique..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      className="text-base resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="price" className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price ($) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="h-12 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="duration" className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Category
                      </Label>
                      <Input
                        id="category"
                        placeholder="e.g., Programming, Design, Business"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="level" className="text-sm font-semibold">
                        Difficulty Level
                      </Label>
                      <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        {formData.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        Publication Status
                      </Label>
                      <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <Switch
                          id="isPublished"
                          checked={formData.isPublished}
                          onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                        />
                        <div className="flex flex-col">
                          <Label htmlFor="isPublished" className="text-sm font-medium">
                            {formData.isPublished ? 'Published' : 'Draft'}
                          </Label>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formData.isPublished ? 'Course will be visible to students' : 'Course is private and not visible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Thumbnail Upload */}
              <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <ImageIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    Course Thumbnail
                  </CardTitle>
                  <CardDescription className="text-base">
                    Upload a high-quality image that represents your course (recommended: 1280x720px)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="thumbnail" className="text-sm font-semibold">
                      Thumbnail Image
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                      <label htmlFor="thumbnail" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    </div>
                  </div>

                  {thumbnailPreview && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Preview</Label>
                      <div className="relative h-64 w-full max-w-md rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                        <Image
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Summary */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    Course Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Title:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formData.title || <span className="text-slate-400">Not set</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Instructor:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formData.instructor || <span className="text-slate-400">Not set</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Price:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${formData.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Duration:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formData.duration ? `${Math.floor(formData.duration / 60)}h ${formData.duration % 60}m` : <span className="text-slate-400">Not set</span>}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Level:</span>
                        <Badge className={getLevelColor(formData.level)}>
                          {formData.level.charAt(0).toUpperCase() + formData.level.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Category:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formData.category || <span className="text-slate-400">Not set</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Status:</span>
                        <Badge variant={formData.isPublished ? "default" : "secondary"}>
                          {formData.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Thumbnail:</span>
                        <Badge variant={thumbnailFile ? "default" : "secondary"}>
                          {thumbnailFile ? 'Uploaded' : 'Not uploaded'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto h-12 px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size={20} />
                      Creating Course...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      Create Course
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
