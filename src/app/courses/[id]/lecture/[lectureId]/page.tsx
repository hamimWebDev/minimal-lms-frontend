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
  BookOpen
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
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (videoRef.current) {
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
    // For now, we'll show current lecture position as completed
    const sortedLectures = [...moduleLectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const currentIndex = sortedLectures.findIndex(lecture => lecture._id === lectureId);
    const completed = currentIndex >= 0 ? currentIndex + 1 : 0;
    
    return { completed, total };
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
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
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

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold truncate">
                  {currentCourse?.title || 'Loading...'}
                </h1>
                <p className="text-sm text-gray-400 truncate">
                  {currentLecture?.title || 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Square className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
            {/* Video Player */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Video Display */}
              <div 
                className="relative bg-black aspect-video lg:flex-1"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setShowControls(false)}
              >
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
                >
                  {currentLecture?.videoFile && (
                    <source src={currentLecture.videoFile} type="video/mp4" />
                  )}
                  Your browser does not support the video tag.
                </video>

                {/* Video Loading Overlay */}
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-3">
                      <LoadingSpinner size={32} />
                      <p className="text-white text-sm">Loading video...</p>
                    </div>
                  </div>
                )}

                {/* Video Overlay Controls */}
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
              </div>

              {/* Video Controls */}
              <div className="bg-gray-800 p-3 lg:p-4">
                <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4">
                  {/* Progress Bar */}
                  <div className="flex-1 w-full lg:w-auto">
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
                  <div className="flex items-center gap-1 lg:gap-2 flex-wrap justify-center">
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
                        className="w-12 lg:w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden lg:flex">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden lg:flex">
                      <Subtitles className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden lg:flex">
                      <PictureInPicture className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden lg:flex">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="bg-gray-800 p-3 lg:p-4 border-t border-gray-700">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    {currentLecture?.pdfNotes && currentLecture.pdfNotes.length > 0 ? (
                      <div className="flex items-center gap-2 text-orange-400">
                        <div className="w-3 h-3 bg-orange-400"></div>
                        <span className="text-sm">Notes Available ({currentLecture.pdfNotes.length})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-3 h-3 bg-gray-500"></div>
                        <span className="text-sm">No Notes Available</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Copyright Warning</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs lg:text-sm"
                      disabled={!getPreviousLecture()}
                      onClick={() => {
                        const prevLecture = getPreviousLecture();
                        if (prevLecture) {
                          router.push(`/courses/${courseId}/lecture/${prevLecture._id}`);
                        }
                      }}
                    >
                      <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Previous
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-xs lg:text-sm"
                      disabled={!getNextLecture()}
                      onClick={() => {
                        const nextLecture = getNextLecture();
                        if (nextLecture) {
                          router.push(`/courses/${courseId}/lecture/${nextLecture._id}`);
                        }
                      }}
                    >
                      Next
                      <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1 lg:ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 justify-center lg:justify-start">
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
              </div>
            </div>

            {/* Course Navigation Sidebar */}
            <div className="w-full lg:w-80 bg-gray-800 border-t lg:border-l border-gray-700 flex flex-col max-h-96 lg:max-h-none">
              {/* Module Progress */}
              <div className="p-3 lg:p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Running Module : {getCurrentModuleNumber().toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-400">
                    {getCurrentModuleProgress().completed}/{getCurrentModuleProgress().total}
                  </span>
                </div>
                <Progress value={getModuleProgressPercentage()} className="h-2" />
              </div>

              {/* Search Bar */}
              <div className="p-3 lg:p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search Lesson"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Module List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 lg:p-4 space-y-2">
                  {filteredModules.map((module) => {
                    const moduleLectures = getModuleLectures(module._id);
                    const isExpanded = expandedModules.has(module._id);
                    const totalDuration = moduleLectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0);
                    const sortedLectures = [...moduleLectures].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    const currentIndex = sortedLectures.findIndex(lecture => lecture._id === lectureId);
                    const completedLectures = currentIndex >= 0 ? currentIndex + 1 : 0;

                    return (
                      <div key={module._id} className="bg-purple-900 rounded-lg p-3">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleModuleExpansion(module._id)}
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm lg:text-base truncate">
                              MODULE {module.moduleNumber.toString().padStart(2, '0')} - {module.title}
                            </h3>
                            <p className="text-xs lg:text-sm text-gray-300">
                              {formatDuration(totalDuration)} • {completedLectures}/{moduleLectures.length}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>

                        {isExpanded && moduleLectures.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {[...moduleLectures]
                              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                              .map((lecture, index) => {
                              const isCurrentLecture = lecture._id === lectureId;
                              const isCompleted = false; // This would be replaced with actual progress data

                              return (
                                <div
                                  key={lecture._id}
                                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                    isCurrentLecture 
                                      ? 'bg-purple-700 text-white' 
                                      : 'hover:bg-purple-800 text-gray-300'
                                  }`}
                                  onClick={() => router.push(`/courses/${courseId}/lecture/${lecture._id}`)}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  ) : (
                                    <Play className="h-4 w-4 flex-shrink-0" />
                                  )}
                                  <span className="text-sm flex-1 truncate">
                                    {index + 1}. {lecture.title}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDuration(lecture.duration)}</span>
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
        `}</style>
      </MainLayout>
    </ProtectedRoute>
  );
}
