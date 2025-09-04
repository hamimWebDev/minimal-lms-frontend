'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses, setFilters } from '@/store/slices/courseSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { CourseCard } from '@/components/cards/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, Filter, Grid, List } from 'lucide-react';

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, isLoading, filters } = useAppSelector((state) => state.course);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(setFilters({ ...filters, search: value }));
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setFilters({ ...filters, category }));
  };

  const handleLevelChange = (level: string) => {
    dispatch(setFilters({ ...filters, level }));
  };

  const handlePriceRangeChange = (range: string) => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    switch (range) {
      case 'free':
        minPrice = 0;
        maxPrice = 0;
        break;
      case 'under-50':
        minPrice = 0;
        maxPrice = 50;
        break;
      case '50-100':
        minPrice = 50;
        maxPrice = 100;
        break;
      case 'over-100':
        minPrice = 100;
        break;
      default:
        break;
    }

    dispatch(setFilters({ ...filters, minPrice, maxPrice }));
  };

  const clearFilters = () => {
    dispatch(setFilters({}));
    setSearchTerm('');
  };

  const categories = [
    'All Categories',
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Data Science',
    'Personal Development',
  ];

  const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'under-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: 'over-100', label: 'Over $100' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Explore Our Courses
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover thousands of courses from top instructors around the world
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handleLevelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handlePriceRangeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {courses.length} courses found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={48} />
            </div>
          ) : courses.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium mb-2">No courses found</p>
                <p className="text-sm">Try adjusting your search criteria or filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
