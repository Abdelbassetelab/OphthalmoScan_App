'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/lib/auth/clerk-auth';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userRole: UserRole;
  userFullName: string | null;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  userRole: 'patient',
  userFullName: null,
  userEmail: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: isAuthLoaded, userId, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthContextType>({
    isLoading: true,
    isAuthenticated: false,
    userId: null,
    userRole: 'patient',
    userFullName: null,
    userEmail: null,
  });

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded) {
      const role = (user?.publicMetadata?.role as UserRole) || 'patient';
      
      setAuthState({
        isLoading: false,
        isAuthenticated: !!isSignedIn,
        userId: userId || null,
        userRole: role,
        userFullName: user ? `${user.firstName} ${user.lastName}` : null,
        userEmail: user?.primaryEmailAddress?.emailAddress || null,
      });

      // Handle role-based redirects
      if (isSignedIn && user) {
        // Only redirect if we're on the login page or root
        if (pathname === '/login' || pathname === '/') {
          switch (role) {
            case 'admin':
              router.push('/admin');
              break;
            case 'doctor':
              router.push('/dashboard/doctor');
              break;
            case 'patient':
              router.push('/dashboard/patient');
              break;
          }
        }
      }
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, userId, user, router, pathname]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);