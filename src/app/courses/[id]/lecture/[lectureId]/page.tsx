'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { fetchModulesByCourse } from '@/store/slices/moduleSlice';
import { fetchLecturesByModule } from '@/store/slices/lectureSlice';
import { fetchLectureById } from '@/store/slices/lectureSlice';

import { checkEnrollmentStatus } from '@/store/slices/enrollmentSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings, 
  Subtitles, 
  PictureInPicture, 
  Maximize, 
  MoreVertical,
  Bookmark,
  Square,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  ThumbsUp,
  Share2,
  FileText,
  AlertCircle,
  Lock,
  CheckCircle,
  Clock,
  BookOpen,
  Download,
  FileDown
} from 'lucide-react';
import Image from 'next/image';

export default function LectureViewerPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentCourse, isLoading: courseLoading } = useAppSelector((state) => state.course);
  const { modules, isLoading: modulesLoading } = useAppSelector((state) => state.module);
  const { lectures, currentLecture, isLoading: lectureLoading } = useAppSelector((state) => state.lecture);
  const { enrollmentStatus, isLoading: enrollmentLoading } = useAppSelector((state) => state.enrollment);
  const { user } = useAppSelector((state) => state.auth);

  const courseId = params.id as string;
  const lectureId = params.lectureId as string;

  // State for video player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getModuleLectures = (moduleId: string) => {
    return lectures.filter(lecture => lecture.moduleId === moduleId);
  };

  const getCurrentModule = () => {
    return modules.find(module => 
      getModuleLectures(module._id).some(lecture => lecture._id === lectureId)
    );
  };

  const togglePlay = () => {
    if (videoRef.current && currentLecture?.videoUrl) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current && currentLecture?.videoUrl) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (videoRef.current && currentLecture?.videoUrl) {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current.currentTime > 10) {
            videoRef.current.currentTime -= 10;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current.currentTime < videoRef.current.duration - 10) {
            videoRef.current.currentTime += 10;
          }
          break;
        case 'KeyM':
          e.preventDefault();
          setVolume(volume > 0 ? 0 : 1);
          if (videoRef.current) {
            videoRef.current.volume = volume > 0 ? 0 : 1;
          }
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    }
  };

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchModulesByCourse(courseId));
      dispatch(checkEnrollmentStatus(courseId));
    }
  }, [dispatch, courseId]);

  useEffect(() => {
    if (lectureId) {
      dispatch(fetchLectureById(lectureId));
    }
  }, [dispatch, lectureId]);

  useEffect(() => {
    if (modules.length > 0) {
      // Fetch lectures for all modules
      modules.forEach(module => {
        dispatch(fetchLecturesByModule(module._id));
      });
      
      // Auto-expand the current module
      const currentModule = getCurrentModule();
      if (currentModule) {
        setExpandedModules(new Set([currentModule._id]));
      }
    }
  }, [dispatch, modules, lectureId]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [volume, isPlaying, isFullscreen]);

  const isLoading = courseLoading || modulesLoading || lectureLoading || enrollmentLoading;

  // Check if user has access
  const hasAccess = enrollmentStatus?.status === 'approved';

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner size={48} />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Check if course has modules
  if (modules.length === 0) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Content Available</h2>
              <p className="text-gray-600 mb-4">This course doesn't have any modules or lectures yet.</p>
              <Button onClick={() => router.push(`/courses/${courseId}`)}>
                Back to Course
              </Button>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Check if current lecture exists
  if (!currentLecture) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Lecture Not Found</h2>
              <p className="text-gray-600 mb-4">The requested lecture could not be found.</p>
              <Button onClick={() => router.push(`/courses/${courseId}`)}>
                Back to Course
              </Button>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!hasAccess) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <Card className="p-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-gray-600 mb-4">You need to be enrolled in this course to view lectures.</p>
              <Button onClick={() => router.push(`/courses/${courseId}`)}>
                Back to Course
              </Button>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const getCurrentModuleProgress = () => {
    const currentModule = getCurrentModule();
    if (!currentModule) return { completed: 0, total: 0 };
    
    const moduleLectures = getModuleLectures(currentModule._id);
    const total = moduleLectures.length;
    // Show current lecture position as completed
    const sortedLectures = [...moduleLectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const currentIndex = sortedLectures.findIndex(lecture => lecture._id === lectureId);
    const completed = currentIndex >= 0 ? currentIndex + 1 : 0;
    
    return { completed, total };
  };

  const isLectureCompleted = (lectureId: string) => {
    const currentModule = getCurrentModule();
    if (!currentModule) return false;
    
    const moduleLectures = getModuleLectures(currentModule._id);
    const sortedLectures = [...moduleLectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const currentIndex = sortedLectures.findIndex(lecture => lecture._id === lectureId);
    const lectureIndex = sortedLectures.findIndex(lecture => lecture._id === lectureId);
    
    // Mark lecture as completed if it's before the current lecture
    return lectureIndex >= 0 && lectureIndex < currentIndex;
  };

  const getCurrentModuleNumber = () => {
    const currentModule = getCurrentModule();
    return currentModule ? currentModule.moduleNumber : 1;
  };

  const getTotalModules = () => {
    return modules.length;
  };

  const getModuleProgressPercentage = () => {
    const { completed, total } = getCurrentModuleProgress();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getPreviousLecture = () => {
    const currentModule = getCurrentModule();
    if (!currentModule) return null;
    
    const moduleLectures = [...getModuleLectures(currentModule._id)].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const currentIndex = moduleLectures.findIndex(lecture => lecture._id === lectureId);
    
    if (currentIndex > 0) {
      return moduleLectures[currentIndex - 1];
    }
    
    // If no previous lecture in current module, get last lecture of previous module
    const currentModuleIndex = modules.findIndex(module => module._id === currentModule._id);
    if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      const prevModuleLectures = [...getModuleLectures(prevModule._id)].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return prevModuleLectures[prevModuleLectures.length - 1] || null;
    }
    
    return null;
  };

  const getNextLecture = () => {
    const currentModule = getCurrentModule();
    if (!currentModule) return null;
    
    const moduleLectures = [...getModuleLectures(currentModule._id)].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const currentIndex = moduleLectures.findIndex(lecture => lecture._id === lectureId);
    
    if (currentIndex < moduleLectures.length - 1) {
      return moduleLectures[currentIndex + 1];
    }
    
    // If no next lecture in current module, get first lecture of next module
    const currentModuleIndex = modules.findIndex(module => module._id === currentModule._id);
    if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];
      const nextModuleLectures = [...getModuleLectures(nextModule._id)].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return nextModuleLectures[0] || null;
    }
    
    return null;
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const filteredModules = modules.filter(module => {
    if (!searchQuery) return true;
    const moduleLectures = getModuleLectures(module._id);
    return module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           moduleLectures.some(lecture => lecture.title.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleVideoProgress = () => {
    if (videoRef.current && currentLecture?.videoUrl) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current && currentLecture?.videoUrl) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current && currentLecture?.videoUrl) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const handleTouchStart = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const downloadAllNotes = async () => {
    if (!currentLecture?.pdfNotes || currentLecture.pdfNotes.length === 0) {
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Create a zip file containing all PDF notes
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      // Add each PDF to the zip
      for (let i = 0; i < currentLecture.pdfNotes.length; i++) {
        const pdfUrl = currentLecture.pdfNotes[i];
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        
        // Extract filename from URL or create one
        const filename = pdfUrl.split('/').pop() || `note-${i + 1}.pdf`;
        zip.file(filename, blob);
        
        // Update progress
        setDownloadProgress(Math.round(((i + 1) / currentLecture.pdfNotes.length) * 100));
      }

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentLecture.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading notes:', error);
      alert('Failed to download notes. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const downloadSingleNote = async (pdfUrl: string, index: number) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfUrl.split('/').pop() || `note-${index + 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading note:', error);
      alert('Failed to download note. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
       
<div className='bg-gray-900'>
<div className="min-h-screen bg-gray-900 text-white max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-sm">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
            
            <div className="relative flex items-center justify-between p-4 xl:p-6">
              {/* Left Section - Course Info */}
              <div className="flex items-center gap-3 xl:gap-4 flex-1 min-w-0">
                {/* Course Icon */}
                <div className="relative group">
                  <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105">
                    <div className="w-3 h-3 xl:w-4 xl:h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                </div>
                
                {/* Course Details */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-base xl:text-xl font-bold text-white truncate bg-gradient-to-r from-white to-gray-200 bg-clip-text">
                      {currentCourse?.title || 'Loading...'}
                    </h1>
                    
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm xl:text-base text-gray-300 truncate font-medium">
                      {currentLecture?.title || 'Loading...'}
                    </p>
                    <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-gray-700/50 rounded-full">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {formatDuration(currentLecture?.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              

              {/* Right Section - Action Buttons */}
              <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
                {/* Bookmark Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:flex h-9 w-9 p-0 bg-gray-800/50 hover:bg-purple-500/20 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group"
                >
                  <Bookmark className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </Button>
                
                {/* Share Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:flex h-9 w-9 p-0 bg-gray-800/50 hover:bg-purple-500/20 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group"
                >
                  <Share2 className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </Button>
                
                {/* Settings Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden xl:flex h-9 w-9 p-0 bg-gray-800/50 hover:bg-purple-500/20 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group"
                >
                  <Settings className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </Button>
                
                {/* Mobile Menu Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex xl:hidden h-9 w-9 p-0 bg-gray-800/50 hover:bg-purple-500/20 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group"
                >
                  <MoreVertical className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </Button>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700/50">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500" 
                   style={{ width: `${getModuleProgressPercentage()}%` }}></div>
            </div>
          </div>

          {/* Mobile Running Module Indicator */}
          <div className="lg:hidden bg-gray-800/50 border-b border-gray-700/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-400">
                  Running Module :
                </span>
                <span className="text-sm font-bold text-white">
                  {getCurrentModuleNumber()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                    style={{ width: `${getModuleProgressPercentage()}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-white">
                  {getCurrentModuleProgress().completed}/{getCurrentModuleProgress().total}
                </span>
              </div>
            </div>
          </div>

                      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-70px)] xl:h-[calc(100vh-80px)]">
              {/* Video Player */}
              <div className="flex-1 flex flex-col items-center justify-start min-h-0 order-1 xl:order-1 px-4 xl:px-6 xl:mr-6">
                {/* Video Display */}
              <div 
                className="relative bg-black mx-auto my-4 xl:my-6 w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] xl:max-w-4xl xl:aspect-video xl:h-auto rounded-lg overflow-hidden shadow-2xl"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setShowControls(false)}
                onTouchStart={handleTouchStart}
              >
                {currentLecture?.videoUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleVideoProgress}
                    onLoadedMetadata={handleVideoProgress}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onLoadStart={() => setIsVideoLoading(true)}
                    onCanPlay={() => setIsVideoLoading(false)}
                    onError={() => setIsVideoLoading(false)}
                    controls={false}
                    preload="metadata"
                  >
                    <source src={currentLecture.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No Video Available</p>
                      <p className="text-sm text-gray-400">This lecture doesn't have a video file.</p>
                    </div>
                  </div>
                )}

                {/* Video Loading Overlay */}
                {isVideoLoading && currentLecture?.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-3">
                      <LoadingSpinner size={32} />
                      <p className="text-white text-sm">Loading video...</p>
                    </div>
                  </div>
                )}

                {/* Video Overlay Controls */}
                {currentLecture?.videoUrl && (
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/20 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={togglePlay}
                      className="bg-black/50 hover:bg-black/70 text-white"
                    >
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                    </Button>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              {currentLecture?.videoUrl && (
                <div className="bg-gray-800 p-3 xl:p-4 w-full xl:max-w-4xl mx-auto ">
                <div className="flex flex-col xl:flex-row items-center gap-3 xl:gap-4">
                  {/* Progress Bar */}
                  <div className="flex-1 w-full xl:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                        }}
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-400 min-w-fit">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-1 xl:gap-2 flex-wrap justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                        }
                      }}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={togglePlay} className="h-8 w-8 p-0">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
                        }
                      }}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-12 xl:w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden xl:flex">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden xl:flex">
                      <Subtitles className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden xl:flex">
                      <PictureInPicture className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden xl:flex">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                </div>
              )}

              {/* Bottom Section */}
              <div className="bg-gray-800 p-3 xl:p-4 border-t border-gray-700 w-full xl:max-w-4xl mx-auto rounded-b-lg">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Copyright Warning</span>
                    </div>
                  </div>
                  
                  {/* Download Notes Section */}
                  {currentLecture?.pdfNotes && currentLecture.pdfNotes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={downloadAllNotes}
                        disabled={isDownloading}
                        variant="outline"
                        size="sm"
                        className="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200"
                      >
                        {isDownloading ? (
                          <>
                            <LoadingSpinner size={16} />
                            <span className="ml-2">Downloading... {downloadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download All Notes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 xl:gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs xl:text-sm"
                      disabled={!getPreviousLecture()}
                      onClick={() => {
                        const prevLecture = getPreviousLecture();
                        if (prevLecture) {
                          router.push(`/courses/${courseId}/lecture/${prevLecture._id}`);
                        }
                      }}
                    >
                      <ArrowLeft className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                      Previous
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-xs xl:text-sm"
                      disabled={!getNextLecture()}
                      onClick={() => {
                        const nextLecture = getNextLecture();
                        if (nextLecture) {
                          router.push(`/courses/${courseId}/lecture/${nextLecture._id}`);
                        }
                      }}
                    >
                      Next
                      <ArrowRight className="h-3 w-3 xl:h-4 xl:w-4 ml-1 xl:ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 justify-center xl:justify-start">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Notes Panel */}
                {currentLecture?.pdfNotes && currentLecture.pdfNotes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-400" />
                        Lecture Notes ({currentLecture.pdfNotes.length})
                      </h3>
                      <Button
                        onClick={() => setShowNotes(!showNotes)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        {showNotes ? 'Hide' : 'Show'} Notes
                      </Button>
                    </div>
                    
                    {showNotes && (
                      <div className="space-y-2">
                        {currentLecture.pdfNotes.map((note, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <FileDown className="h-4 w-4 text-red-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Note {index + 1}
                                </p>
                                <p className="text-xs text-gray-400">
                                  PDF Document
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => window.open(note, '_blank')}
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                View
                              </Button>
                              <Button
                                onClick={() => downloadSingleNote(note, index)}
                                variant="ghost"
                                size="sm"
                                className="text-xs text-orange-400 hover:text-orange-300"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Course Navigation Sidebar */}
            <div className="w-full xl:w-96 bg-gradient-to-b from-gray-900 to-gray-800 border-t xl:border-l border-gray-700/50 flex flex-col max-h-[70vh] xl:max-h-none order-2 xl:order-2 shadow-2xl mr-0 xl:mr-24">
              {/* Header Section */}
              <div className="p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Course Content</h2>
                    <p className="text-xs text-gray-400">Navigate through modules</p>
                  </div>
                </div>
                {/* Running Module Indicator */}
              <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm xl:text-base font-medium text-blue-400">
                    Running Module :
                  </span>
                  <span className="text-sm xl:text-base font-bold text-white">
                    {getCurrentModuleNumber()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 xl:w-32 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                      style={{ width: `${getModuleProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <span className="text-xs xl:text-sm font-medium text-white">
                    {getCurrentModuleProgress().completed}/{getCurrentModuleProgress().total}
                  </span>
                </div>
              </div>
                
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-700/50 bg-gray-900/30">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Module List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className="p-4 space-y-3">
                  {filteredModules.map((module) => {
                    const moduleLectures = getModuleLectures(module._id);
                    const isExpanded = expandedModules.has(module._id);
                    const totalDuration = moduleLectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0);
                    const sortedLectures = [...moduleLectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    const currentIndex = sortedLectures.findIndex(lecture => lecture._id === lectureId);
                    const completedLectures = currentIndex >= 0 ? currentIndex + 1 : 0;
                    const moduleProgress = moduleLectures.length > 0 ? Math.round((completedLectures / moduleLectures.length) * 100) : 0;

                    return (
                      <div key={module._id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-500/30 group">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleModuleExpansion(module._id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-md">
                                {module.moduleNumber.toString().padStart(2, '0')}
                              </div>
                              <h3 className="font-semibold text-white text-sm truncate group-hover:text-purple-200 transition-colors">
                                {module.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(totalDuration)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                <span>{completedLectures}/{moduleLectures.length} lessons</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-purple-400 font-medium">{moduleProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${moduleProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                            )}
                          </div>
                        </div>

                        {isExpanded && moduleLectures.length > 0 && (
                          <div className="mt-4 space-y-2 border-t border-gray-700/50 pt-3">
                            {[...moduleLectures]
                              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                              .map((lecture, index) => {
                              const isCurrentLecture = lecture._id === lectureId;
                              const isCompleted = isLectureCompleted(lecture._id);

                              return (
                                <div
                                  key={lecture._id}
                                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group/lecture ${
                                    isCurrentLecture 
                                      ? 'bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white shadow-lg border border-purple-500/50' 
                                      : 'hover:bg-gray-700/50 text-gray-300 hover:text-white hover:shadow-md'
                                  }`}
                                  onClick={() => router.push(`/courses/${courseId}/lecture/${lecture._id}`)}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isCurrentLecture 
                                      ? 'bg-purple-500/20' 
                                      : isCompleted 
                                        ? 'bg-green-500/20 group-hover/lecture:bg-green-500/30' 
                                        : 'bg-gray-600/50 group-hover/lecture:bg-gray-500/50'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle className="h-3 w-3 text-green-400" />
                                    ) : (
                                      <Play className="h-3 w-3 text-gray-400 group-hover/lecture:text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-medium truncate block ${
                                      isCurrentLecture ? 'text-white' : 'text-gray-300 group-hover/lecture:text-white'
                                    }`}>
                                      {index + 1}. {lecture.title}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDuration(lecture.duration)}</span>
                                      </div>
                                      {isCurrentLecture && (
                                        <div className="flex items-center gap-1 text-xs text-purple-300">
                                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                                          <span>Playing</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>


        </div>
</div>
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
          }
          
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
            border: none;
          }

          /* Custom scrollbar styling */
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 #1f2937;
          }

          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }

          .scrollbar-thin::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 3px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 3px;
            transition: background 0.2s ease;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }

          /* Smooth transitions for all interactive elements */
          * {
            transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
          }
        `}</style>
      </MainLayout>
    </ProtectedRoute>
  );
}
