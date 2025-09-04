'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchLecturesByModule, createLecture, updateLecture, deleteLecture } from '@/store/slices/lectureSlice';
import { fetchModuleById } from '@/store/slices/moduleSlice';
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
  Download
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
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    duration: 0,
    order: 1,
    isPublished: false
  });
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

  const handleCreateLecture = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      showAlert('Validation Error', 'Lecture title is required', 'error');
      return;
    }
    
    if (pdfFiles.length === 0) {
      showAlert('Validation Error', 'At least one PDF note is required', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('duration', formData.duration.toString());
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
      setFormData({ title: '', duration: 0, order: 1, isPublished: false });
      setVideoFile(null);
      setPdfFiles([]);
      dispatch(fetchLecturesByModule(moduleId));
    } catch (error) {
      // Handle error silently
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
      formDataToSend.append('duration', formData.duration.toString());
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
      setFormData({ title: '', duration: 0, order: 1, isPublished: false });
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
                  <Link href={`/admin/courses/${courseId}/modules`} className="text-blue-600 hover:text-blue-800 text-sm truncate">
                    {selectedCourse?.title || 'Course'}
                  </Link>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm truncate">
                    {currentModule?.title || 'Module'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Module Lectures
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                  Manage lectures for "{currentModule?.title}"
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => router.push(`/admin/courses/${courseId}/modules`)}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Modules</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Lecture</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Lecture</DialogTitle>
                      <DialogDescription>
                        Add a new lecture to this module
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Lecture Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter lecture title"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                          min="0"
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="order">Order</Label>
                          <Input
                            id="order"
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            min="1"
                            className="w-full"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="isPublished">Publish lecture</Label>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="videoFile">Video File (Optional)</Label>
                        <Input
                          id="videoFile"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pdfFiles">PDF Notes *</Label>
                        <Input
                          id="pdfFiles"
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={handlePdfFilesChange}
                          className="w-full"
                        />
                        <p className="text-sm text-gray-500 mt-1">At least one PDF note is required</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleCreateLecture} className="flex-1 w-full sm:w-auto">
                          Create Lecture
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

            {/* Module Stats */}
            {currentModule && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                    <Button onClick={() => setShowCreateDialog(true)} size="sm" className="sm:size-default">
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
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:ml-4 lg:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(lecture)}
                            className="w-full sm:w-auto"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLecture(lecture._id)}
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

            {/* Edit Lecture Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Lecture</DialogTitle>
                  <DialogDescription>
                    Update lecture information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Lecture Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter lecture title"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      min="0"
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-order">Order</Label>
                      <Input
                        id="edit-order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        min="1"
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="edit-isPublished"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="edit-isPublished">Publish lecture</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-videoFile">Video File (Optional)</Label>
                    <Input
                      id="edit-videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-pdfFiles">PDF Notes *</Label>
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
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedLecture?.pdfNotes && selectedLecture.pdfNotes.length > 0 
                        ? 'Upload new PDF notes to replace existing ones' 
                        : 'At least one PDF note is required'
                      }
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleEditLecture} className="flex-1 w-full sm:w-auto">
                      Update Lecture
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
    </ProtectedRoute>
  );
}
