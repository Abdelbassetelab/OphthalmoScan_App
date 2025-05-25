'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Define a simple component for scan requests management
const ScanRequestsManagement = () => (
  <div className="space-y-6">
    <div className="space-y-8 md:space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan Requests Management</h1>
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-600 mb-4">Manage all scan requests in the system.</p>
        <div>
          <h2 className="text-lg font-semibold mb-2">Admin Panel</h2>
          <p className="text-gray-500">This is the admin management interface for scan requests.</p>
        </div>
      </div>
    </div>
  </div>
);

export default function ScanRequestsManagementPage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      router.replace('/login');
      return;
    }

    const role = user?.publicMetadata?.role as string || 'patient';
    setUserRole(role);
    
    // Only allow admins to access this page
    if (role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    
    setIsLoading(false);
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading management interface</h2>
        </div>
      </div>
    );
  }

  return <ScanRequestsManagement />;
}