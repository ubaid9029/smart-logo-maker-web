import { configureStore } from '@reduxjs/toolkit';
import logoReducer from './slices/logoSlice'; // Path check kar lein

export const store = configureStore({
  reducer: {
    logo: logoReducer,
  },
});

// Types for TypeScript (Inki zaroorat useLogoFlow hook mein paregi)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;