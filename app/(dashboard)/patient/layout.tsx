'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/auth-context';

export default function PatientLayout({
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
      if (isAuthenticated && userRole !== 'patient') {
        // User is authenticated but not a patient - redirect to home
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, userRole, router]);

  // If still loading or not the right role, render empty container
  if (isLoading || !isAuthenticated || userRole !== 'patient') {
    return null;
  }

  // If patient role verified, render the patient-specific content
  return (
    <div className="patient-dashboard">
      {children}
    </div>
  );
}