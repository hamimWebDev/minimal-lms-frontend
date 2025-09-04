import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/lib/api';
import { EnrollmentRequest, EnrollmentStatus } from '@/types';

interface EnrollmentState {
  enrollmentRequests: EnrollmentRequest[];
  userEnrollmentRequests: EnrollmentRequest[];
  enrollmentStatus: EnrollmentStatus | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: EnrollmentState = {
  enrollmentRequests: [],
  userEnrollmentRequests: [],
  enrollmentStatus: null,
  isLoading: false,
  error: null,
  meta: null,
};

// Async thunks
export const createEnrollmentRequest = createAsyncThunk(
  'enrollment/createRequest',
  async (data: { courseId: string; requestMessage?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.createEnrollmentRequest(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create enrollment request');
    }
  }
);

export const fetchAllEnrollmentRequests = createAsyncThunk(
  'enrollment/fetchAllRequests',
  async (params: { status?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getAllEnrollmentRequests(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollment requests');
    }
  }
);

export const fetchUserEnrollmentRequests = createAsyncThunk(
  'enrollment/fetchUserRequests',
  async (params: { status?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserEnrollmentRequests();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user enrollment requests');
    }
  }
);

export const checkEnrollmentStatus = createAsyncThunk(
  'enrollment/checkStatus',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.checkEnrollmentStatus(courseId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check enrollment status');
    }
  }
);

export const updateEnrollmentRequest = createAsyncThunk(
  'enrollment/updateRequest',
  async ({ id, data }: { id: string; data: { status: string; adminResponse?: string } }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateEnrollmentRequest(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update enrollment request');
    }
  }
);

export const deleteEnrollmentRequest = createAsyncThunk(
  'enrollment/deleteRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteEnrollmentRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete enrollment request');
    }
  }
);

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEnrollmentStatus: (state) => {
      state.enrollmentStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create enrollment request
      .addCase(createEnrollmentRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEnrollmentRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userEnrollmentRequests.unshift(action.payload.data);
      })
      .addCase(createEnrollmentRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create enrollment request';
      })
      // Fetch all enrollment requests
      .addCase(fetchAllEnrollmentRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEnrollmentRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollmentRequests = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAllEnrollmentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch enrollment requests';
      })
      // Fetch user enrollment requests
      .addCase(fetchUserEnrollmentRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserEnrollmentRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userEnrollmentRequests = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchUserEnrollmentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user enrollment requests';
      })
      // Check enrollment status
      .addCase(checkEnrollmentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkEnrollmentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollmentStatus = action.payload.data;
      })
      .addCase(checkEnrollmentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to check enrollment status';
      })
      // Update enrollment request
      .addCase(updateEnrollmentRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEnrollmentRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedRequest = action.payload.data;
        
        // Update in enrollmentRequests array
        const index = state.enrollmentRequests.findIndex(req => req._id === updatedRequest._id);
        if (index !== -1) {
          state.enrollmentRequests[index] = updatedRequest;
        }
        
        // Update in userEnrollmentRequests array
        const userIndex = state.userEnrollmentRequests.findIndex(req => req._id === updatedRequest._id);
        if (userIndex !== -1) {
          state.userEnrollmentRequests[userIndex] = updatedRequest;
        }
      })
      .addCase(updateEnrollmentRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update enrollment request';
      })
      // Delete enrollment request
      .addCase(deleteEnrollmentRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEnrollmentRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        
        // Remove from enrollmentRequests array
        state.enrollmentRequests = state.enrollmentRequests.filter(req => req._id !== deletedId);
        
        // Remove from userEnrollmentRequests array
        state.userEnrollmentRequests = state.userEnrollmentRequests.filter(req => req._id !== deletedId);
      })
      .addCase(deleteEnrollmentRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete enrollment request';
      });
  },
});

export const { clearError, clearEnrollmentStatus } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
