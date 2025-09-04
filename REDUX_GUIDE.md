# Redux Data Fetching Guide

This guide explains how to properly use Redux for data fetching in the Minimal LMS Frontend.

## 🎯 Core Concepts

### 1. Redux Store Structure
```typescript
// Store configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,        // User authentication
    course: courseReducer,    // Course management
    module: moduleReducer,    // Course modules
    lecture: lectureReducer,  // Course lectures
    progress: progressReducer, // Learning progress
    blog: blogReducer,        // Blog posts
    ui: uiReducer,           // UI state
  },
});
```

### 2. Redux Slices
Each slice manages a specific domain of your application:
- **State**: Current data and UI state
- **Actions**: Synchronous state updates
- **Async Thunks**: API calls and async operations
- **Reducers**: State update logic

## 🚀 Basic Data Fetching Pattern

### Step 1: Import Redux Hooks
```typescript
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
```

### Step 2: Get Dispatch and Select Data
```typescript
const dispatch = useAppDispatch();
const { courses, isLoading, error } = useAppSelector((state) => state.course);
```

### Step 3: Dispatch Actions
```typescript
useEffect(() => {
  // Fetch data when component mounts
  dispatch(fetchCourses());
}, [dispatch]);
```

### Step 4: Handle Loading, Error, and Success States
```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (courses.length === 0) return <EmptyState />;

return <CourseList courses={courses} />;
```

## 📊 Complete Example Component

```typescript
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCourses, setFilters } from '@/store/slices/courseSlice';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function CourseList() {
  const dispatch = useAppDispatch();
  const { courses, isLoading, error, filters } = useAppSelector((state) => state.course);

  useEffect(() => {
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handleRefresh = () => {
    dispatch(fetchCourses(filters));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Courses ({courses.length})</h2>
        <button onClick={handleRefresh}>Refresh</button>
      </div>
      
      <div className="grid gap-4">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}
```

## 🔄 Async Thunks (API Calls)

### Creating Async Thunks
```typescript
// In your slice file
export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (filters: CourseFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getCourses(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);
```

### Handling Async Thunk States
```typescript
extraReducers: (builder) => {
  builder
    // Pending state
    .addCase(fetchCourses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    // Success state
    .addCase(fetchCourses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.courses = action.payload;
      state.error = null;
    })
    // Error state
    .addCase(fetchCourses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
},
```

## 🎛️ Advanced Patterns

### 1. Filtering and Search
```typescript
const [searchTerm, setSearchTerm] = useState('');

const handleSearch = (value: string) => {
  setSearchTerm(value);
  // Update filters in Redux store
  dispatch(setFilters({ ...filters, search: value }));
};

const handleCategoryFilter = (category: string) => {
  dispatch(setFilters({ ...filters, category }));
};

// Clear all filters
const clearFilters = () => {
  dispatch(setFilters({}));
  setSearchTerm('');
};
```

### 2. Optimistic Updates
```typescript
const handleToggleFavorite = async (courseId: string) => {
  // Optimistically update UI
  dispatch(toggleFavorite(courseId));
  
  try {
    await apiService.toggleFavorite(courseId);
  } catch (error) {
    // Revert on error
    dispatch(toggleFavorite(courseId));
    showError('Failed to update favorite');
  }
};
```

### 3. Data Caching
```typescript
// Check if data exists and is fresh
const shouldFetchData = () => {
  const lastFetched = state.lastFetched;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return !lastFetched || (now - lastFetched) > fiveMinutes;
};

useEffect(() => {
  if (shouldFetchData()) {
    dispatch(fetchCourses());
  }
}, [dispatch]);
```

## 🎨 Custom Hooks for Redux

### Create Reusable Hooks
```typescript
// src/lib/hooks.ts
export const useCourses = (filters?: any) => {
  const dispatch = useAppDispatch();
  const { courses, isLoading, error, filters: currentFilters } = useAppSelector((state) => state.course);
  
  return {
    courses,
    isLoading,
    error,
    filters: currentFilters,
    refetch: () => dispatch(fetchCourses(filters)),
    updateFilters: (newFilters: any) => dispatch(setFilters(newFilters)),
  };
};

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};
```

