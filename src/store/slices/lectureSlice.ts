import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Lecture, LectureFilters } from '@/types';
import { apiService } from '@/lib/api';

interface LectureState {
  lectures: Lecture[];
  currentLecture: Lecture | null;
  isLoading: boolean;
  error: string | null;
  filters: LectureFilters;
}

const initialState: LectureState = {
  lectures: [],
  currentLecture: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchLectures = createAsyncThunk(
  'lecture/fetchLectures',
  async (filters: LectureFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getLectures(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lectures');
    }
  }
);

export const fetchLectureById = createAsyncThunk(
  'lecture/fetchLectureById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getLectureById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lecture');
    }
  }
);

export const createLecture = createAsyncThunk(
  'lecture/createLecture',
  async (lectureData: FormData | Partial<Lecture>, { rejectWithValue }) => {
    try {
      const response = await apiService.createLecture(lectureData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lecture');
    }
  }
);

export const updateLecture = createAsyncThunk(
  'lecture/updateLecture',
  async ({ id, data }: { id: string; data: FormData | Partial<Lecture> }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateLecture(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lecture');
    }
  }
);

export const deleteLecture = createAsyncThunk(
  'lecture/deleteLecture',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteLecture(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lecture');
    }
  }
);

export const fetchLecturesByModule = createAsyncThunk(
  'lecture/fetchLecturesByModule',
  async (moduleId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getLecturesByModule(moduleId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lectures by module');
    }
  }
);

const lectureSlice = createSlice({
  name: 'lecture',
  initialState,
  reducers: {
    setCurrentLecture: (state, action: PayloadAction<Lecture | null>) => {
      state.currentLecture = action.payload;
    },
    setFilters: (state, action: PayloadAction<LectureFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLectures: (state) => {
      state.lectures = [];
      state.currentLecture = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lectures
      .addCase(fetchLectures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLectures.fulfilled, (state, action: PayloadAction<Lecture[]>) => {
        state.isLoading = false;
        state.lectures = action.payload;
        state.error = null;
      })
      .addCase(fetchLectures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch lecture by ID
      .addCase(fetchLectureById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLectureById.fulfilled, (state, action: PayloadAction<Lecture>) => {
        state.isLoading = false;
        state.currentLecture = action.payload;
        state.error = null;
      })
      .addCase(fetchLectureById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create lecture
      .addCase(createLecture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLecture.fulfilled, (state, action: PayloadAction<Lecture>) => {
        state.isLoading = false;
        state.lectures.push(action.payload);
        state.error = null;
      })
      .addCase(createLecture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update lecture
      .addCase(updateLecture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLecture.fulfilled, (state, action: PayloadAction<Lecture>) => {
        state.isLoading = false;
        const index = state.lectures.findIndex(lecture => lecture._id === action.payload._id);
        if (index !== -1) {
          state.lectures[index] = action.payload;
        }
        if (state.currentLecture?._id === action.payload._id) {
          state.currentLecture = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLecture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete lecture
      .addCase(deleteLecture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLecture.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.lectures = state.lectures.filter(lecture => lecture._id !== action.payload);
        if (state.currentLecture?._id === action.payload) {
          state.currentLecture = null;
        }
        state.error = null;
      })
      .addCase(deleteLecture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch lectures by module
      .addCase(fetchLecturesByModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLecturesByModule.fulfilled, (state, action: PayloadAction<Lecture[]>) => {
        state.isLoading = false;
        // Replace lectures with the ones from the specific module
        state.lectures = action.payload;
        state.error = null;
      })
      .addCase(fetchLecturesByModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentLecture, setFilters, clearError, clearLectures } = lectureSlice.actions;
export default lectureSlice.reducer;
