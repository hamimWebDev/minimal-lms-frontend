'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { initializeAuth } from '@/store/slices/authSlice';

interface ProvidersProps {
  children: React.ReactNode;
}

// Component to initialize auth state
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage when the app loads
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  );
}
