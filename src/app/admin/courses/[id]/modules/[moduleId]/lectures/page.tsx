'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchLecturesByModule, createLecture, updateLecture, deleteLecture } from '@/store/slices/lectureSlice';
import { fetchModuleById } from '@/store/slices/moduleSlice';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertModal } from '@/components/ui/alert-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  FileText,
  Video,
  Clock,
  ChevronRight,
  Eye,
  Upload,
  Download,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ModuleLecturesPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const dispatch = useAppDispatch();

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };
  
  const { lectures, isLoading: lecturesLoading } = useAppSelector((state) => state.lecture);
  const { currentModule, isLoading: moduleLoading } = useAppSelector((state) => state.module);
  const { selectedCourse, isLoading: courseLoading } = useAppSelector((state) => state.course);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    order: 1,
    isPublished: false
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    duration: '',
    order: '',
    pdfFiles: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
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
    }
    if (moduleId) {
      dispatch(fetchModuleById(moduleId));
      dispatch(fetchLecturesByModule(moduleId));
    }
  }, [dispatch, courseId, moduleId]);

  const validateForm = () => {
    const errors = {
      title: '',
      duration: '',
      order: '',
      pdfFiles: ''
    };

    if (!formData.title.trim()) {
      errors.title = 'Lecture title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Lecture title must be at least 3 characters';
    }

    if (formData.duration && parseInt(formData.duration) < 0) {
      errors.duration = 'Duration cannot be negative';
    }

    if (formData.order < 1) {
      errors.order = 'Order must be at least 1';
    }

    if (pdfFiles.length === 0) {
      errors.pdfFiles = 'At least one PDF note is required';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleCreateLecture = async () => {
    if (!validateForm()) return;

    // Debug authentication
    console.log('Auth state:', { user, isAuthenticated });
    console.log('Access token:', localStorage.getItem('accessToken'));

    setIsCreating(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('duration', formData.duration || '0');
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('isPublished', formData.isPublished.toString());
      formDataToSend.append('moduleId', moduleId);

      if (videoFile) {
        formDataToSend.append('videoFile', videoFile);
      }

      // Always append at least one PDF file
      if (pdfFiles.length > 0) {
        pdfFiles.forEach((file) => {
          formDataToSend.append('pdfNotes', file);
        });
      }

      await dispatch(createLecture(formDataToSend)).unwrap();
      setShowCreateDialog(false);
      setFormData({ title: '', duration: '', order: 1, isPublished: false });
      setFormErrors({ title: '', duration: '', order: '', pdfFiles: '' });
      setVideoFile(null);
      setPdfFiles([]);
      dispatch(fetchLecturesByModule(moduleId));
    } catch (error: any) {
      console.error('Error creating lecture:', error);
      showAlert('Error', error.response?.data?.message || 'Failed to create lecture', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditLecture = async () => {
    if (!selectedLecture) return;
    
    // Validate required fields
    if (!formData.title.trim()) {
      showAlert('Validation Error', 'Lecture title is required', 'error');
      return;
    }
    
    // For editing, we need either existing PDF notes or new uploaded files
    const hasExistingPdfNotes = selectedLecture.pdfNotes && selectedLecture.pdfNotes.length > 0;
    const hasNewPdfFiles = pdfFiles.length > 0;
    
    if (!hasExistingPdfNotes && !hasNewPdfFiles) {
      showAlert('Validation Error', 'At least one PDF note is required', 'error');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('duration', formData.duration || '0');
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('isPublished', formData.isPublished.toString());

      if (videoFile) {
        formDataToSend.append('videoFile', videoFile);
      }

      // Always append at least one PDF file
      if (pdfFiles.length > 0) {
        pdfFiles.forEach((file) => {
          formDataToSend.append('pdfNotes', file);
        });
      }

      await dispatch(updateLecture({
        id: selectedLecture._id,
        data: formDataToSend
      })).unwrap();
      setShowEditDialog(false);
      setSelectedLecture(null);
      setFormData({ title: '', duration: '', order: 1, isPublished: false });
      setVideoFile(null);
      setPdfFiles([]);
      dispatch(fetchLecturesByModule(moduleId));
    } catch (error) {
      // Handle error silently
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    showConfirmation(
      'Delete Lecture',
      'Are you sure you want to delete this lecture? This action cannot be undone.',
      async () => {
        try {
          await dispatch(deleteLecture(lectureId)).unwrap();
          dispatch(fetchLecturesByModule(moduleId));
        } catch (error) {
          // Handle error silently
        }
      }
    );
  };

  const openEditDialog = (lecture: any) => {
    setSelectedLecture(lecture);
    setFormData({
      title: lecture.title,
      duration: lecture.duration || 0,
      order: lecture.order,
      isPublished: lecture.isPublished || false
    });
    setVideoFile(null);
    setPdfFiles([]);
    setShowEditDialog(true);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handlePdfFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPdfFiles(files);
    }
  };

  const isLoading = lecturesLoading || moduleLoading || courseLoading;

  if (isLoading) {
    return (
      <AdminRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner size={48} />
          </div>
        </MainLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
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
                  <Link href={`/admin/courses/${courseId}/modules`} className="text-blue-600 hover:text-blue-800 text-sm truncate">
                    {selectedCourse?.title || 'Course'}
                  </Link>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm truncate">
                    {currentModule?.title || 'Module'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Module Lectures
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-words">
                  Manage lectures for "{currentModule?.title}"
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full xs:w-auto lg:w-auto">
                <Button
                  onClick={() => router.push(`/admin/courses/${courseId}/modules`)}
                  variant="outline"
                  size="sm"
                  className="w-full xs:w-auto text-sm sm:text-base py-2 sm:py-2.5"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Modules</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <Dialog open={showCreateDialog} onOpenChange={(open) => {
                  setShowCreateDialog(open);
                  if (!open) {
                    setFormData({ title: '', duration: '', order: 1, isPublished: false });
                    setFormErrors({ title: '', duration: '', order: '', pdfFiles: '' });
                    setVideoFile(null);
                    setPdfFiles([]);
                    setIsCreating(false);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="w-full xs:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Lecture</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-lg mx-auto p-0 overflow-hidden sm:w-full">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6">
                      <DialogHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                              Create New Lecture
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base break-words">
                              Add a new lecture to "{currentModule?.title}"
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Lecture Title *
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
                            placeholder="e.g., Introduction to React Hooks"
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
                          <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Duration (minutes)
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => {
                              setFormData({ ...formData, duration: e.target.value });
                              if (formErrors.duration) {
                                setFormErrors({ ...formErrors, duration: '' });
                              }
                            }}
                            min="0"
                            className={`w-full transition-all duration-200 text-sm sm:text-base ${
                              formErrors.duration 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            disabled={isCreating}
                          />
                          {formErrors.duration && (
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="break-words">{formErrors.duration}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            Optional: Estimated duration of the lecture
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="order" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Lecture Order *
                          </Label>
                          <Input
                            id="order"
                            type="number"
                            value={formData.order}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setFormData({ ...formData, order: value });
                              if (formErrors.order) {
                                setFormErrors({ ...formErrors, order: '' });
                              }
                            }}
                            min="1"
                            className={`w-full transition-all duration-200 text-sm sm:text-base ${
                              formErrors.order 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            disabled={isCreating}
                          />
                          {formErrors.order && (
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="break-words">{formErrors.order}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            The order in which this lecture appears in the module
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPublished"
                              checked={formData.isPublished}
                              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                              className="rounded"
                              disabled={isCreating}
                            />
                            <Label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Publish lecture
                            </Label>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            Make this lecture available to students
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="videoFile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Video File (Optional)
                          </Label>
                          <Input
                            id="videoFile"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            className="w-full text-sm sm:text-base"
                            disabled={isCreating}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            Upload a video file for this lecture (MP4, AVI, MOV, etc.)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pdfFiles" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            PDF Notes *
                          </Label>
                          <Input
                            id="pdfFiles"
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handlePdfFilesChange}
                            className={`w-full transition-all duration-200 text-sm sm:text-base ${
                              formErrors.pdfFiles 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            disabled={isCreating}
                          />
                          {formErrors.pdfFiles && (
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="break-words">{formErrors.pdfFiles}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            Upload PDF notes for this lecture (at least one required)
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          onClick={handleCreateLecture} 
                          disabled={isCreating}
                          className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2 sm:py-2.5"
                        >
                          {isCreating ? (
                            <>
                              <LoadingSpinner size={14} className="mr-2 sm:mr-2" />
                              <span className="hidden sm:inline">Creating Lecture...</span>
                              <span className="sm:hidden">Creating...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Create Lecture</span>
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

            {/* Module Stats */}
            {currentModule && (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Total Lectures</p>
                        <p className="text-lg sm:text-xl font-bold">{lectures?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Total Duration</p>
                        <p className="text-lg sm:text-xl font-bold">
                          {lectures?.reduce((total, lecture) => total + (lecture.duration || 0), 0) || 0} min
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">With Video</p>
                        <p className="text-lg sm:text-xl font-bold">
                          {lectures?.filter(l => l.videoUrl || l.videoFile).length || 0}
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
                          {lectures?.filter(l => l.isPublished).length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lectures List */}
            <div className="space-y-3 sm:space-y-4">
              {lectures?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Play className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No lectures yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                      Create your first lecture to get started
                    </p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)} 
                      size="sm" 
                      className="sm:size-default bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Lecture
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                lectures?.map((lecture) => (
                  <Card key={lecture._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <Badge variant="outline" className="text-xs sm:text-sm">
                              Lecture {lecture.order}
                            </Badge>
                            {lecture.isPublished ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs sm:text-sm">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600 text-xs sm:text-sm">
                                Draft
                              </Badge>
                            )}
                            {lecture.videoFile && (
                              <Badge variant="outline" className="text-blue-600 text-xs sm:text-sm">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                            {lecture.pdfNotes && lecture.pdfNotes.length > 0 && (
                              <Badge variant="outline" className="text-purple-600 text-xs sm:text-sm">
                                <FileText className="h-3 w-3 mr-1" />
                                PDF Notes
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words">
                            {lecture.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{lecture.duration || 0} min</span>
                            </div>
                            {lecture.videoFile && (
                              <div className="flex items-center gap-1">
                                <Upload className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>Uploaded Video</span>
                              </div>
                            )}
                            {lecture.pdfNotes && lecture.pdfNotes.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>{lecture.pdfNotes.length} PDF(s)</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 lg:ml-4 lg:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(lecture)}
                            className="w-full xs:w-auto text-xs sm:text-sm py-2 sm:py-2.5"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLecture(lecture._id)}
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

            {/* Edit Lecture Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="w-[95vw] max-w-lg mx-auto p-0 overflow-hidden sm:w-full">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6">
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                        <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                          Edit Lecture
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base break-words">
                          Update lecture information
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lecture Title *
                      </Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter lecture title"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        min="0"
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-order" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lecture Order *
                      </Label>
                      <Input
                        id="edit-order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        min="1"
                        className="w-full text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                        The order in which this lecture appears in the module
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="edit-isPublished"
                          checked={formData.isPublished}
                          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="edit-isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Publish lecture
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                        Make this lecture available to students
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-videoFile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Video File (Optional)
                      </Label>
                      <Input
                        id="edit-videoFile"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="w-full text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-pdfFiles" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        PDF Notes *
                      </Label>
                      {selectedLecture?.pdfNotes && selectedLecture.pdfNotes.length > 0 && (
                        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="text-sm font-medium mb-1">Existing PDF Notes:</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedLecture.pdfNotes.map((note: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                {note.split('/').pop()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Input
                        id="edit-pdfFiles"
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handlePdfFilesChange}
                        className="w-full text-sm sm:text-base"
                      />
                      <p className="text-sm text-gray-500 mt-1 break-words">
                        {selectedLecture?.pdfNotes && selectedLecture.pdfNotes.length > 0 
                          ? 'Upload new PDF notes to replace existing ones' 
                          : 'At least one PDF note is required'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      onClick={handleEditLecture} 
                      className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Update Lecture</span>
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

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

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
    </AdminRoute>
  );
}
