'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { EnrollmentRequestsAdmin } from '@/components/enrollment/enrollment-requests-admin';
import { AdminRoute } from '@/components/auth/ProtectedRoute';

export default function AdminEnrollmentRequestsPage() {
  return (
    <AdminRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EnrollmentRequestsAdmin />
          </div>
        </div>
      </MainLayout>
    </AdminRoute>
  );
}
