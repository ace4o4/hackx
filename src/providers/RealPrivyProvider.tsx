'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import React from 'react';

/**
 * Only loaded when a real NEXT_PUBLIC_PRIVY_APP_ID env variable is set.
 */
export default function RealPrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'apple'],
        appearance: {
          theme: 'dark',
          accentColor: '#00F2FE',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
