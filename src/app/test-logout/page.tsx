'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLogoutPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Logout Functionality</CardTitle>
          <CardDescription>
            This page tests the logout functionality to ensure hydration issues are resolved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Authentication Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </>
            )}
          </div>
          
          {isAuthenticated && (
            <Button 
              onClick={handleLogout} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Logging out...' : 'Test Logout'}
            </Button>
          )}
          
          {!isAuthenticated && (
            <div className="text-center text-gray-500">
              Please log in first to test logout functionality.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
