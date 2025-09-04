'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses, setFilters } from '@/store/slices/courseSlice';
import { CourseCard } from '@/components/cards/course-card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen } from 'lucide-react';

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
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading courses: {error}</p>
        <Button onClick={() => dispatch(fetchCourses({ isPublished: true }))}>
          Retry
        </Button>
      </div>
    );
  }

  const featuredCourses = courses.slice(0, 6);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our most popular courses and start your learning journey today
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            <div className="text-center">
              <Button 
                size="lg"
                onClick={() => router.push('/courses')}
                className="text-lg px-8 py-3"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
