'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// ---------- Mock Auth Context (used when no real Privy App ID is set) ----------

interface MockAuthState {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  user: { wallet?: { address: string } } | null;
}

const MockAuthContext = createContext<MockAuthState>({
  ready: true,
  authenticated: false,
  login: () => {},
  logout: () => {},
  user: null,
});

export function useMockAuth() {
  return useContext(MockAuthContext);
}

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);

  const login = useCallback(() => setAuthenticated(true), []);
  const logout = useCallback(() => setAuthenticated(false), []);

  const user = authenticated
    ? { wallet: { address: '0xMOCK_WALLET_' + Math.random().toString(36).slice(2, 8) } }
    : null;

  return (
    <MockAuthContext.Provider value={{ ready: true, authenticated, login, logout, user }}>
      {children}
    </MockAuthContext.Provider>
  );
}

// ---------- Wrapper that decides which provider to use ----------

const HAS_REAL_PRIVY_KEY =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_PRIVY_APP_ID &&
  process.env.NEXT_PUBLIC_PRIVY_APP_ID !== 'mock-privy-app-id';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  // When a real Privy App ID exists, use the real provider (lazy-loaded)
  if (HAS_REAL_PRIVY_KEY) {
    // Dynamic import only happens when key is present, so this module is
    // never evaluated if the key is missing.
    const RealPrivyWrapper = React.lazy(() =>
      import('./RealPrivyProvider').then((m) => ({ default: m.default }))
    );
    return (
      <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin" /></div>}>
        <RealPrivyWrapper>{children}</RealPrivyWrapper>
      </React.Suspense>
    );
  }

  // Fallback: no real key → use mock auth
  return <MockAuthProvider>{children}</MockAuthProvider>;
}
