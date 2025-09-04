'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogs } from '@/store/slices/blogSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, User, ArrowRight, BookOpen, Search, Filter, Clock, Eye, Heart, Share2, Tag, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPage() {
  const dispatch = useAppDispatch();
  const { blogs, isLoading } = useAppSelector((state) => state.blog);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Get unique tags for filtering
  const allTags = [...new Set(blogs.flatMap(blog => blog.tags))];
  
  // Filter blogs based on search and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden  bg-white/80 dark:bg-slate-800/80 ">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                Our Blog
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Insights, tips, and stories from our learning community. 
                <span className="font-semibold text-white"> Discover the latest trends and expert knowledge.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filters Section */}
          <div className="mb-12">
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white dark:bg-slate-700"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white dark:bg-slate-700">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="bg-white dark:bg-slate-700"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blog Posts */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="text-center space-y-4">
                <LoadingSpinner size={48} />
                <p className="text-slate-600 dark:text-slate-300 font-medium">Loading articles...</p>
              </div>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Card key={blog._id} className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={blog.coverImage || '/placeholder-blog.jpg'}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-blog.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Tags Overlay */}
                    <div className="absolute top-4 left-4">
                      <div className="flex gap-2">
                        {blog.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="default" className="bg-white/90 text-slate-900 border-white">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-6">
                    <div className="space-y-4">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{blog.author}</span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-bold text-xl line-clamp-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {blog.title}
                      </h3>
                      
                      {/* Content */}
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {blog.content.substring(0, 150)}...
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>1.2k</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>45</span>
                          </div>
                        </div>
                        
                        <Link href={`/blog/${blog._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
                          >
                            Read More
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="p-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                No articles found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto text-lg">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search criteria or browse all articles.'
                  : 'Check back soon for new articles and insights from our community.'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
