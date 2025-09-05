'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

export const AccessTokenTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAccessTokenExpiry = async () => {
    setIsTesting(true);
    addResult('Starting access token expiry test...');
    
    try {
      // First, remove access token to simulate expiry
      localStorage.removeItem('accessToken');
      addResult('Access token removed from localStorage');
      
      // Make an API call that should trigger token refresh
      const response = await apiService.getUserById(user?._id || '');
      
      if (response.success) {
        addResult('✅ API call successful - Access token was refreshed automatically');
        toast.success('Access token was refreshed successfully!');
      }
    } catch (error) {
      addResult(`❌ API call failed: ${(error as Error).message}`);
      toast.error('API call failed: ' + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const testRefreshTokenExpiry = async () => {
    setIsTesting(true);
    addResult('Testing refresh token expiry...');
    
    try {
      // Try to refresh token manually
      await apiService.refreshToken();
      addResult('✅ Token refresh successful');
      toast.success('Token refresh successful');
    } catch (error) {
      addResult(`❌ Token refresh failed: ${(error as Error).message}`);
      toast.error('Token refresh failed: ' + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const checkAuthStatus = () => {
    addResult(`Auth Status - Authenticated: ${isAuthenticated}, User: ${user?.name || 'None'}`);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Token Test</CardTitle>
          <CardDescription>
            Please login first to test access token behavior
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Access Token Expiry Test</CardTitle>
          <CardDescription>
            Test what happens when access tokens expire vs refresh tokens expire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Current Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="space-y-1 text-sm">
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user?.name}</p>
              <p>Access Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</p>
              <p>Refresh Token: Handled by HttpOnly Cookie</p>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                'Test Access Token Expiry'
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

            <Button 
              onClick={checkAuthStatus} 
              disabled={isTesting}
              variant="secondary"
            >
              Check Auth Status
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Test Results:</h3>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">No test results yet. Run a test to see results.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expected Behavior */}
          <Alert>
            <AlertDescription>
              <strong>Expected Behavior:</strong>
              <br />
              • <strong>Access Token Expiry:</strong> API call should automatically refresh token using refresh token cookie. User should stay logged in.
              <br />
              • <strong>Refresh Token Expiry:</strong> User should be automatically logged out.
              <br />
              • <strong>Current Issue:</strong> We're investigating why access token expiry might cause logout.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
