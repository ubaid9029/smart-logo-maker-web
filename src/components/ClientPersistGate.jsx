'use client';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '../store/store'; // Sahi path dein

export default function ClientPersistGate({ children }) {
  return (
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      {children}
    </PersistGate>
  );
}