'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, TrendingUp, Users, Award } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Developer',
    company: 'Google',
    image: '/placeholder-avatar.jpg',
    content: 'The courses here completely transformed my career. I went from knowing nothing about programming to landing my dream job as a software developer.',
    rating: 5,
    highlight: 'Career Transformation'
  },
  {
    name: 'Michael Chen',
    role: 'Data Scientist',
    company: 'Microsoft',
    image: '/placeholder-avatar.jpg',
    content: 'Excellent platform with high-quality content. The instructors are knowledgeable and the community is very supportive.',
    rating: 5,
    highlight: 'High Quality'
  },
  {
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    company: 'Apple',
    image: '/placeholder-avatar.jpg',
    content: 'I love how flexible the learning schedule is. I can study at my own pace and the course materials are always up-to-date.',
    rating: 5,
    highlight: 'Flexible Learning'
  },
  {
    name: 'David Thompson',
    role: 'Product Manager',
    company: 'Amazon',
    image: '/placeholder-avatar.jpg',
    content: 'The practical projects and real-world examples made learning much more engaging and applicable to my work.',
    rating: 5,
    highlight: 'Practical Projects'
  },
  {
    name: 'Lisa Wang',
    role: 'Marketing Specialist',
    company: 'Meta',
    image: '/placeholder-avatar.jpg',
    content: 'Great value for money. The courses are comprehensive and the certificates are recognized by employers.',
    rating: 5,
    highlight: 'Great Value'
  },
  {
    name: 'James Wilson',
    role: 'Business Analyst',
    company: 'Netflix',
    image: '/placeholder-avatar.jpg',
    content: 'The platform is intuitive and the support team is always helpful. Highly recommend for anyone looking to upskill.',
    rating: 5,
    highlight: 'Intuitive Platform'
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 px-4 py-2 text-sm font-medium">
              <Users className="h-4 w-4 mr-2" />
              Student Success Stories
            </Badge>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            What Our Students
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Say</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Hear from our community of learners who have transformed their careers with our courses. 
            <span className="font-semibold text-slate-900 dark:text-white"> Real stories, real results.</span>
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Quote className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200">
                    {testimonial.highlight}
                  </Badge>
                </div>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                    {testimonial.rating}.0
                  </span>
                </div>
                
                {/* Testimonial Content */}
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                {/* Author Info */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 ring-2 ring-orange-200 dark:ring-orange-800">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">10,000+</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Happy Students</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">95%</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Success Rate</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">4.9/5</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8">
            <div className="max-w-2xl mx-auto text-white">
              <h3 className="text-2xl font-bold mb-4">Join Our Success Stories</h3>
              <p className="text-orange-100 mb-6">
                Start your journey today and become part of our growing community of successful learners.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-orange-200">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10K+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>95% Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
