'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogById } from '@/store/slices/blogSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Share2,
  BookOpen,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentBlog, isLoading, error } = useAppSelector((state) => state.blog);
  const blogId = params.id as string;

  useEffect(() => {
    if (blogId) {
      dispatch(fetchBlogById(blogId)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Blog post loaded successfully');
        } else if (result.meta.requestStatus === 'rejected') {
          toast.error('Failed to load blog post');
        }
      });
    }
  }, [dispatch, blogId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <LoadingSpinner size={48} />
        </div>
      </MainLayout>
    );
  }

  if (error || !currentBlog) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Blog Post Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {error || 'The blog post you\'re looking for doesn\'t exist or has been removed.'}
              </p>
              <div className="space-x-4">
                <Button onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => router.push('/blog')}>
                  View All Blogs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Back Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/blog')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Blog Header */}
          <Card className="mb-8 overflow-hidden p-0">
            <div className="relative h-64 md:h-80 w-full">
              <Image
                src={currentBlog.coverImage || '/placeholder-course.jpg'}
                alt={currentBlog.title}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-course.jpg';
                }}
              />
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(currentBlog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{currentBlog.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{estimateReadingTime(currentBlog.content)} min read</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  {currentBlog.title}
                </h1>

                {/* Tags */}
                {currentBlog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentBlog.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Share Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: currentBlog.title,
                          text: currentBlog.content.substring(0, 100) + '...',
                          url: window.location.href,
                        }).then(() => {
                          toast.success('Blog post shared successfully!');
                        }).catch(() => {
                          toast.error('Failed to share blog post');
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(window.location.href).then(() => {
                          toast.success('Link copied to clipboard!');
                        }).catch(() => {
                          toast.error('Failed to copy link');
                        });
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog Content */}
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentBlog.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <span>Published on {formatDate(currentBlog.createdAt)} at {formatTime(currentBlog.createdAt)}</span>
              {currentBlog.updatedAt !== currentBlog.createdAt && (
                <>
                  <span>•</span>
                  <span>Updated on {formatDate(currentBlog.updatedAt)}</span>
                </>
              )}
            </div>
            
            <div className="space-x-4">
              <Button variant="outline" onClick={() => router.push('/blog')}>
                <BookOpen className="h-4 w-4 mr-2" />
                View All Blogs
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/courses')}
              >
                Explore Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
