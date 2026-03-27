import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logoReducer from './slices/logoSlice';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const logoPersistTransform = createTransform(
  (inboundState: {
    formData?: {
      name?: string;
      slogan?: string;
      industryId?: number | null;
      fontId?: string;
      colorId?: string;
    };
  }) => ({
    formData: {
      name: inboundState?.formData?.name || '',
      slogan: inboundState?.formData?.slogan || '',
      industryId: inboundState?.formData?.industryId ?? null,
      fontId: inboundState?.formData?.fontId || '',
      colorId: inboundState?.formData?.colorId || '',
    },
  }),
  (outboundState: {
    formData?: {
      name?: string;
      slogan?: string;
      industryId?: number | null;
      fontId?: string;
      colorId?: string;
    };
  }) => ({
    formData: {
      name: outboundState?.formData?.name || '',
      slogan: outboundState?.formData?.slogan || '',
      industryId: outboundState?.formData?.industryId ?? null,
      fontId: outboundState?.formData?.fontId || '',
      colorId: outboundState?.formData?.colorId || '',
    },
    results: [],
    status: 'idle',
    error: null,
  }),
  { whitelist: ['logo'] }
);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['logo'],
  transforms: [logoPersistTransform],
};

// Saare reducers ko combine karein
const rootReducer = combineReducers({
  logo: logoReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // Middleware ko ignore karna zaroori hai redux-persist ke liye
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store); // Ye zaroori hai

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
