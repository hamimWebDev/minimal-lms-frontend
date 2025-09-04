import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { fetchCourses, fetchCourseById } from '@/store/slices/courseSlice';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for course data with automatic fetching
export const useCourses = (filters?: any) => {
  const dispatch = useAppDispatch();
  const { courses, isLoading, error, filters: currentFilters } = useAppSelector((state) => state.course);
  
  return {
    courses,
    isLoading,
    error,
    filters: currentFilters,
    refetch: () => dispatch(fetchCourses(filters)),
  };
};

// Custom hook for user authentication state
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

// Custom hook for course details
export const useCourse = (courseId: string) => {
  const dispatch = useAppDispatch();
  const { currentCourse, isLoading, error } = useAppSelector((state) => state.course);
  
  return {
    course: currentCourse,
    isLoading,
    error,
    refetch: () => dispatch(fetchCourseById(courseId)),
  };
};
