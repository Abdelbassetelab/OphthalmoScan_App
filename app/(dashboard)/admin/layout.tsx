'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after authentication is complete
    if (!isLoading) {
      // If not authenticated, the dashboard layout will handle redirection
      if (isAuthenticated && userRole !== 'admin') {
        // User is authenticated but not an admin - redirect to home
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, userRole, router]);

  // If still loading or not the right role, render empty container
  if (isLoading || !isAuthenticated || userRole !== 'admin') {
    return null;
  }

  // If admin role verified, render the admin-specific content
  return (
    <div className="admin-dashboard">
      {children}
    </div>
  );
}