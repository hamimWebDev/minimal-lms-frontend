'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'superAdmin')[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['user', 'admin', 'superAdmin'],
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Wait for auth to be initialized before checking authentication
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check if user has required role
    if (user && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      if (user.role === 'admin' || user.role === 'superAdmin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
      return;
    }
  }, [isAuthenticated, isInitialized, router, user, allowedRoles, redirectTo]);

  // Show loading spinner while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  // Don't show content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't show content if user doesn't have required role
  if (user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({ children, redirectTo }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'superAdmin']} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children, redirectTo }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['user']} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

export function SuperAdminRoute({ children, redirectTo }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['superAdmin']} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}
