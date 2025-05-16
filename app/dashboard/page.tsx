'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import CollapsibleSidebar from '@/components/layouts/collapsible-sidebar';
import { Navbar } from '@/components/layouts/Navbar';

// Import the dedicated Admin Dashboard component
import AdminDashboardPage from '../(dashboard)/admin/page';
// Import the dedicated Patient Dashboard component
import PatientDashboardPage from '../(dashboard)/patient/page';

// Doctor Dashboard Component 
function DoctorDashboard() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  
  useEffect(() => {
    // Dynamically import the component on the client side
    import('../(dashboard)/doctor/page')
      .then(module => {
        setComponent(() => module.default);
      })
      .catch(err => {
        console.error('Error loading doctor dashboard component:', err);
      });
  }, []);

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
        <span className="ml-3">Loading doctor dashboard...</span>
      </div>
    );
  }

  return <Component />;
}

// Admin Dashboard Component
function AdminDashboard() {
  return <AdminDashboardPage />;
}

// Patient Dashboard Component
function PatientDashboard() {
  return <PatientDashboardPage />;
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading your dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <CollapsibleSidebar userRole={userRole || 'patient'} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {userRole === 'admin' && <AdminDashboard />}
          {userRole === 'doctor' && <DoctorDashboard />}
          {userRole === 'patient' && <PatientDashboard />}
          {!userRole && <p className="text-red-500">Error: User role not found</p>}
        </main>
      </div>
    </div>
  );
}