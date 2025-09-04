'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogById, updateBlog } from '@/store/slices/blogSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X,
  Tag,
  Image as ImageIcon
} from 'lucide-react';

function EditBlogContent() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const dispatch = useAppDispatch();
  const { currentBlog, isLoading: fetchLoading } = useAppSelector((state) => state.blog);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blogId) {
      dispatch(fetchBlogById(blogId));
    }
  }, [dispatch, blogId]);

  useEffect(() => {
    if (currentBlog) {
      setFormData({
        title: currentBlog.title,
        content: currentBlog.content,
        author: currentBlog.author,
        tags: currentBlog.tags,
      });
      setPreviewUrl(currentBlog.coverImage);
    }
  }, [currentBlog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (previewUrl && previewUrl !== currentBlog?.coverImage) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Updating blog post...');
    
    try {
      const updateData: any = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        tags: formData.tags
      };

      // Always send data in the format the backend expects
      const formDataObj = new FormData();
      
      if (selectedFile) {
        // If new file is selected, add it to FormData
        formDataObj.append('file', selectedFile);
      }
      
      // Always add the data field (required by backend)
      formDataObj.append('data', JSON.stringify(updateData));
      

      
      await dispatch(updateBlog({ id: blogId, data: formDataObj as any })).unwrap();
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Blog post updated successfully!', {
        description: 'Your changes have been saved.',
        duration: 4000,
      });
      
      router.push('/admin/blog');
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error('Failed to update blog post', {
          description: String(error.message),
          duration: 5000,
        });
      } else {
        toast.error('Failed to update blog post', {
          description: 'Please try again later.',
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <LoadingSpinner size={48} />
        </div>
      </MainLayout>
    );
  }

  if (!currentBlog) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Blog not found
            </h2>
            <Button onClick={() => router.push('/admin/blog')}>
              Back to Blog Management
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/blog')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Edit Blog
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Update your blog post
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Title</CardTitle>
                    <CardDescription>
                      Enter a compelling title for your blog post
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog title..."
                      className="text-lg"
                      required
                    />
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Content</CardTitle>
                    <CardDescription>
                      Write your blog post content here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write your blog content here..."
                      className="min-h-[400px] text-base leading-relaxed"
                      required
                    />
                  </CardContent>
                </Card>

                {/* Author */}
                <Card>
                  <CardHeader>
                    <CardTitle>Author</CardTitle>
                    <CardDescription>
                      Who is writing this blog post?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Enter author name..."
                      required
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cover Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Image</CardTitle>
                    <CardDescription>
                      Current cover image or upload a new one
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Cover preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {selectedFile && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={removeFile}
                              className="absolute top-2 right-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('cover-image')?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Label htmlFor="cover-image" className="cursor-pointer">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </Label>
                        <Input
                          id="cover-image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>
                      Add relevant tags to help readers find your post
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        disabled={!tagInput.trim()}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size={16} className="mr-2" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Blog
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/blog')}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default function EditBlogPage() {
  return (
    <AdminRoute>
      <EditBlogContent />
    </AdminRoute>
  );
}
