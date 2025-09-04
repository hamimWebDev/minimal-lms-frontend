'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Award, Play } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Learn Without Limits
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Start, switch, or advance your career with thousands of courses from world-class universities and companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => router.push('/courses')}
              className="text-lg px-8 py-3"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Courses
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/auth/login')}
              className="text-lg px-8 py-3"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Learning
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10K+</h3>
            <p className="text-gray-600 dark:text-gray-300">Active Students</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">500+</h3>
            <p className="text-gray-600 dark:text-gray-300">Courses Available</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">95%</h3>
            <p className="text-gray-600 dark:text-gray-300">Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}
