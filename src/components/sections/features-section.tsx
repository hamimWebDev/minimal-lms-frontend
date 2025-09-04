'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Users, 
  Smartphone, 
  Globe,
  Shield,
  Headphones
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry experts and professionals with years of experience in their fields.'
  },
  {
    icon: Clock,
    title: 'Learn at Your Pace',
    description: 'Access courses 24/7 and learn at your own speed with lifetime access to course materials.'
  },
  {
    icon: Award,
    title: 'Certificates',
    description: 'Earn certificates upon completion to showcase your new skills and advance your career.'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join a community of learners and get support from peers and instructors.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Learning',
    description: 'Learn anywhere, anytime with our mobile-optimized platform and offline access.'
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Access courses from anywhere in the world with our cloud-based learning platform.'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data and progress are protected with enterprise-grade security measures.'
  },
  {
    icon: Headphones,
    title: 'Audio & Video',
    description: 'High-quality video lectures and audio content for an immersive learning experience.'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the features that make our learning platform the perfect choice for your educational journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
