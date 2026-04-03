import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logoReducer from './slices/logoSlice';
import { persistStore, persistReducer, createTransform, type PersistConfig } from 'redux-persist';
import { generateLogosAction } from './slices/logoSlice';

type PersistStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<string>;
  removeItem: (key: string) => Promise<void>;
};

const createNoopStorage = (): PersistStorage => ({
  getItem: async () => null,
  setItem: async (_key, value) => value,
  removeItem: async () => undefined,
});

const createBrowserStorage = (): PersistStorage => ({
  getItem: async (key) => window.localStorage.getItem(key),
  setItem: async (key, value) => {
    window.localStorage.setItem(key, value);
    return value;
  },
  removeItem: async (key) => {
    window.localStorage.removeItem(key);
  },
});

const storage: PersistStorage =
  typeof window === 'undefined' ? createNoopStorage() : createBrowserStorage();

type PersistedLogoFormData = {
  name: string;
  slogan: string;
  industryId: number | null;
  fontId: string;
  colorId: string;
};

type PersistedLogoState = {
  formData: PersistedLogoFormData;
  createStep: number;
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
    createStep: Math.max(1, Math.min(4, Number(inboundState.createStep) || 1)),
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
    createStep: Math.max(1, Math.min(4, Number(outboundState?.createStep) || 1)),
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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', generateLogosAction.fulfilled.type],
        ignoredPaths: ['logo.results'],
        ignoredActionPaths: ['payload', 'meta.arg'],
        warnAfter: 128,
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
