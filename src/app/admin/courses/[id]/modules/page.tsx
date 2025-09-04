'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchModulesByCourse, createModule, updateModule, deleteModule } from '@/store/slices/moduleSlice';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Play,
  Eye,
  FileText,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CourseModulesPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const dispatch = useAppDispatch();
  
  const { modules, isLoading: modulesLoading } = useAppSelector((state) => state.module);
  const { lectures, isLoading: lecturesLoading } = useAppSelector((state) => state.lecture);
  const { selectedCourse, isLoading: courseLoading } = useAppSelector((state) => state.course);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleNumber: 1
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchModulesByCourse(courseId));
    }
  }, [dispatch, courseId]);

  const handleCreateModule = async () => {
    try {
      await dispatch(createModule({
        ...formData,
        courseId,
        isPublished: false
      })).unwrap();
      setShowCreateDialog(false);
      setFormData({ title: '', description: '', moduleNumber: 1 });
      dispatch(fetchModulesByCourse(courseId));
    } catch (error) {
      // Handle error silently
    }
  };

  const handleEditModule = async () => {
    if (!selectedModule) return;
    
    try {
      await dispatch(updateModule({
        id: selectedModule._id,
        data: formData
      })).unwrap();
      setShowEditDialog(false);
      setSelectedModule(null);
      setFormData({ title: '', description: '', moduleNumber: 1 });
      dispatch(fetchModulesByCourse(courseId));
    } catch (error) {
      // Handle error silently
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Module',
      message: 'Are you sure you want to delete this module? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await dispatch(deleteModule(moduleId)).unwrap();
          dispatch(fetchModulesByCourse(courseId));
        } catch (error) {
          // Handle error silently
        }
      }
    });
  };

  const openEditDialog = (module: any) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      description: module.description || '',
      moduleNumber: typeof module.moduleNumber === 'number' ? module.moduleNumber : 1
    });
    setShowEditDialog(true);
  };

  const isLoading = modulesLoading || courseLoading;

  if (isLoading) {
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

  return (
    <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Link href="/admin/courses" className="text-blue-600 hover:text-blue-800 text-sm">
                    Courses
                  </Link>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm truncate">
                    {selectedCourse?.title || 'Course'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Course Modules
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                  Manage modules for "{selectedCourse?.title}"
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => router.push(`/admin/courses/${courseId}`)}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">View Course</span>
                  <span className="sm:hidden">View</span>
                </Button>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Module</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md mx-4 sm:mx-0">
                    <DialogHeader>
                      <DialogTitle>Create New Module</DialogTitle>
                      <DialogDescription>
                        Add a new module to this course
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Module Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter module title"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter module description"
                          rows={3}
                          className="w-full resize-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="moduleNumber">Module Number</Label>
                        <Input
                          id="moduleNumber"
                          type="number"
                          value={formData.moduleNumber}
                          onChange={(e) => setFormData({ ...formData, moduleNumber: parseInt(e.target.value) })}
                          min="1"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleCreateModule} className="flex-1 w-full sm:w-auto">
                          Create Module
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateDialog(false)}
                          className="flex-1 w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Course Stats */}
            {selectedCourse && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Total Modules</p>
                        <p className="text-lg sm:text-xl font-bold">{modules?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Total Lectures</p>
                        <p className="text-lg sm:text-xl font-bold">
                          {modules?.reduce((total, module) => {
                            const count = module.lecturesCount;
                            return total + (typeof count === 'number' ? count : 0);
                          }, 0) || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Total Duration</p>
                        <p className="text-lg sm:text-xl font-bold">
                          {modules?.reduce((total, module) => {
                            const duration = module.totalDuration;
                            return total + (typeof duration === 'number' ? duration : 0);
                          }, 0) || 0} min
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Published</p>
                        <p className="text-lg sm:text-xl font-bold">
                          {modules?.filter(m => m.isPublished).length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Modules List */}
            <div className="space-y-3 sm:space-y-4">
              {modules?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No modules yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                      Create your first module to get started
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)} size="sm" className="sm:size-default">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Module
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                modules?.map((module) => (
                  <Card key={module._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <Badge variant="outline" className="text-xs sm:text-sm">
                              Module {(() => {
                                const number = module.moduleNumber;
                                return typeof number === 'number' ? number : 0;
                              })()}
                            </Badge>
                            {module.isPublished ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs sm:text-sm">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600 text-xs sm:text-sm">
                                Draft
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                              {module.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Play className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{(() => {
                                const count = module.lecturesCount;
                                return typeof count === 'number' ? count : 0;
                              })()} lectures</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{(() => {
                                const duration = module.totalDuration;
                                return typeof duration === 'number' ? duration : 0;
                              })()} min</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:ml-4 lg:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/courses/${courseId}/modules/${module._id}/lectures`)}
                            className="w-full sm:w-auto"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Create Lectures</span>
                            <span className="sm:hidden">Lectures</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(module)}
                            className="w-full sm:w-auto"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module._id)}
                            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Edit Module Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-md mx-4 sm:mx-0">
                <DialogHeader>
                  <DialogTitle>Edit Module</DialogTitle>
                  <DialogDescription>
                    Update module information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Module Title</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter module title"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter module description"
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-moduleNumber">Module Number</Label>
                    <Input
                      id="edit-moduleNumber"
                      type="number"
                      value={formData.moduleNumber}
                      onChange={(e) => setFormData({ ...formData, moduleNumber: parseInt(e.target.value) })}
                      min="1"
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleEditModule} className="flex-1 w-full sm:w-auto">
                      Update Module
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEditDialog(false)}
                      className="flex-1 w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Delete"
          variant="destructive"
        />
      </MainLayout>
    </ProtectedRoute>
  );
}
