'use client';

import { useState } from 'react';
import CollapsibleSidebar from './collapsible-sidebar';
import { Navbar } from './Navbar';
import { useAuthContext } from '@/context/auth-context';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { userRole } = useAuthContext();

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
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}