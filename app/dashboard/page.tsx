'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import MainLayout from '@/components/layouts/MainLayout';

// Load dashboard components dynamically
const AdminDashboard = dynamic(() => import('../(dashboard)/admin/page'), {
  loading: () => (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
      <span className="ml-3">Loading admin dashboard...</span>
    </div>
  ),
  ssr: false
});

const DoctorDashboard = dynamic(() => import('../(dashboard)/doctor/page'), {
  loading: () => (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
      <span className="ml-3">Loading doctor dashboard...</span>
    </div>
  ),
  ssr: false
});

const PatientDashboard = dynamic(() => import('../(dashboard)/patient/page'), {
  loading: () => (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
      <span className="ml-3">Loading patient dashboard...</span>
    </div>
  ),
  ssr: false
});

export default function DashboardPage() {
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading your dashboard</h2>
        </div>
      </div>
    );  }  return (    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back, Doctor {user?.username || user?.firstName || user?.lastName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || ''}
              </h1>
              <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
              <div className="mt-4 md:mt-0">
              <div className="px-4 py-2 bg-blue-50 rounded-lg flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#0A84FF] mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Patient Queue: 
                  <span className="ml-1 text-[#0A84FF]">1 waiting</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-8 md:space-y-6">
          {userRole === 'admin' && <AdminDashboard />}
          {userRole === 'doctor' && <DoctorDashboard />}
          {userRole === 'patient' && <PatientDashboard />}
          {!userRole && <p className="text-red-500">Error: User role not found</p>}
        </div>
      </div>
    </MainLayout>
  );
}