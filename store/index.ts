import { configureStore } from '@reduxjs/toolkit';
import logoReducer from './slice/logoSlice';

export const store = configureStore({
  reducer: {
    logo: logoReducer,
  },
});

// TypeScript types for State and Dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;