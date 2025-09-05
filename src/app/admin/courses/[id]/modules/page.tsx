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
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    moduleNumber: ''
  });
  const [isCreating, setIsCreating] = useState(false);
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

  const validateForm = () => {
    const errors = {
      title: '',
      description: '',
      moduleNumber: ''
    };

    if (!formData.title.trim()) {
      errors.title = 'Module title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Module title must be at least 3 characters';
    }

    if (formData.moduleNumber < 1) {
      errors.moduleNumber = 'Module number must be at least 1';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleCreateModule = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      await dispatch(createModule({
        ...formData,
        courseId,
        isPublished: false
      })).unwrap();
      setShowCreateDialog(false);
      setFormData({ title: '', description: '', moduleNumber: 1 });
      setFormErrors({ title: '', description: '', moduleNumber: '' });
      dispatch(fetchModulesByCourse(courseId));
    } catch (error) {
      // Handle error silently
    } finally {
      setIsCreating(false);
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Course Modules
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-words">
                  Manage modules for "{selectedCourse?.title}"
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full xs:w-auto lg:w-auto">
                <Button
                  onClick={() => router.push(`/admin/courses/${courseId}`)}
                  variant="outline"
                  size="sm"
                  className="w-full xs:w-auto text-sm sm:text-base py-2 sm:py-2.5"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">View Course</span>
                  <span className="sm:hidden">View</span>
                </Button>
                <Dialog open={showCreateDialog} onOpenChange={(open) => {
                  setShowCreateDialog(open);
                  if (!open) {
                    setFormData({ title: '', description: '', moduleNumber: 1 });
                    setFormErrors({ title: '', description: '', moduleNumber: '' });
                    setIsCreating(false);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="w-full xs:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Module</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-lg mx-auto p-0 overflow-hidden sm:w-full">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6">
                      <DialogHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                              Create New Module
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base break-words">
                              Add a new module to "{selectedCourse?.title}"
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Module Title *
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => {
                              setFormData({ ...formData, title: e.target.value });
                              if (formErrors.title) {
                                setFormErrors({ ...formErrors, title: '' });
                              }
                            }}
                            placeholder="e.g., Introduction to React"
                            className={`w-full transition-all duration-200 text-sm sm:text-base ${
                              formErrors.title 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            disabled={isCreating}
                          />
                          {formErrors.title && (
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="break-words">{formErrors.title}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of what this module covers..."
                            rows={3}
                            className="w-full resize-none transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                            disabled={isCreating}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            Optional: Help students understand what they'll learn in this module
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="moduleNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Module Number *
                          </Label>
                          <Input
                            id="moduleNumber"
                            type="number"
                            value={formData.moduleNumber}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setFormData({ ...formData, moduleNumber: value });
                              if (formErrors.moduleNumber) {
                                setFormErrors({ ...formErrors, moduleNumber: '' });
                              }
                            }}
                            min="1"
                            className={`w-full transition-all duration-200 text-sm sm:text-base ${
                              formErrors.moduleNumber 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            disabled={isCreating}
                          />
                          {formErrors.moduleNumber && (
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="break-words">{formErrors.moduleNumber}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            The order in which this module appears in the course
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          onClick={handleCreateModule} 
                          disabled={isCreating}
                          className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2 sm:py-2.5"
                        >
                          {isCreating ? (
                            <>
                              <LoadingSpinner size={14} className="mr-2 sm:mr-2" />
                              <span className="hidden sm:inline">Creating Module...</span>
                              <span className="sm:hidden">Creating...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Create Module</span>
                              <span className="sm:hidden">Create</span>
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateDialog(false)}
                          disabled={isCreating}
                          className="w-full sm:flex-1 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-sm sm:text-base py-2 sm:py-2.5"
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
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                    <Button 
                      onClick={() => setShowCreateDialog(true)} 
                      size="sm" 
                      className="sm:size-default bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
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
                        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 lg:ml-4 lg:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/courses/${courseId}/modules/${module._id}/lectures`)}
                            className="w-full xs:w-auto text-xs sm:text-sm py-2 sm:py-2.5"
                          >
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Create Lectures</span>
                            <span className="sm:hidden">Lectures</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(module)}
                            className="w-full xs:w-auto text-xs sm:text-sm py-2 sm:py-2.5"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module._id)}
                            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full xs:w-auto text-xs sm:text-sm py-2 sm:py-2.5"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
              <DialogContent className="w-[95vw] max-w-md mx-auto p-0 overflow-hidden sm:w-full">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6">
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                        <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                          Edit Module
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base break-words">
                          Update module information
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Module Title *
                      </Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter module title"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter module description"
                        rows={3}
                        className="w-full resize-none text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-moduleNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Module Number *
                      </Label>
                      <Input
                        id="edit-moduleNumber"
                        type="number"
                        value={formData.moduleNumber}
                        onChange={(e) => setFormData({ ...formData, moduleNumber: parseInt(e.target.value) })}
                        min="1"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      onClick={handleEditModule} 
                      className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Update Module</span>
                      <span className="sm:hidden">Update</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEditDialog(false)}
                      className="w-full sm:flex-1 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-sm sm:text-base py-2 sm:py-2.5"
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
