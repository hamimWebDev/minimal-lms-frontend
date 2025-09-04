import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import courseReducer from '@/store/slices/courseSlice';
import moduleReducer from '@/store/slices/moduleSlice';
import lectureReducer from '@/store/slices/lectureSlice';

import blogReducer from '@/store/slices/blogSlice';
import userReducer from '@/store/slices/userSlice';
import uiReducer from '@/store/slices/uiSlice';
import enrollmentReducer from '@/store/slices/enrollmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    module: moduleReducer,
    lecture: lectureReducer,

    blog: blogReducer,
    user: userReducer,
    ui: uiReducer,
    enrollment: enrollmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
