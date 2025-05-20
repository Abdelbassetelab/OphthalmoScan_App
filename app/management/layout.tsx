'use client';

import { useState } from 'react';
import { CollapsibleSidebar } from '@/components/layouts/collapsible-sidebar';
import { Navbar } from '@/components/layouts/Navbar';

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onToggleSidebar={toggleSidebar} 
        sidebarCollapsed={sidebarCollapsed} 
      />
      <div className="flex h-[calc(100vh-64px)]">
        <CollapsibleSidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
        <main 
          className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
