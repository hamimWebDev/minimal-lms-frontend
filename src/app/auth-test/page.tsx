'use client';

import { SecureAuthExample } from '@/components/auth/SecureAuthExample';
import { MainLayout } from '@/components/layout/main-layout';

export default function AuthTestPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <SecureAuthExample />
      </div>
    </MainLayout>
  );
}
