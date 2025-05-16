'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { UserRole } from '@/lib/auth/clerk-auth';

interface UseUserRoleReturn {
  role: UserRole | null;
  isLoading: boolean;
  error: Error | null;
}

export default function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isUserLoaded) {
      return;
    }

    try {
      // Get role from user metadata
      const userRole = (user?.publicMetadata?.role as UserRole) || 'patient';
      setRole(userRole);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get user role'));
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoaded]);

  return { role, isLoading, error };
}