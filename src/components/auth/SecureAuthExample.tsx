'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { login, logoutUser, logoutAll, refreshToken } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
}

export const SecureAuthExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await dispatch(login(loginData)).unwrap();
      toast.success('Login successful!');
      setLoginData({ email: '', password: '' });
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await dispatch(logoutAll()).unwrap();
      toast.success('Logged out from all devices');
    } catch (error) {
      toast.error('Logout from all devices failed');
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(refreshToken()).unwrap();
      toast.success('Token refreshed successfully');
    } catch (error) {
      toast.error('Token refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProtectedApiCall = async () => {
    try {
      // This will automatically handle token refresh if needed
      const response = await fetch('/api/protected-endpoint', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Protected API call successful');

      } else {
        toast.error('Protected API call failed');
      }
    } catch (error) {
      toast.error('API call failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Secure Authentication Example</CardTitle>
          <CardDescription>
            This demonstrates the secure authentication flow with access tokens and refresh tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <div className="space-y-1 text-sm">
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              {user && (
                <>
                  <p>User: {user.name}</p>
                  <p>Email: {user.email}</p>
                  <p>Role: {user.role}</p>
                  <p>Status: {user.status}</p>
                </>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          {!isAuthenticated && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size={16} />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          )}

          {/* Authenticated Actions */}
          {isAuthenticated && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleRefreshToken} disabled={isRefreshing} variant="outline">
                  {isRefreshing ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size={16} />
                      <span>Refreshing...</span>
                    </div>
                  ) : (
                    'Refresh Token'
                  )}
                </Button>
                <Button onClick={handleProtectedApiCall} variant="outline">
                  Test Protected API
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleLogout} variant="destructive">
                  Logout
                </Button>
                <Button onClick={handleLogoutAll} variant="destructive">
                  Logout All Devices
                </Button>
              </div>
            </div>
          )}

          {/* Security Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
              Security Features
            </h3>
            <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Access tokens expire in 15 minutes</li>
              <li>• Refresh tokens are stored in HttpOnly cookies</li>
              <li>• Automatic token refresh on API calls</li>
              <li>• Refresh token rotation for security</li>
              <li>• Secure cookie settings (HttpOnly, Secure, SameSite)</li>
              <li>• Server-side token invalidation on logout</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
