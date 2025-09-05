'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

export const TokenExpiryTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isTesting, setIsTesting] = useState(false);

  const testAccessTokenExpiry = async () => {
    setIsTesting(true);
    try {
      // Make an API call that will trigger token refresh if access token is expired
      const response = await apiService.getUserById(user?._id || '');
      
      if (response.success) {
        toast.success('API call successful - Access token was refreshed automatically');
      }
    } catch (error) {
      toast.error('API call failed: ' + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const testRefreshTokenExpiry = async () => {
    setIsTesting(true);
    try {
      // Try to refresh token manually
      await apiService.refreshToken();
      toast.success('Token refresh successful');
    } catch (error) {
      toast.error('Token refresh failed - User should be logged out: ' + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const simulateExpiredAccessToken = () => {
    // Simulate expired access token by removing it from localStorage
    localStorage.removeItem('accessToken');
    toast.info('Access token removed from localStorage - Next API call should trigger refresh');
  };

  const simulateExpiredRefreshToken = () => {
    // This would require backend changes to simulate, but we can show the concept
    toast.info('To test refresh token expiry, you would need to wait 7 days or modify backend token expiry');
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Expiry Test</CardTitle>
          <CardDescription>
            Please login first to test token expiry behavior
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Expiry Test</CardTitle>
          <CardDescription>
            Test the behavior when access tokens and refresh tokens expire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Current Token Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="space-y-1 text-sm">
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user?.name}</p>
              <p>Access Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</p>
              <p>Refresh Token: Handled by HttpOnly Cookie</p>
            </div>
          </div>

          {/* Test Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Test Instructions:</strong>
              <br />
              1. <strong>Access Token Expiry:</strong> When access token expires, API calls should automatically refresh it using the refresh token cookie. User should NOT be logged out.
              <br />
              2. <strong>Refresh Token Expiry:</strong> When refresh token expires, user should be automatically logged out.
            </AlertDescription>
          </Alert>

          {/* Test Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={testAccessTokenExpiry} 
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size={16} />
                    <span>Testing...</span>
                  </div>
                ) : (
                  'Test Access Token Refresh'
                )}
              </Button>
              
              <Button 
                onClick={testRefreshTokenExpiry} 
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size={16} />
                    <span>Testing...</span>
                  </div>
                ) : (
                  'Test Refresh Token'
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={simulateExpiredAccessToken} 
                disabled={isTesting}
                variant="secondary"
              >
                Simulate Expired Access Token
              </Button>
              
              <Button 
                onClick={simulateExpiredRefreshToken} 
                disabled={isTesting}
                variant="secondary"
              >
                Simulate Expired Refresh Token
              </Button>
            </div>
          </div>

          {/* Expected Behavior */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
              Expected Behavior
            </h3>
            <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
              <li>• <strong>Access Token Expiry:</strong> API calls should automatically refresh the token using refresh token cookie. User stays logged in.</li>
              <li>• <strong>Refresh Token Expiry:</strong> User should be automatically logged out and redirected to login page.</li>
              <li>• <strong>Refresh Token:</strong> Stored in HttpOnly cookie, not accessible to JavaScript.</li>
              <li>• <strong>Access Token:</strong> Stored in localStorage, automatically updated when refreshed.</li>
            </ul>
          </div>

          {/* Security Notes */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">
              Security Improvements
            </h3>
            <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
              <li>• Refresh tokens are now stored in HttpOnly cookies (more secure)</li>
              <li>• Refresh tokens cannot be accessed by JavaScript (XSS protection)</li>
              <li>• Automatic logout when refresh token expires</li>
              <li>• Seamless token refresh for better user experience</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
