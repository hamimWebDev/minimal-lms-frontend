'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogs, deleteBlog } from '@/store/slices/blogSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Calendar,
  User,
  Tag,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function BlogManagementContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { blogs, isLoading } = useAppSelector((state) => state.blog);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);

  useEffect(() => {
    dispatch(fetchBlogs()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled' && Array.isArray(result.payload)) {
        toast.success(`Loaded ${result.payload.length} blog posts`);
      } else if (result.meta.requestStatus === 'rejected') {
        toast.error('Failed to load blog posts');
      }
    });
  }, [dispatch]);

  useEffect(() => {
    const filtered = blogs.filter(blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBlogs(filtered);
  }, [blogs, searchTerm]);

  const handleDeleteBlog = async (blogId: string) => {
    // Show confirmation toast
    toast.promise(
      dispatch(deleteBlog(blogId)).unwrap(),
      {
        loading: 'Deleting blog post...',
        success: 'Blog post deleted successfully!',
        error: (error) => {
          return 'Failed to delete blog post. Please try again.';
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Blog Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your platform's blog posts and content
              </p>
            </div>
            <Button 
              onClick={() => router.push('/admin/blog/create')}
              className="mt-4 sm:mt-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Blog
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search blogs by title, author, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    Total: {filteredBlogs.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={48} />
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="space-y-4">
              {filteredBlogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Blog Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {blog.title}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{blog.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                          {blog.updatedAt !== blog.createdAt && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Updated: {formatDate(blog.updatedAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {blog.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Content Preview */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                          {blog.content.length > 150 
                            ? `${blog.content.substring(0, 150)}...` 
                            : blog.content
                          }
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/blog/${blog._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/blog/${blog._id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Blog
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBlog(blog._id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Blog
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Tag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchTerm 
                    ? `No blogs match your search for "${searchTerm}"`
                    : 'Get started by creating your first blog post'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/admin/blog/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Blog
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function BlogManagementPage() {
  return (
    <AdminRoute>
      <BlogManagementContent />
    </AdminRoute>
  );
}
