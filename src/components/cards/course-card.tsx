'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';
import { useRouter } from 'next/navigation';
import { Clock, Star, Users, Play, BookOpen, User, DollarSign, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getLevelBadge = (level?: string) => {
    const levelColors = {
      beginner: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200',
      intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200'
    };
    
    return (
      <Badge variant="outline" className={levelColors[level as keyof typeof levelColors] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}>
        {level ? level.charAt(0).toUpperCase() + level.slice(1) : 'All Levels'}
      </Badge>
    );
  };

  return (
    <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            {getLevelBadge(course.level)}
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="bg-white/90 text-slate-900 border-white">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              4.8
            </Badge>
          </div>
          
          {/* Course Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-lg line-clamp-2">
              {course.title}
            </h3>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        {/* Course Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
          {course.description}
        </p>
        
        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {course.instructor || 'No instructor'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {formatDuration(course.duration)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {course.modulesCount || 0} modules
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {course.enrollmentCount || 0} students
            </span>
          </div>
        </div>

        {/* Category Badge */}
        {course.category && (
          <div className="mb-3">
            <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {course.category}
            </Badge>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex items-center justify-between">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatPrice(course.price)}
          </div>
          <Button 
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            onClick={() => router.push(`/courses/${course._id}`)}
          >
            <Play className="h-4 w-4 mr-2" />
            View Course
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
