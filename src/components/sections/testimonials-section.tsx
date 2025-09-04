'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Developer',
    image: '/avatars/sarah.jpg',
    content: 'The courses here completely transformed my career. I went from knowing nothing about programming to landing my dream job as a software developer.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Data Scientist',
    image: '/avatars/michael.jpg',
    content: 'Excellent platform with high-quality content. The instructors are knowledgeable and the community is very supportive.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    image: '/avatars/emily.jpg',
    content: 'I love how flexible the learning schedule is. I can study at my own pace and the course materials are always up-to-date.',
    rating: 5
  },
  {
    name: 'David Thompson',
    role: 'Product Manager',
    image: '/avatars/david.jpg',
    content: 'The practical projects and real-world examples made learning much more engaging and applicable to my work.',
    rating: 5
  },
  {
    name: 'Lisa Wang',
    role: 'Marketing Specialist',
    image: '/avatars/lisa.jpg',
    content: 'Great value for money. The courses are comprehensive and the certificates are recognized by employers.',
    rating: 5
  },
  {
    name: 'James Wilson',
    role: 'Business Analyst',
    image: '/avatars/james.jpg',
    content: 'The platform is intuitive and the support team is always helpful. Highly recommend for anyone looking to upskill.',
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear from our community of learners who have transformed their careers with our courses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
