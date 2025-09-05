'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { login } from '@/store/slices/authSlice';

interface LoginFormData {
  email: string;
  password: string;
}

export const CookieTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: 'mdhamimhowladerasif@gmail.com',
    password: '123456'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(login(loginData)).unwrap();
      toast.success('Login successful!');
      
      // Check cookies after login
      setTimeout(() => {
        const cookies = document.cookie;
        console.log('All cookies:', cookies);
        toast.info(`Cookies: ${cookies}`);
      }, 1000);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    console.log('Current cookies:', cookies);
    toast.info(`Current cookies: ${cookies}`);
  };

  const testRefreshToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Refresh token response:', data);
      toast.info(`Refresh response: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Refresh token error:', error);
      toast.error('Refresh token failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cookie Test</CardTitle>
          <CardDescription>
            Test login and cookie handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
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
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">User Info</h3>
                <p>Name: {user?.name}</p>
                <p>Email: {user?.email}</p>
                <p>Role: {user?.role}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={checkCookies} variant="outline">
                  Check Cookies
                </Button>
                <Button onClick={testRefreshToken} variant="outline">
                  Test Refresh Token
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Instructions:</strong>
              <br />
              1. Login with the provided credentials
              <br />
              2. Check if refresh token cookie is set
              <br />
              3. Test refresh token endpoint
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
