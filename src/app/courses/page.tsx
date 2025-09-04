'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses, setFilters } from '@/store/slices/courseSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { CourseCard } from '@/components/cards/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  BookOpen, 
  Clock, 
  User, 
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle,
  FileText,
  Video
} from 'lucide-react';

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, isLoading, filters } = useAppSelector((state) => state.course);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('published');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  // Filter courses based on search and filters
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'published' && course.isPublished) ||
      (selectedStatus === 'draft' && !course.isPublished);
    
    let matchesPrice = true;
    if (selectedPriceRange !== 'all') {
      switch (selectedPriceRange) {
        case 'free':
          matchesPrice = course.price === 0;
          break;
        case 'under-50':
          matchesPrice = course.price > 0 && course.price < 50;
          break;
        case '50-100':
          matchesPrice = course.price >= 50 && course.price <= 100;
          break;
        case 'over-100':
          matchesPrice = course.price > 100;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus && matchesPrice;
  }) || [];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    dispatch(setFilters({ ...filters, category: category === 'all' ? undefined : category }));
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    dispatch(setFilters({ ...filters, level: level === 'all' ? undefined : level }));
  };

  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRange(range);
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
        minPrice = undefined;
        maxPrice = undefined;
        break;
    }

    dispatch(setFilters({ ...filters, minPrice, maxPrice }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSelectedStatus('published');
    setSelectedPriceRange('all');
    dispatch(setFilters({}));
  };

  // Get unique categories from courses
  const categories = ['all', ...new Set(courses?.map(course => course.category).filter(Boolean) || [])];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'under-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: 'over-100', label: 'Over $100' },
  ];

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLevelBadge = (level?: string) => {
    const levelColors = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="outline" className={levelColors[level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}>
        {level || 'Not Set'}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div>
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
          {/* Filters */}
          <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category">
                        {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <SelectItem key={category} value={category || ''}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Level">
                        {selectedLevel === 'all' ? 'All Levels' : selectedLevel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.filter(level => level !== 'all').map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status">
                        {selectedStatus === 'all' ? 'All Status' : selectedStatus}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
          </Card>


          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {filteredCourses.length} courses found
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
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size={48} />
            </div>
          ) : filteredCourses.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No courses found matching your criteria
              </p>
              <Button onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
