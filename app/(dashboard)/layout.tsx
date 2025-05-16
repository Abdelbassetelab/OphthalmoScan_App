'use client';

import React, { useState } from 'react';
import CollapsibleSidebar from '@/components/layouts/collapsible-sidebar';
import { Navbar } from '@/components/layouts/Navbar';
import { useAuthContext } from '@/context/auth-context';

export default function DashboardLayout({
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
          <h1 className="text-xl text-gray-700 mb-4">Please sign in to access the dashboard</h1>
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
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}