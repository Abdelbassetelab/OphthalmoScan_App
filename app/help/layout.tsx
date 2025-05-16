'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import CollapsibleSidebar from '@/components/layouts/collapsible-sidebar';
import { Navbar } from '@/components/layouts/Navbar';
import { useAuthContext } from '@/context/auth-context';
import AuthCheck from '@/components/auth/auth-check';

// Navigation items for help section breadcrumb
const helpNavItems = [
  { path: '/help', label: 'Help Center' },
  { path: '/help/documentation', label: 'Documentation' },
  { path: '/help/faq', label: 'FAQ' },
  { path: '/help/contact', label: 'Contact Support' },
];

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { userRole } = useAuthContext();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  // Generate breadcrumb items based on current path
  const pathname = usePathname();
  const getBreadcrumbItems = () => {
    const items = [{ label: 'Help Center', path: '/help' }];
    const currentItem = helpNavItems.find(item => item.path === pathname);
    if (currentItem && pathname !== '/help') {
      items.push(currentItem);
    }
    return items;
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
              {/* Breadcrumb Navigation */}
              <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {getBreadcrumbItems().map((item, index) => (
                    <li key={item.path} className="flex items-center">
                      {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
                      <Link
                        href={item.path}
                        className={`text-sm ${
                          pathname === item.path
                            ? 'text-gray-700 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
              
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthCheck>
  );
}
