'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogs } from '@/store/slices/blogSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPage() {
  const dispatch = useAppDispatch();
  const { blogs, isLoading } = useAppSelector((state) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled' && Array.isArray(result.payload)) {
        if (result.payload.length > 0) {
          toast.success(`Found ${result.payload.length} blog posts`);
        } else {
          toast.info('No blog posts available yet');
        }
      } else if (result.meta.requestStatus === 'rejected') {
        toast.error('Failed to load blog posts');
      }
    });
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Blog
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Insights, tips, and stories from our learning community
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={48} />
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Card key={blog._id} className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.coverImage || '/placeholder-course.jpg'}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-course.jpg';
                      }}
                    />
                  </div>
                  
                  <CardContent className="flex-1 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(blog.createdAt)}</span>
                        <span>•</span>
                        <User className="h-4 w-4" />
                        <span>{blog.author}</span>
                      </div>
                      
                      <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white">
                        {blog.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                        {blog.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {blog.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Link href={`/blog/${blog._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            Read More
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No blog posts yet
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Check back soon for new articles and insights
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
