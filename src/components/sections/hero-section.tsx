'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Award, Play, ArrowRight, Star, TrendingUp, Globe } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 px-4 py-2 text-sm font-medium">
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              Trusted by 10,000+ Students Worldwide
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
              Learn Without
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Limits</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Start, switch, or advance your career with thousands of courses from world-class universities and companies. 
              <span className="font-semibold text-slate-900 dark:text-white"> Learn at your own pace, anywhere, anytime.</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/courses')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-lg px-8 py-4 h-auto"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/auth/login')}
              className="text-lg px-8 py-4 h-auto border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Learning
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Global Access</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Career Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Certified Courses</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="text-center border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">10K+</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Active Students</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">500+</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Courses Available</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">95%</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Success Rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
