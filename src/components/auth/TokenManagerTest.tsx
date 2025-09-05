'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { tokenManager } from '@/utils/tokenManager';
import { apiService } from '@/lib/api';

export const TokenManagerTest: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const checkTokenStatus = () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setTokenStatus({ error: 'No access token found' });
      addResult('No access token found');
      return;
    }

    const isExpired = tokenManager.isTokenExpired(accessToken);
    const expirationTime = tokenManager.getTokenExpiration(accessToken);
    const timeUntilExpiration = tokenManager.getTimeUntilExpiration(accessToken);

    const status = {
      isExpired,
      expirationTime: expirationTime?.toISOString(),
      timeUntilExpiration: `${timeUntilExpiration} minutes`,
      willExpireSoon: timeUntilExpiration <= 5
    };

    setTokenStatus(status);
    addResult(`Token Status: ${JSON.stringify(status)}`);
  };

  const testTokenRefresh = async () => {
    setIsTesting(true);
    addResult('Testing token refresh...');
    
    try {
      const newToken = await tokenManager.refreshTokenIfNeeded();
      
      if (newToken) {
        addResult('✅ Token refresh successful');
        toast.success('Token refreshed successfully!');
        checkTokenStatus(); // Update status
      } else {
        addResult('ℹ️ Token refresh not needed');
        toast.info('Token is still valid, no refresh needed');
      }
    } catch (error) {
      addResult(`❌ Token refresh failed: ${(error as Error).message}`);
      toast.error('Token refresh failed: ' + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const testApiCall = async () => {
    setIsTesting(true);
    addResult('Testing API call with automatic token refresh...');
    
    try {
      const response = await apiService.getUserById(user?._id || '');
      
      if (response.success) {
        addResult('✅ API call successful');
        toast.success('API call successful!');
        checkTokenStatus(); // Update status
      }
    } catch (error) {
      addResult(`❌ API call failed: ${(error as Error).message}`);
      toast.error('API call failed: ' + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const simulateExpiredToken = () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      toast.error('No access token to simulate expiry');
      return;
    }

    // Create a fake expired token by modifying the existing one
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        // Decode payload
        const payload = JSON.parse(atob(parts[1]));
        // Set expiration to past time
        payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
        // Re-encode
        const newPayload = btoa(JSON.stringify(payload));
        const fakeExpiredToken = `${parts[0]}.${newPayload}.${parts[2]}`;
        
        localStorage.setItem('accessToken', fakeExpiredToken);
        addResult('Simulated expired access token');
        toast.info('Simulated expired access token');
        checkTokenStatus();
      }
    } catch (error) {
      toast.error('Failed to simulate expired token');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Check token status on component mount
  useEffect(() => {
    if (isAuthenticated) {
      checkTokenStatus();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Manager Test</CardTitle>
          <CardDescription>
            Please login first to test token manager functionality
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Manager Test</CardTitle>
          <CardDescription>
            Test JWT token expiration checking and automatic refresh functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Current Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Current Token Status</h3>
            {tokenStatus ? (
              <div className="space-y-1 text-sm">
                <p>Expired: {tokenStatus.isExpired ? 'Yes' : 'No'}</p>
                <p>Expiration Time: {tokenStatus.expirationTime}</p>
                <p>Time Until Expiration: {tokenStatus.timeUntilExpiration}</p>
                <p>Will Expire Soon: {tokenStatus.willExpireSoon ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p className="text-gray-500">Click "Check Token Status" to see details</p>
            )}
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={checkTokenStatus} 
              disabled={isTesting}
              variant="outline"
            >
              Check Token Status
            </Button>
            
            <Button 
              onClick={testTokenRefresh} 
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size={16} />
                  <span>Testing...</span>
                </div>
              ) : (
                'Test Token Refresh'
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testApiCall} 
              disabled={isTesting}
              variant="secondary"
            >
              {isTesting ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size={16} />
                  <span>Testing...</span>
                </div>
              ) : (
                'Test API Call'
              )}
            </Button>

            <Button 
              onClick={simulateExpiredToken} 
              disabled={isTesting}
              variant="destructive"
            >
              Simulate Expired Token
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

          {/* Features */}
          <Alert>
            <AlertDescription>
              <strong>Token Manager Features:</strong>
              <br />
              • <strong>JWT Expiration Check:</strong> Checks if token is expired or will expire soon
              <br />
              • <strong>Automatic Refresh:</strong> Refreshes token before it expires
              <br />
              • <strong>LocalStorage Update:</strong> Automatically updates localStorage with new token
              <br />
              • <strong>Error Handling:</strong> Handles refresh failures and logout
              <br />
              • <strong>Singleton Pattern:</strong> Prevents multiple simultaneous refresh calls
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
