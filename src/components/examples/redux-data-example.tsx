'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses, setFilters, clearError } from '@/store/slices/courseSlice';
import { fetchBlogs, clearError as clearBlogError } from '@/store/slices/blogSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, RefreshCw, Filter, BookOpen, FileText } from 'lucide-react';

// Example 1: Basic Redux Data Fetching
export function BasicReduxExample() {
  const dispatch = useAppDispatch();
  const { courses, isLoading, error } = useAppSelector((state) => state.course);

  useEffect(() => {
    // Fetch data when component mounts
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCourses());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Basic Redux Data Fetching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner />
            <span className="ml-2">Loading courses...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 mb-2">Error: {error}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button size="sm" variant="outline" onClick={handleClearError}>
                Clear Error
              </Button>
            </div>
          </div>
        )}

        {/* Data Display */}
        {!isLoading && !error && courses.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Loaded {courses.length} courses
            </p>
            <div className="flex flex-wrap gap-2">
              {courses.slice(0, 3).map((course) => (
                <Badge key={course._id} variant="secondary">
                  {course.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Example 2: Redux with Filters and Search
export function ReduxWithFiltersExample() {
  const dispatch = useAppDispatch();
  const { courses, isLoading, filters } = useAppSelector((state) => state.course);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch data with current filters
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Update filters in Redux store
    dispatch(setFilters({ ...filters, search: value }));
  };

  const handleCategoryFilter = (category: string) => {
    dispatch(setFilters({ ...filters, category }));
  };

  const clearFilters = () => {
    dispatch(setFilters({}));
    setSearchTerm('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Redux with Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filters.category === 'programming' ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter('programming')}
            >
              Programming
            </Button>
            <Button
              size="sm"
              variant={filters.category === 'design' ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter('design')}
            >
              Design
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {courses.length} courses
            {filters.category && ` in ${filters.category}`}
            {filters.search && ` matching "${filters.search}"`}
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner />
              <span className="ml-2">Filtering...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {courses.slice(0, 5).map((course) => (
                <Badge key={course._id} variant="secondary">
                  {course.title}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Example 3: Multiple Redux Slices
export function MultipleReduxSlicesExample() {
  const dispatch = useAppDispatch();
  const { courses, isLoading: coursesLoading } = useAppSelector((state) => state.course);
  const { blogs, isLoading: blogsLoading } = useAppSelector((state) => state.blog);

  useEffect(() => {
    // Fetch data from multiple slices
    dispatch(fetchCourses());
    dispatch(fetchBlogs());
  }, [dispatch]);

  const isLoading = coursesLoading || blogsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multiple Redux Slices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner />
            <span className="ml-2">Loading data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Courses Data */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses ({courses.length})
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {courses.slice(0, 3).map((course) => (
                  <div key={course._id} className="truncate">
                    {course.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Blogs Data */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Blog Posts ({blogs.length})
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {blogs.slice(0, 3).map((blog) => (
                  <div key={blog._id} className="truncate">
                    {blog.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main component that combines all examples
export function ReduxDataExamples() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Redux Data Fetching Examples
      </h2>
      
      <BasicReduxExample />
      <ReduxWithFiltersExample />
      <MultipleReduxSlicesExample />
    </div>
  );
}
