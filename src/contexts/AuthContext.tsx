import React, { createContext, useContext } from 'react';

interface AuthContextValue {
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  logout,
  children,
}: AuthContextValue & { children: React.ReactNode }): React.ReactElement {
  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
