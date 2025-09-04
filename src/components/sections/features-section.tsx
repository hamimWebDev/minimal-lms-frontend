'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Users, 
  Smartphone, 
  Globe,
  Shield,
  Headphones,
  Zap,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry experts and professionals with years of experience in their fields.',
    color: 'blue',
    highlight: 'Industry Experts'
  },
  {
    icon: Clock,
    title: 'Learn at Your Pace',
    description: 'Access courses 24/7 and learn at your own speed with lifetime access to course materials.',
    color: 'green',
    highlight: '24/7 Access'
  },
  {
    icon: Award,
    title: 'Certificates',
    description: 'Earn certificates upon completion to showcase your new skills and advance your career.',
    color: 'purple',
    highlight: 'Certified'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join a community of learners and get support from peers and instructors.',
    color: 'orange',
    highlight: 'Community'
  },
  {
    icon: Smartphone,
    title: 'Mobile Learning',
    description: 'Learn anywhere, anytime with our mobile-optimized platform and offline access.',
    color: 'indigo',
    highlight: 'Mobile Ready'
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Access courses from anywhere in the world with our cloud-based learning platform.',
    color: 'emerald',
    highlight: 'Global'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data and progress are protected with enterprise-grade security measures.',
    color: 'red',
    highlight: 'Secure'
  },
  {
    icon: Headphones,
    title: 'Audio & Video',
    description: 'High-quality video lectures and audio content for an immersive learning experience.',
    color: 'pink',
    highlight: 'HD Quality'
  }
];

const getColorClasses = (color: string) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-200'
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

const getIconColor = (color: string) => {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    pink: 'text-pink-600 dark:text-pink-400'
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 px-4 py-2 text-sm font-medium">
              <Zap className="h-4 w-4 mr-2" />
              Why Choose Our Platform?
            </Badge>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover the features that make our learning platform the perfect choice for your educational journey. 
            <span className="font-semibold text-slate-900 dark:text-white"> Built for modern learners.</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className={`h-8 w-8 ${getIconColor(feature.color)}`} />
                  </div>
                  <Badge variant="outline" className={getColorClasses(feature.color)}>
                    {feature.highlight}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8">
            <div className="max-w-2xl mx-auto text-white">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-slate-300 mb-6">
                Join thousands of learners who have already discovered the power of our platform.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Free Trial Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
