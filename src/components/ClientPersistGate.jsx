'use client';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '../store/store'; // Sahi path dein
import PremiumLoader from './Shared/PremiumLoader';

export default function ClientPersistGate({ children }) {
  return (
    <PersistGate
      loading={<PremiumLoader size="full" text="Booting your workspace..." className="min-h-screen bg-white" />}
      persistor={persistor}
    >
      {children}
    </PersistGate>
  );
}