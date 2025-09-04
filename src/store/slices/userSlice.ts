import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/lib/api';
import { logout } from './authSlice';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'superAdmin';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: User[];
  admins: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  admins: [],
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsers();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchAdmins = createAsyncThunk(
  'user/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getAdmins();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admins');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const changeUserRole = createAsyncThunk(
  'user/changeUserRole',
  async ({ id, role }: { id: string; role: string }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiService.changeUserRole(id, role);
      
      // Check if the current logged-in user's role was changed
      const currentUser = (getState() as any).auth.user;
      if (currentUser && currentUser._id === id) {
        // If current user's role was changed, logout immediately
        dispatch(logout());
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change user role');
    }
  }
);

export const changeUserStatus = createAsyncThunk(
  'user/changeUserStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiService.changeUserStatus(id, status);
      
      // Check if the current logged-in user's status was changed
      const currentUser = (getState() as any).auth.user;
      if (currentUser && currentUser._id === id) {
        // If current user's status was changed to blocked, logout immediately
        if (status === 'blocked') {
          dispatch(logout());
        }
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiService.deleteUser(id);
      
      // Check if the current logged-in user was deleted
      const currentUser = (getState() as any).auth.user;
      if (currentUser && currentUser._id === id) {
        // If current user was deleted, logout immediately
        dispatch(logout());
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  'user/deleteAdmin',
  async (id: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiService.deleteAdmin(id);
      
      // Check if the current logged-in user was deleted
      const currentUser = (getState() as any).auth.user;
      if (currentUser && currentUser._id === id) {
        // If current user was deleted, logout immediately
        dispatch(logout());
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete admin');
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiService.createUser(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, ...userData }: { id: string } & Partial<User>, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await apiService.updateUser(id, userData);
      
      // Check if the current logged-in user was updated
      const currentUser = (getState() as any).auth.user;
      if (currentUser && currentUser._id === id) {
        // If current user's role or status was changed, logout immediately
        if (userData.role || userData.status === 'blocked') {
          dispatch(logout());
        }
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch admins
      .addCase(fetchAdmins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Change user role
      .addCase(changeUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        const updatedUser = action.payload;
        
        // Remove user from both arrays first to avoid duplicates
        state.users = state.users.filter(user => user._id !== updatedUser._id);
        state.admins = state.admins.filter(admin => admin._id !== updatedUser._id);
        
        // Add user to appropriate array based on new role
        if (updatedUser.role === 'admin' || updatedUser.role === 'superAdmin') {
          state.admins.push(updatedUser);
        } else {
          state.users.push(updatedUser);
        }
      })
      // Change user status
      .addCase(changeUserStatus.fulfilled, (state, action: PayloadAction<User>) => {
        // Update user in users array
        const userIndex = state.users.findIndex(user => user._id === action.payload._id);
        if (userIndex !== -1) {
          state.users[userIndex] = action.payload;
        }
        // Update user in admins array
        const adminIndex = state.admins.findIndex(admin => admin._id === action.payload._id);
        if (adminIndex !== -1) {
          state.admins[adminIndex] = action.payload;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users = state.users.filter(user => user._id !== action.payload._id);
      })
      // Delete admin
      .addCase(deleteAdmin.fulfilled, (state, action: PayloadAction<User>) => {
        state.admins = state.admins.filter(admin => admin._id !== action.payload._id);
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        // Add to appropriate array based on role
        if (action.payload.role === 'admin' || action.payload.role === 'superAdmin') {
          state.admins.push(action.payload);
        } else {
          state.users.push(action.payload);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        const updatedUser = action.payload;
        
        // Update user in users array
        const userIndex = state.users.findIndex(user => user._id === updatedUser._id);
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser;
        }
        
        // Update user in admins array
        const adminIndex = state.admins.findIndex(admin => admin._id === updatedUser._id);
        if (adminIndex !== -1) {
          state.admins[adminIndex] = updatedUser;
        }
        
        // Update currentUser if it's the same user
        if (state.currentUser && state.currentUser._id === updatedUser._id) {
          state.currentUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
