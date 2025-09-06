export type UserRole = "user" | "admin" | "superAdmin";
export type UserStatus = 'in-progress' | 'blocked';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  title: string;
  price: number;
  description: string;
  thumbnail: string;
  instructor?: string;
  duration?: number;
  level?: CourseLevel;
  category?: string;
  isPublished?: boolean;
  enrollmentStatus?: 'pending' | 'approved' | 'rejected' | null;
  hasEnrollmentRequest?: boolean;
  modulesCount?: number;
  totalDuration?: number;
  enrollmentCount?: number;
  approvedEnrollmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  _id: string;
  title: string;
  moduleNumber: number;
  courseId: string;
  description?: string;
  isPublished?: boolean;
  lecturesCount?: number;
  totalDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lecture {
  _id: string;
  title: string;
  moduleId: string;
  courseId?: string; // Virtual field from module lookup
  videoUrl?: string;
  pdfNotes?: string[];
  duration?: number;
  order: number;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface EnrollmentRequest {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
  };
  courseId: string | {
    _id: string;
    title: string;
    thumbnail: string;
    description?: string;
    instructor?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestMessage?: string;
  adminResponse?: string;
  approvedBy?: string | {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy field names for backward compatibility
  course?: {
    _id: string;
    title: string;
    thumbnail: string;
    description?: string;
    instructor?: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedByUser?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface EnrollmentStatus {
  hasRequest: boolean;
  status: 'pending' | 'approved' | 'rejected' | null;
  request: EnrollmentRequest | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  isPublished?: boolean;
}

export interface ModuleFilters {
  courseId?: string;
  search?: string;
  isPublished?: boolean;
}

export interface LectureFilters {
  moduleId?: string;
  courseId?: string;
  search?: string;
  isPublished?: boolean;
}
