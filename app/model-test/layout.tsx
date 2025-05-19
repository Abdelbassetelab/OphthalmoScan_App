'use client';

import { useAuthContext } from '@/context/auth-context';
import CollapsibleSidebar from '@/components/layouts/collapsible-sidebar';
import { Navbar } from '@/components/layouts/Navbar';
import React, { useState } from 'react';

export default function ModelTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoading, isAuthenticated, userRole } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl text-gray-700 mb-4">Please sign in to access the model testing area</h1>
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Go to login page
          </a>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar 
        userRole={userRole} 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar 
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
