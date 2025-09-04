'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Settings, BookOpen, Home, Shield, GraduationCap, PenTool, FileText } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Blog', href: '/blog', icon: BookOpen },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Minimal LMS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {isAdmin ? (user?.role === 'superAdmin' ? 'Super Admin' : 'Admin') : 'user'}
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    {isAdmin ? (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span>Learning Dashboard</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/admin/courses')}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Manage Courses</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/admin/enrollment-requests')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Enrollment Requests</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/admin/blog')}>
                        <PenTool className="mr-2 h-4 w-4" />
                        <span>Manage Blogs</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Manage Users</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/dashboard/user/enrollment-requests')}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Requests</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign In
                </Button>
                <Button onClick={() => router.push('/auth/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  
                  {isAuthenticated ? (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center space-x-2 px-3 py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name} />
                            <AvatarFallback>
                              {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{user?.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {isAdmin ? (user?.role === 'superAdmin' ? 'Super Admin' : 'Admin') : 'user'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dashboard Link */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          router.push('/dashboard');
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        {isAdmin ? (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </>
                        ) : (
                          <>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Learning Dashboard
                          </>
                        )}
                      </Button>

                      {/* Admin-specific links */}
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              router.push('/admin/courses');
                              setIsMobileMenuOpen(false);
                            }}
                            className="justify-start"
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Manage Courses
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              router.push('/admin/blog');
                              setIsMobileMenuOpen(false);
                            }}
                            className="justify-start"
                          >
                            <PenTool className="mr-2 h-4 w-4" />
                            Manage Blogs
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              router.push('/admin/users');
                              setIsMobileMenuOpen(false);
                            }}
                            className="justify-start"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Manage Users
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        onClick={() => {
                          router.push('/profile');
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Profile
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2 pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          router.push('/auth/login');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          router.push('/auth/register');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
