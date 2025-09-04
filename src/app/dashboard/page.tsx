'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Wait for auth to be initialized before checking authentication
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Redirect based on user role
    if (user) {
      if (user.role === 'admin' || user.role === 'superAdmin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
    }
  }, [isAuthenticated, isInitialized, router, user]);

  // Show loading spinner while redirecting
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size={48} />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
