'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { 
  fetchAllEnrollmentRequests, 
  updateEnrollmentRequest,
  deleteEnrollmentRequest 
} from '@/store/slices/enrollmentSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  User,
  Calendar,
  MessageSquare,
  Trash2,
  Eye
} from 'lucide-react';
import Image from 'next/image';

export function EnrollmentRequestsAdmin() {
  const dispatch = useAppDispatch();
  const { enrollmentRequests, isLoading, error } = useAppSelector((state) => state.enrollment);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    dispatch(fetchAllEnrollmentRequests());
  }, [dispatch]);

  const handleApprove = async (requestId: string) => {
    setIsUpdating(true);
    try {
      await dispatch(updateEnrollmentRequest({
        id: requestId,
        data: { 
          status: 'approved',
          adminResponse: adminResponse.trim() || undefined
        }
      })).unwrap();
      setSelectedRequest(null);
      setAdminResponse('');
    } catch (error) {
      // Error handled by slice
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsUpdating(true);
    try {
      await dispatch(updateEnrollmentRequest({
        id: requestId,
        data: { 
          status: 'rejected',
          adminResponse: adminResponse.trim() || undefined
        }
      })).unwrap();
      setSelectedRequest(null);
      setAdminResponse('');
    } catch (error) {
      // Error handled by slice
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Request',
      message: 'Are you sure you want to delete this request?',
      onConfirm: async () => {
        await dispatch(deleteEnrollmentRequest(requestId));
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enrollment Requests</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage course enrollment requests from users
          </p>
        </div>
        <Button onClick={() => dispatch(fetchAllEnrollmentRequests())}>
          Refresh
        </Button>
      </div>

      {enrollmentRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">No enrollment requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {enrollmentRequests.map((request) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                        <Image
                          src={request.courseId?.thumbnail || '/placeholder-course.jpg'}
                          alt={request.courseId?.title || 'Course'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{request.courseId?.title || 'Course'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Requested by {request.userId?.name || 'Unknown User'} ({request.userId?.email || 'No email'})
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {request.requestMessage && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">User's Message:</span>
                        </div>
                        <p className="text-sm">{request.requestMessage}</p>
                      </div>
                    )}

                    {request.adminResponse && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Admin Response:</span>
                        </div>
                        <p className="text-sm">{request.adminResponse}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      {request.approvedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Approved: {new Date(request.approvedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <div className="flex gap-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowReviewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApprove(request._id)}
                            disabled={isUpdating}
                            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            {isUpdating ? <LoadingSpinner size={16} /> : <CheckCircle className="h-4 w-4 mr-1" />}
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReject(request._id)}
                            disabled={isUpdating}
                            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            {isUpdating ? <LoadingSpinner size={16} /> : <XCircle className="h-4 w-4 mr-1" />}
                            Reject
                          </Button>
                        </div>
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(request._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Enrollment Request</DialogTitle>
            <DialogDescription>
              Review and respond to the enrollment request for "{selectedRequest?.courseId?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Response (Optional)</label>
              <Textarea
                placeholder="Add a response message..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  handleApprove(selectedRequest._id);
                  setShowReviewDialog(false);
                }}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? <LoadingSpinner size={16} /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Approve
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  handleReject(selectedRequest._id);
                  setShowReviewDialog(false);
                }}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? <LoadingSpinner size={16} /> : <XCircle className="h-4 w-4 mr-1" />}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
