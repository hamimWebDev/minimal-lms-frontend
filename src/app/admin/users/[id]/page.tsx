'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUserById, changeUserRole, changeUserStatus, deleteUser, deleteAdmin } from '@/store/slices/userSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser, isLoading } = useAppSelector((state) => state.user);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
  }, [dispatch, userId]);

  const handleRoleChange = async (newRole: string) => {
    if (!currentUser) return;
    
    try {
      setIsUpdating(true);
      await dispatch(changeUserRole({ id: currentUser._id, role: newRole })).unwrap();
      toast.success('User role updated successfully');
      dispatch(fetchUserById(userId)); // Refresh user data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user role';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!currentUser) return;
    
    try {
      setIsUpdating(true);
      await dispatch(changeUserStatus({ id: currentUser._id, status: newStatus })).unwrap();
      toast.success('User status updated successfully');
      dispatch(fetchUserById(userId)); // Refresh user data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    
    try {
      if (currentUser.role === 'admin' || currentUser.role === 'superAdmin') {
        await dispatch(deleteAdmin(currentUser._id)).unwrap();
        toast.success('Admin deleted successfully');
      } else {
        await dispatch(deleteUser(currentUser._id)).unwrap();
        toast.success('User deleted successfully');
      }
      router.push('/admin/users');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <LoadingSpinner size={48} />
        </div>
      </MainLayout>
    );
  }

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              User Not Found
            </h2>
                                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                        The user you&apos;re looking for doesn&apos;t exist or has been deleted.
                      </p>
            <Button onClick={() => router.push('/admin/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/users')}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    User Details
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    View and manage user information
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push(`/admin/users/${userId}/edit`)}
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isUpdating}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentUser.role === 'admin' || currentUser.role === 'superAdmin' ? (
                      <Shield className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                    {currentUser.name}
                  </CardTitle>
                  <CardDescription>
                    User ID: {currentUser._id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Joined</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(currentUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={currentUser.role === 'superAdmin' ? "default" : currentUser.role === 'admin' ? "secondary" : "outline"}>
                      {currentUser.role === 'superAdmin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    <Badge variant={currentUser.status === 'in-progress' ? "default" : "destructive"}>
                      {currentUser.status === 'in-progress' ? 'Active' : 'Blocked'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-4">
              {/* Role Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role Management</CardTitle>
                  <CardDescription>Change user role and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Role: {currentUser.role}</p>
                    <div className="space-y-2">
                      {currentUser.role !== 'user' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange('user')}
                          disabled={isUpdating}
                          className="w-full justify-start"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Make User
                          {isUpdating && <LoadingSpinner size={12} className="ml-2" />}
                        </Button>
                      )}
                      {currentUser.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange('admin')}
                          disabled={isUpdating}
                          className="w-full justify-start"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                          {isUpdating && <LoadingSpinner size={12} className="ml-2" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Management</CardTitle>
                  <CardDescription>Activate or block user account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Status: {currentUser.status}</p>
                    {currentUser.status === 'in-progress' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange('blocked')}
                        disabled={isUpdating}
                        className="w-full"
                      >
                        Block User
                        {isUpdating && <LoadingSpinner size={12} className="ml-2" />}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange('in-progress')}
                        disabled={isUpdating}
                        className="w-full"
                      >
                        Activate User
                        {isUpdating && <LoadingSpinner size={12} className="ml-2" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function UserDetailPageWrapper() {
  return (
    <AdminRoute>
      <UserDetailPage />
    </AdminRoute>
  );
}
