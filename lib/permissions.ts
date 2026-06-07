'use client';

import { useAuth } from './auth-context';

export function usePermissions() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === 'admin',
    isResearcher: user?.role === 'admin' || user?.role === 'researcher',
    canViewAllRegistries: user?.role === 'admin' || user?.role === 'researcher',
    canEditRegistry: (registryCollectorId: string) => {
      if (user?.role === 'admin') return true;
      return user?.id === registryCollectorId;
    },
    canDeleteRegistry: (registryCollectorId: string) => {
      if (user?.role === 'admin') return true;
      return user?.id === registryCollectorId;
    },
    canViewRegistry: (registryCollectorId: string) => {
      if (user?.role === 'admin' || user?.role === 'researcher') return true;
      return user?.id === registryCollectorId;
    },
  };
}