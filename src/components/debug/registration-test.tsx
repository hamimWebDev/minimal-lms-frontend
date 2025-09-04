'use client';

import { useAppSelector } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { User } from '@/types';

interface LocalStorageData {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

export function RegistrationTest() {
  const { user, isAuthenticated, isInitialized, accessToken, refreshToken } = useAppSelector((state) => state.auth);
  const [localStorageData, setLocalStorageData] = useState<LocalStorageData>({
    accessToken: null,
    refreshToken: null,
    user: null
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('user');
      
      setLocalStorageData({
        accessToken,
        refreshToken,
        user: user ? JSON.parse(user) : null
      });
    }
  }, []);

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setLocalStorageData({
        accessToken: null,
        refreshToken: null,
        user: null
      });
    }
  };

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader>
        <CardTitle className="text-sm text-gray-600">Debug: Authentication State</CardTitle>
        <CardDescription>Current authentication status and localStorage values</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Redux State:</strong>
            <ul className="mt-2 space-y-1">
              <li>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</li>
              <li>isInitialized: {isInitialized ? 'true' : 'false'}</li>
              <li>user: {user ? user.name : 'null'}</li>
              <li>accessToken: {accessToken ? `${accessToken.substring(0, 20)}...` : 'null'}</li>
              <li>refreshToken: {refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null'}</li>
            </ul>
          </div>
          <div>
            <strong>localStorage:</strong>
            <ul className="mt-2 space-y-1">
              <li>accessToken: {localStorageData.accessToken ? `${localStorageData.accessToken.substring(0, 20)}...` : 'null'}</li>
              <li>refreshToken: {localStorageData.refreshToken ? `${localStorageData.refreshToken.substring(0, 20)}...` : 'null'}</li>
              <li>user: {localStorageData.user ? localStorageData.user.name : 'null'}</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLocalStorage}
          >
            Clear localStorage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
