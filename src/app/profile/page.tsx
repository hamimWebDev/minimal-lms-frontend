'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateUser } from '@/store/slices/userSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield, 
  BookOpen, 
  Award, 
  Settings,
  Camera,
  Save,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [isAuthenticated, router, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      await dispatch(updateUser({ id: user._id, ...data })).unwrap();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const stats = [
    {
      title: 'Courses Enrolled',
      value: '12',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Certificates',
      value: '8',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Hours Learned',
      value: '156',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => {
                    // TODO: Implement profile picture upload
                    toast.info('Profile picture upload coming soon');
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h1>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {user.email}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <span>Member since {new Date(user.createdAt).getFullYear()}</span>
                  <span>•</span>
                  <span>Status: {user.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-gray-700`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Profile Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal information and profile details
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isSubmitting}
                    >
                      {isEditing ? (
                        <>
                          <Settings className="mr-2 h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            placeholder="Enter your full name"
                            className="pl-10"
                            disabled={!isEditing || isSubmitting}
                            {...register('name')}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            disabled={!isEditing || isSubmitting}
                            {...register('email')}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            reset({
                              name: user.name,
                              email: user.email,
                            });
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Change Password
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Update your password to keep your account secure
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        disabled={isChangingPassword}
                      >
                        {showPasswordForm ? 'Cancel' : 'Change'}
                      </Button>
                    </div>
                    
                    {showPasswordForm && (
                      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <form className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                placeholder="Enter current password"
                                disabled={isChangingPassword}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                disabled={isChangingPassword}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Confirm new password"
                              disabled={isChangingPassword}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              disabled={isChangingPassword}
                              onClick={() => {
                                // TODO: Implement password change
                                toast.info('Password change functionality coming soon');
                              }}
                            >
                              {isChangingPassword ? (
                                <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Changing...
                                </>
                              ) : (
                                'Update Password'
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setShowPasswordForm(false)}
                              disabled={isChangingPassword}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Login Sessions
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Manage your active login sessions
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your learning experience and notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Receive updates about new courses and progress
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Learning Reminders
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Set up reminders to continue your learning
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
