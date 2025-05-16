'use client';

import useUserRole from '@/hooks/use-user-role';
import type { UserRole } from '@/lib/auth/clerk-auth';
import { PropsWithChildren } from 'react';

interface RoleRestrictedProps extends PropsWithChildren {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleRestricted({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleRestrictedProps) {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return fallback;
  }

  return <>{children}</>;
}