'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createEnrollmentRequest } from '@/store/slices/enrollmentSlice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BookOpen, Send, CheckCircle, XCircle } from 'lucide-react';

interface EnrollmentRequestFormProps {
  courseId: string;
  courseTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EnrollmentRequestForm({ 
  courseId, 
  courseTitle, 
  onSuccess, 
  onCancel 
}: EnrollmentRequestFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.enrollment);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(createEnrollmentRequest({
        courseId,
        requestMessage: requestMessage.trim() || undefined,
      })).unwrap();
      
      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the slice
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-lg">Request Submitted!</CardTitle>
          <CardDescription>
            Your enrollment request has been sent to the admin for review.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            You will be notified once your request is approved or rejected.
          </p>
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <CardTitle>Request Course Access</CardTitle>
        </div>
        <CardDescription>
          Request access to "{courseTitle}" by filling out the form below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="requestMessage" className="text-sm font-medium">
              Message (Optional)
            </label>
            <Textarea
              id="requestMessage"
              placeholder="Tell us why you want to enroll in this course..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {requestMessage.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
