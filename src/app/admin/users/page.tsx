'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUsers, fetchAdmins, changeUserRole, changeUserStatus, deleteUser, deleteAdmin } from '@/store/slices/userSlice';
import type { User } from '@/store/slices/userSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function UsersManagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, admins, isLoading } = useAppSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'superAdmin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-progress' | 'blocked'>('all');
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchUsers()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Loaded ${(result.payload as User[])?.length || 0} users`);
      } else if (result.meta.requestStatus === 'rejected') {
        toast.error('Failed to load users');
      }
    });
    
    dispatch(fetchAdmins()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Loaded ${(result.payload as User[])?.length || 0} admins`);
      } else if (result.meta.requestStatus === 'rejected') {
        toast.error('Failed to load admins');
      }
    });
  }, [dispatch]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingUsers(prev => new Set(prev).add(userId));
      await dispatch(changeUserRole({ id: userId, role: newRole })).unwrap();
      toast.success('User role updated successfully');
      
      // Refresh user lists to ensure proper state
      dispatch(fetchUsers());
      dispatch(fetchAdmins());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user role';
      toast.error(errorMessage);
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setUpdatingUsers(prev => new Set(prev).add(userId));
      await dispatch(changeUserStatus({ id: userId, status: newStatus })).unwrap();
      toast.success('User status updated successfully');
      
      // Refresh user lists to ensure proper state
      dispatch(fetchUsers());
      dispatch(fetchAdmins());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      toast.error(errorMessage);
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success('User deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await dispatch(deleteAdmin(adminId)).unwrap();
      toast.success('Admin deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete admin';
      toast.error(errorMessage);
    }
  };

  // Combine all users and admins into a single array for better filtering
  const allUsersCombined = [...users, ...admins];
  
  // Remove duplicates (in case a user appears in both arrays during role changes)
  const uniqueUsers = allUsersCombined.filter((user, index, self) => 
    index === self.findIndex(u => u._id === user._id)
  );
  
  // Apply filters to the combined array
  const filteredUsers = uniqueUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <Button 
                onClick={() => router.push('/admin/users/create')}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | 'user' | 'admin' | 'superAdmin')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'in-progress' | 'blocked')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="in-progress">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setFilterStatus('all');
                  }}
                  className="w-full sm:w-auto"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {isLoading ? (
                <div className="flex justify-center py-8 sm:py-12">
                  <LoadingSpinner size={40} className="sm:hidden" />
                  <LoadingSpinner size={48} className="hidden sm:block" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' || user.role === 'superAdmin' ? (
                              <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            ) : (
                              <UserIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            )}
                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                              {user.name}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <Badge variant={user.role === 'superAdmin' ? "default" : user.role === 'admin' ? "secondary" : "outline"} className="text-xs px-2 py-1">
                              {user.role === 'superAdmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                            <Badge variant={user.status === 'in-progress' ? "default" : "destructive"} className="text-xs px-2 py-1">
                              {user.status === 'in-progress' ? 'Active' : 'Blocked'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/users/${user._id}`)}
                          className="flex-1 sm:flex-none text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                              disabled={updatingUsers.has(user._id)}
                            >
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline ml-2">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user._id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            {user.role !== 'user' && (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(user._id, 'user')}
                                disabled={updatingUsers.has(user._id)}
                              >
                                                              <UserIcon className="h-4 w-4 mr-2" />
                              Make User
                                {updatingUsers.has(user._id) && <LoadingSpinner size={12} className="ml-2" />}
                              </DropdownMenuItem>
                            )}
                            {user.role !== 'admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(user._id, 'admin')}
                                disabled={updatingUsers.has(user._id)}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                                {updatingUsers.has(user._id) && <LoadingSpinner size={12} className="ml-2" />}
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            {user.status === 'in-progress' ? (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(user._id, 'blocked')}
                                disabled={updatingUsers.has(user._id)}
                              >
                                Block User
                                {updatingUsers.has(user._id) && <LoadingSpinner size={12} className="ml-2" />}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(user._id, 'in-progress')}
                                disabled={updatingUsers.has(user._id)}
                              >
                                Activate User
                                {updatingUsers.has(user._id) && <LoadingSpinner size={12} className="ml-2" />}
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                if (user.role === 'admin' || user.role === 'superAdmin') {
                                  handleDeleteAdmin(user._id);
                                } else {
                                  handleDeleteUser(user._id);
                                }
                              }}
                              className="text-red-600"
                              disabled={updatingUsers.has(user._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                    No users found matching your criteria
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterRole('all');
                      setFilterStatus('all');
                    }}
                    className="w-full sm:w-auto"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default function UsersPage() {
  return (
    <AdminRoute>
      <UsersManagementPage />
    </AdminRoute>
  );
}
