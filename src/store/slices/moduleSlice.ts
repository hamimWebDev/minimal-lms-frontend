import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Module, ModuleFilters } from '@/types';
import { apiService } from '@/lib/api';

interface ModuleState {
  modules: Module[];
  currentModule: Module | null;
  isLoading: boolean;
  error: string | null;
  filters: ModuleFilters;
}

const initialState: ModuleState = {
  modules: [],
  currentModule: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchModules = createAsyncThunk(
  'module/fetchModules',
  async (filters: ModuleFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getModules(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
);

export const fetchModuleById = createAsyncThunk(
  'module/fetchModuleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getModuleById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch module');
    }
  }
);

export const createModule = createAsyncThunk(
  'module/createModule',
  async (moduleData: Partial<Module>, { rejectWithValue }) => {
    try {
      const response = await apiService.createModule(moduleData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create module');
    }
  }
);

export const updateModule = createAsyncThunk(
  'module/updateModule',
  async ({ id, data }: { id: string; data: Partial<Module> }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateModule(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update module');
    }
  }
);

export const deleteModule = createAsyncThunk(
  'module/deleteModule',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteModule(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete module');
    }
  }
);

export const fetchModulesByCourse = createAsyncThunk(
  'module/fetchModulesByCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getModulesByCourse(courseId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch modules by course');
    }
  }
);

const moduleSlice = createSlice({
  name: 'module',
  initialState,
  reducers: {
    setCurrentModule: (state, action: PayloadAction<Module | null>) => {
      state.currentModule = action.payload;
    },
    setFilters: (state, action: PayloadAction<ModuleFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearModules: (state) => {
      state.modules = [];
      state.currentModule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch modules
      .addCase(fetchModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action: PayloadAction<Module[]>) => {
        state.isLoading = false;
        state.modules = action.payload;
        state.error = null;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch module by ID
      .addCase(fetchModuleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleById.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        state.currentModule = action.payload;
        state.error = null;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create module
      .addCase(createModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        state.modules.push(action.payload);
        state.error = null;
      })
      .addCase(createModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update module
      .addCase(updateModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        const index = state.modules.findIndex(module => module._id === action.payload._id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.currentModule?._id === action.payload._id) {
          state.currentModule = action.payload;
        }
        state.error = null;
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete module
      .addCase(deleteModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.modules = state.modules.filter(module => module._id !== action.payload);
        if (state.currentModule?._id === action.payload) {
          state.currentModule = null;
        }
        state.error = null;
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch modules by course
      .addCase(fetchModulesByCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModulesByCourse.fulfilled, (state, action: PayloadAction<Module[]>) => {
        state.isLoading = false;
        state.modules = action.payload;
        state.error = null;
      })
      .addCase(fetchModulesByCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentModule, setFilters, clearError, clearModules } = moduleSlice.actions;
export default moduleSlice.reducer;
