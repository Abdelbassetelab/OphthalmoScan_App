'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthLoading from './auth-loading';

interface AuthCheckProps {
  children: React.ReactNode;
  /** Optional loading component. Defaults to AuthLoading */
  loadingComponent?: React.ReactNode;
  /** Optional fallback URL. Defaults to /sign-in */
  fallbackUrl?: string;
}

export default function AuthCheck({
  children,
  loadingComponent = <AuthLoading />,
  fallbackUrl = '/sign-in'
}: AuthCheckProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      // Store the attempted URL to redirect back after sign-in
      if (pathname !== '/') {
        const returnUrl = encodeURIComponent(pathname);
        router.push(`${fallbackUrl}?redirect_url=${returnUrl}`);
      } else {
        router.push(fallbackUrl);
      }
    }
  }, [isLoaded, userId, router, pathname, fallbackUrl]);

  // Show loading state while Clerk is loading
  if (!isLoaded) return loadingComponent;

  // Show loading state if not authenticated (will redirect)
  if (!userId) return loadingComponent;

  // User is authenticated, show protected content
  return <>{children}</>;
}