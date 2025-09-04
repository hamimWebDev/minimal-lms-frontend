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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Share2,
  BookOpen,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Star,
  Quote
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center space-y-4">
            <LoadingSpinner size={48} />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Loading article...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !currentBlog) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <div className="p-8 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Blog Post Not Found
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto text-lg">
                {error || 'The blog post you\'re looking for doesn\'t exist or has been removed.'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={() => router.back()} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => router.push('/blog')}>
                  <BookOpen className="h-4 w-4 mr-2" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Back Navigation */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/blog')}
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Blog Header */}
          <Card className="mb-8 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
              <Image
                src={currentBlog.coverImage || '/placeholder-blog.jpg'}
                alt={currentBlog.title}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-blog.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Tags Overlay */}
              <div className="absolute top-4 left-4">
                <div className="flex gap-2">
                  {currentBlog.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="default" className="bg-white/90 text-slate-900 border-white">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{formatDate(currentBlog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{currentBlog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>{estimateReadingTime(currentBlog.content)} min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span>1.2k views</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                  {currentBlog.title}
                </h1>

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
                        navigator.clipboard.writeText(window.location.href).then(() => {
                          toast.success('Link copied to clipboard!');
                        }).catch(() => {
                          toast.error('Failed to copy link');
                        });
                      }
                    }}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Article
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog Content */}
          <Card className="border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300">
                <div className="whitespace-pre-wrap leading-relaxed text-lg">
                  {currentBlog.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Section */}
          <Card className="mt-8 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-200 dark:ring-blue-800">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={currentBlog.author} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-lg">
                    {currentBlog.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentBlog.author}</h3>
                  <p className="text-slate-600 dark:text-slate-400">Expert Author & Content Creator</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.9</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>15 articles</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Separator className="mb-8" />
            
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-8">
              <span>Published on {formatDate(currentBlog.createdAt)} at {formatTime(currentBlog.createdAt)}</span>
              {currentBlog.updatedAt !== currentBlog.createdAt && (
                <>
                  <span>•</span>
                  <span>Updated on {formatDate(currentBlog.updatedAt)}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/blog')}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View All Blogs
              </Button>
              <Button
                onClick={() => router.push('/courses')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Explore Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
