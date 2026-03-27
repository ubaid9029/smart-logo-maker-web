import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logoReducer from './slices/logoSlice';
import { persistStore, persistReducer, createTransform, type PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

type PersistedLogoFormData = {
  name: string;
  slogan: string;
  industryId: number | null;
  fontId: string;
  colorId: string;
};

type PersistedLogoState = {
  formData: PersistedLogoFormData;
};

type RootLogoState = ReturnType<typeof logoReducer>;

const rootReducer = combineReducers({
  logo: logoReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const logoPersistTransform = createTransform<RootLogoState, PersistedLogoState, RootState, RootState>(
  (inboundState) => ({
    formData: {
      name: inboundState.formData?.name || '',
      slogan: inboundState.formData?.slogan || '',
      industryId: inboundState.formData?.industryId ?? null,
      fontId: inboundState.formData?.fontId || '',
      colorId: inboundState.formData?.colorId || '',
    },
  }),
  (outboundState) => ({
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

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  whitelist: ['logo'],
  transforms: [logoPersistTransform],
};

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

export type AppDispatch = typeof store.dispatch;