### Use Custom Hooks in Components
```typescript
export function CourseManager() {
  const { courses, isLoading, error, refetch, updateFilters } = useCourses();
  const { user, isAuthenticated } = useAuth();

  const handleCategoryChange = (category: string) => {
    updateFilters({ category });
  };

  return (
    <div>
      {isAuthenticated ? (
        <CourseList courses={courses} onCategoryChange={handleCategoryChange} />
      ) : (
        <LoginPrompt />
      )}
    </div>
  );
}
```

## 🚫 Common Mistakes to Avoid

### 1. Don't Call API Directly in Components
```typescript
// ❌ Wrong - Don't do this
const [courses, setCourses] = useState([]);

useEffect(() => {
  apiService.getCourses().then(setCourses);
}, []);

// ✅ Correct - Use Redux
const dispatch = useAppDispatch();
const { courses } = useAppSelector((state) => state.course);

useEffect(() => {
  dispatch(fetchCourses());
}, [dispatch]);
```

### 2. Don't Mutate State Directly
```typescript
// ❌ Wrong
state.courses.push(newCourse);

// ✅ Correct
state.courses = [...state.courses, newCourse];
```

### 3. Don't Forget Error Handling
```typescript
// ❌ Wrong - No error handling
const { courses } = useAppSelector((state) => state.course);

// ✅ Correct - Handle all states
const { courses, isLoading, error } = useAppSelector((state) => state.course);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## 🔧 Best Practices

### 1. Normalize Data Structure
```typescript
interface CourseState {
  entities: Record<string, Course>;  // Normalized by ID
  ids: string[];                     // Array of IDs for order
  isLoading: boolean;
  error: string | null;
}
```

### 2. Use Selectors for Computed Values
```typescript
// In your slice
export const selectCourseById = (state: RootState, courseId: string) => 
  state.course.entities[courseId];

export const selectCoursesByCategory = (state: RootState, category: string) =>
  state.course.ids
    .map(id => state.course.entities[id])
    .filter(course => course.category === category);
```

### 3. Implement Loading States
```typescript
// Track loading for different operations
interface CourseState {
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}
```

### 4. Handle API Errors Gracefully
```typescript
.caddCase(fetchCourses.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload as string || 'An unexpected error occurred';
  
  // Keep existing data if available
  if (state.courses.length === 0) {
    state.courses = [];
  }
});
```

## 📱 Real-World Example: Course Management

```typescript
export function CourseManagement() {
  const dispatch = useAppDispatch();
  const { courses, isLoading, error, filters } = useAppSelector((state) => state.course);
  const { user } = useAppSelector((state) => state.auth);

  // Fetch courses with filters
  useEffect(() => {
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  // Handle course creation
  const handleCreateCourse = async (courseData: Partial<Course>) => {
    try {
      await dispatch(createCourse(courseData)).unwrap();
      // Show success message
      toast.success('Course created successfully!');
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        toast.success('Course deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <CourseFilters 
        filters={filters}
        onFilterChange={(newFilters) => dispatch(setFilters(newFilters))}
      />

      {/* Course List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} onRetry={() => dispatch(fetchCourses(filters))} />
      ) : (
        <CourseList 
          courses={courses}
          onDelete={handleDeleteCourse}
          userRole={user?.role}
        />
      )}

      {/* Create Course Button */}
      {user?.role === 'admin' && (
        <CreateCourseButton onCreate={handleCreateCourse} />
      )}
    </div>
  );
}
```

## 🎯 Summary

1. **Use Redux for all data management** - Don't mix local state with API data
2. **Implement proper loading states** - Show spinners, skeletons, or progress indicators
3. **Handle errors gracefully** - Display error messages with retry options
4. **Use async thunks for API calls** - Keep components clean and focused
5. **Create custom hooks** - Reuse Redux logic across components
6. **Normalize your data** - Structure data for efficient updates and lookups
7. **Implement optimistic updates** - Improve perceived performance
8. **Cache data appropriately** - Avoid unnecessary API calls

This pattern ensures your application is maintainable, performant, and provides a great user experience!
