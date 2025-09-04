'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { register as registerUser } from '@/store/slices/authSlice';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    // Only redirect if auth is initialized and user is authenticated
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Dispatch the registration action
      const result = await dispatch(registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })).unwrap();

      // Registration successful
      toast.success('Account created successfully! Please sign in.');
      reset();
      router.push('/auth/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while initializing auth
  if (!isInitialized) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <LoadingSpinner size={48} />
        </div>
      </MainLayout>
    );
  }

  // Don't show register form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Join our community
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Create your account and start your learning journey today
              </p>
            </div>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center">Create account</CardTitle>
              <CardDescription className="text-center">
                Fill in your details below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {submitError && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertDescription className="text-red-800 dark:text-red-200">{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className={cn(
                        "pl-10 h-11 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700",
                        "focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        "transition-all duration-200",
                        errors.name && "border-red-300 focus:ring-red-500 focus:border-red-500"
                      )}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className={cn(
                        "pl-10 h-11 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700",
                        "focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        "transition-all duration-200",
                        errors.email && "border-red-300 focus:ring-red-500 focus:border-red-500"
                      )}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className={cn(
                        "pl-10 pr-10 h-11 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700",
                        "focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        "transition-all duration-200",
                        errors.password && "border-red-300 focus:ring-red-500 focus:border-red-500"
                      )}
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className={cn(
                        "pl-10 pr-10 h-11 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700",
                        "focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        "transition-all duration-200",
                        errors.confirmPassword && "border-red-300 focus:ring-red-500 focus:border-red-500"
                      )}
                      {...register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size={16} className="text-white" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Create account</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="border-0 shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
                  Why join our platform?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Access to premium courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Learn at your own pace</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Expert instructors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Certificate upon completion</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
