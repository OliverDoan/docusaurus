import React, { useState, useCallback, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { AuthProvider } from '@site/src/contexts/AuthContext';
import LoginGate from '@site/src/components/LoginGate';

const AUTH_KEY = 'site-auth-token';

interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const sitePasswordHash = siteConfig.customFields?.sitePasswordHash as string;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sitePasswordHash) {
      setIsAuthenticated(true);
      return;
    }

    const storedToken = localStorage.getItem(AUTH_KEY);
    setIsAuthenticated(storedToken === sitePasswordHash);
  }, [sitePasswordHash]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  if (isAuthenticated === null) {
    return <></>;
  }

  if (!isAuthenticated) {
    return <LoginGate onSuccess={handleLoginSuccess} />;
  }

  return <AuthProvider logout={handleLogout}>{children}</AuthProvider>;
}
