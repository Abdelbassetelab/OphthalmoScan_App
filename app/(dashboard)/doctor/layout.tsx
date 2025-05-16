'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/auth-context';

export default function DoctorLayout({
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
      if (isAuthenticated && userRole !== 'doctor') {
        // User is authenticated but not a doctor - redirect to home
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, userRole, router]);

  // If still loading or not the right role, render empty container
  if (isLoading || !isAuthenticated || userRole !== 'doctor') {
    return null;
  }

  // If doctor role verified, render the doctor-specific content
  return (
    <div className="doctor-dashboard">
      {children}
    </div>
  );
}