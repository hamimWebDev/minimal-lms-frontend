import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterData } from '@/types';
import { apiService } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiService.refreshToken();
      
      // Update localStorage with new access token (refresh token is handled by cookie)
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      // Clear auth state on refresh failure (refresh token expired)
      dispatch(logoutUser());
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAll = createAsyncThunk(
  'auth/logoutAll',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logoutAll();
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout from all devices failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initialize auth state from localStorage
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    if (typeof window === 'undefined') return;
    
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Set the initial state from localStorage
        dispatch(setCredentials({ user, accessToken }));
        
        // Verify the token is still valid and user status hasn't changed
        try {
          const response = await apiService.getUserById(user._id);
          const currentUser = response.data;
          
          // Check if user status or role has changed
          if (currentUser.status !== user.status || currentUser.role !== user.role) {
            // User status or role changed, logout immediately
            dispatch(logoutUser());
            return null;
          }
          
          // Update user data if anything else changed
          if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
            dispatch(setUser(currentUser));
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
          
          return { user: currentUser, accessToken };
        } catch (error) {
          // If API call fails, try to refresh token first
          try {
            await dispatch(refreshToken()).unwrap();
            // If refresh successful, return the current state
            return { user, accessToken: localStorage.getItem('accessToken') };
          } catch (refreshError) {
            // If refresh also fails, then logout
            dispatch(logoutUser());
            return null;
          }
        }
      } catch (error) {
        // If parsing fails, clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        // If action.payload is null, user is not authenticated
        if (!action.payload) {
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
        }
        // Note: If action.payload exists, the state is already set by setCredentials in the thunk
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.error = null;
        // Don't set authenticated on register, user needs to login
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Save to localStorage (refresh token is handled by cookie)
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', action.payload.accessToken);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Update localStorage (refresh token is handled by cookie)
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', action.payload.accessToken);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Clear auth state on refresh failure (refresh token expired)
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout all
      .addCase(logoutAll.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAll.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      })
      .addCase(logoutAll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
