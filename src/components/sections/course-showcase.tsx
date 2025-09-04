'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses, setFilters } from '@/store/slices/courseSlice';
import { CourseCard } from '@/components/cards/course-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Star, TrendingUp, Users, Award } from 'lucide-react';

export function CourseShowcase() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Using Redux selector to get course data
  const { courses, isLoading, error } = useAppSelector((state) => state.course);

  // Fetch courses when component mounts
  useEffect(() => {
    // Dispatch the fetch action with filters
    dispatch(fetchCourses({ isPublished: true }));
  }, [dispatch]);

  // Handle error state
  if (error) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <Card className="border-0 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-8">
              <p className="text-red-600 dark:text-red-400 mb-4 text-lg">Error loading courses: {error}</p>
              <Button onClick={() => dispatch(fetchCourses({ isPublished: true }))}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const featuredCourses = courses.slice(0, 6);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 px-4 py-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 mr-2" />
              Most Popular Courses
            </Badge>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Featured Courses
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover our most popular courses and start your learning journey today. 
            <span className="font-semibold text-slate-900 dark:text-white"> Hand-picked by our experts.</span>
          </p>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <LoadingSpinner size={32} />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mx-auto"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8">
                <div className="max-w-2xl mx-auto text-white">
                  <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
                  <p className="text-blue-100 mb-6">
                    Join thousands of students who have already transformed their careers with our courses.
                  </p>
                  <Button 
                    size="lg"
                    variant="secondary"
                    onClick={() => router.push('/courses')}
                    className="text-lg px-8 py-4 h-auto bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    View All Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
