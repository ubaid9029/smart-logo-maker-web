import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logoReducer from './slices/logoSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  // Agar aap sirf logo slice ko persist karna chahte hain:
  whitelist: ['logo'], 
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