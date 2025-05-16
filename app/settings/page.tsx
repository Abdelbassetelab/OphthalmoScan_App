'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import AdminSettings from '@/components/settings/AdminSettings';
import DoctorSettings from '@/components/settings/DoctorSettings';
import PatientSettings from '@/components/settings/PatientSettings';

export default function SettingsPage() {
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
    setIsLoading(false);
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading settings</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      {userRole === 'admin' && <AdminSettings />}
      {userRole === 'doctor' && <DoctorSettings />}
      {userRole === 'patient' && <PatientSettings />}
      {!userRole && <p className="text-red-500">Error: User role not found</p>}
    </main>
  );
}
