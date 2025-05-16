'use client';

import React, { useState } from 'react';
import CollapsibleSidebar from '@/components/layouts/collapsible-sidebar';
import { Navbar } from '@/components/layouts/Navbar';
import { useAuthContext } from '@/context/auth-context';
import AuthCheck from '@/components/auth/auth-check';
import AdminSettings from '@/components/settings/AdminSettings';
import DoctorSettings from '@/components/settings/DoctorSettings';
import PatientSettings from '@/components/settings/PatientSettings';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { userRole } = useAuthContext();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AuthCheck>
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
    </AuthCheck>
  );
}