'use client';

import { GamificationProvider } from '@/contexts/GamificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GamificationProvider>
      {children}
    </GamificationProvider>
  );
}