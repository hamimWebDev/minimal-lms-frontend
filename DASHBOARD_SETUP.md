# Role-Based Dashboard System

This document explains how the role-based dashboard system works in the Minimal LMS frontend.

## Overview

The system automatically redirects users to different dashboards based on their role:
- **Admin/SuperAdmin users** → `/dashboard/admin` (Admin Dashboard)
- **Regular users** → `/dashboard/user` (User Dashboard)
- **Unauthenticated users** → `/auth/login`

## Dashboard Routes

### Main Dashboard (`/dashboard`)
- Acts as a router that redirects users to their appropriate dashboard
- Shows loading spinner while redirecting
- No direct content display

### Admin Dashboard (`/dashboard/admin`)
- **Access**: Only admin and superAdmin users
- **Features**:
  - Platform statistics (total courses, published/draft courses, user count)
  - Quick actions (create course, manage users, create blog, analytics)
  - Recent courses management with edit/view options
  - System overview (platform status, storage usage, active users)
  - Course management tools

### User Dashboard (`/dashboard/user`)
- **Access**: Only regular users (not admin/superAdmin)
- **Features**:
  - Learning statistics (courses enrolled, completed, hours learned, certificates)
  - Overall progress tracking
  - Enrolled courses with progress bars
  - Learning goals and achievements
  - Recommended courses

## Role-Based Access Control

### ProtectedRoute Component
Located at `src/components/auth/ProtectedRoute.tsx`, this component provides:

- **ProtectedRoute**: Generic route protection with role-based access
- **AdminRoute**: Only allows admin and superAdmin users
- **UserRoute**: Only allows regular users
- **SuperAdminRoute**: Only allows superAdmin users

### Usage Example
```tsx
import { AdminRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}
```

## Navigation Updates

### Header Component
The header now shows:
- Role badges (Admin, Super Admin, user)
- Role-specific dashboard links
- Admin-specific navigation items (Manage Courses, Manage Users)

### Mobile Menu
- Responsive design with role-based navigation
- Different dashboard links based on user role
- Admin-specific quick actions

## Authentication Flow

1. User logs in and receives role information
2. Main dashboard (`/dashboard`) checks user role
3. Automatic redirect to appropriate dashboard:
   - Admin users → `/dashboard/admin`
   - Regular users → `/dashboard/user`
4. Each dashboard is protected by role-specific route guards

## Backend Integration

The dashboards integrate with the backend API endpoints:
- **Admin Dashboard**: Fetches all courses (published and draft)
- **User Dashboard**: Fetches only published courses and user progress
- Role-based API access follows the backend middleware structure

## Security Features

- **Route Protection**: Unauthorized access attempts are redirected
- **Role Validation**: Frontend and backend both validate user roles
- **Automatic Redirects**: Users are always sent to their appropriate dashboard
- **Session Management**: Proper token handling and refresh mechanisms

## Customization

### Adding New Admin Features
1. Create new admin pages in `/app/admin/`
2. Use `AdminRoute` component for protection
3. Add navigation links in the header
4. Update the admin dashboard quick actions

### Adding New User Features
1. Create new user pages in `/app/dashboard/user/`
2. Use `UserRoute` component for protection
3. Add navigation links as needed

### Role-Based Components
```tsx
// Show different content based on role
{isAdmin ? <AdminContent /> : <UserContent />}

// Conditional rendering
{user?.role === 'superAdmin' && <SuperAdminFeatures />}
```

## Testing

### Admin Access
1. Login with admin credentials
2. Should be redirected to `/dashboard/admin`
3. Should see admin-specific features and navigation

### User Access
1. Login with regular user credentials
2. Should be redirected to `/dashboard/user`
3. Should see user-specific features and navigation

### Unauthorized Access
1. Try to access `/dashboard/admin` as regular user
2. Should be redirected to `/dashboard/user`
3. Try to access `/dashboard/user` as admin
4. Should be redirected to `/dashboard/admin`

## File Structure

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx              # Main dashboard router
│       ├── admin/
│       │   └── page.tsx          # Admin dashboard
│       └── user/
│           └── page.tsx          # User dashboard
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx   # Route protection
│   └── layout/
│       └── header.tsx            # Role-based navigation
└── store/
    └── slices/
        └── authSlice.ts          # User role management
```

## Future Enhancements

- **Dynamic Navigation**: Load navigation items from backend
- **Permission System**: Granular permissions beyond roles
- **Audit Logging**: Track dashboard access and actions
- **Custom Dashboards**: Allow users to customize their dashboard layout
- **Analytics**: Enhanced reporting and insights for admins
