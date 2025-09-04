'use client';

import { Header } from './header';
import { Footer } from './footer';
import { useSessionValidation } from '@/hooks/useSessionValidation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Validate session periodically
  useSessionValidation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
