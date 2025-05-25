'use client';

import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import CollapsibleSidebar from '@/components/layouts/collapsible-sidebar';
import { Navbar } from '@/components/layouts/Navbar';

export default function ScanRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const userRole = user?.publicMetadata?.role as string || 'patient';

  // Wait for both auth and user data to load
  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    redirect('/login');
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar 
        role={userRole} 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar 
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
