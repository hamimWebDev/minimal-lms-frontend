import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/store/slices/authSlice';
import { apiService } from '@/lib/api';

export const useSessionValidation = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Validate session every 5 minutes
    const validateSession = async () => {
      try {
        const response = await apiService.getUserById(user._id);
        const currentUser = response.data;
        
        // Check if user status or role has changed
        if (currentUser.status !== user.status || currentUser.role !== user.role) {
          // User status or role changed, logout immediately
          dispatch(logout());
          return;
        }
        
        // Check if user was deleted
        if (currentUser.isDeleted) {
          dispatch(logout());
          return;
        }
      } catch (error) {
        // User not found or token invalid, logout
        dispatch(logout());
      }
    };

    // Initial validation
    validateSession();

    // Set up periodic validation every 5 minutes
    intervalRef.current = setInterval(validateSession, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, user, isAuthenticated]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
