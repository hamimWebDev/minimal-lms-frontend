import { Suspense } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { HeroSection } from '@/components/sections/hero-section';
import { CourseShowcase } from '@/components/sections/course-showcase';
import { FeaturesSection } from '@/components/sections/features-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
        <CourseShowcase />
        <FeaturesSection />
        <TestimonialsSection />
      </Suspense>
    </MainLayout>
  );
}
