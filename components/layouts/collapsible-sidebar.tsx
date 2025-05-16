'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, Users, FileImage, Activity, Settings, User, Eye } from 'lucide-react';

type MenuItem = {
  path: string;
  label: string;
  icon: React.ElementType;
  roleAccess: string[];
};

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, roleAccess: ['admin', 'doctor', 'patient'] },
  { path: '/dashboard/patients', label: 'Patients', icon: Users, roleAccess: ['admin', 'doctor'] },
  { path: '/dashboard/scans', label: 'Scans', icon: FileImage, roleAccess: ['admin', 'doctor', 'patient'] },
  { path: '/dashboard/diagnoses', label: 'Diagnoses', icon: Activity, roleAccess: ['admin', 'doctor', 'patient'] },
  { path: '/dashboard/profile', label: 'Profile', icon: User, roleAccess: ['admin', 'doctor', 'patient'] },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings, roleAccess: ['admin', 'doctor', 'patient'] },
];

interface CollapsibleSidebarProps {
  userRole?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function CollapsibleSidebar({ 
  userRole = 'patient', 
  collapsed: externalCollapsed, 
  onToggleCollapse 
}: CollapsibleSidebarProps) {
  const [collapsed, setCollapsed] = useState(externalCollapsed || false);
  const pathname = usePathname();

  // Sync with external collapsed state if provided
  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roleAccess.includes(userRole)
  );

  return (
    <aside 
      className={`h-screen bg-white border-r border-border transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section with collapse button next to it */}
      <div className="h-16 flex items-center justify-between border-b border-gray-200 px-4">
        <Link href="/dashboard" className={`flex ${collapsed ? 'justify-center' : 'items-center space-x-3'}`}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Eye className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-blue-600">OphthalmoScan</span>
          )}
        </Link>
        
        {/* Collapse toggle button moved next to logo */}
        <button 
          onClick={handleToggleCollapse}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="mt-4">
        {filteredMenuItems.map(item => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center py-3 px-4 transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
              {!collapsed && (
                <span className="ml-3 transition-opacity duration-200">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}