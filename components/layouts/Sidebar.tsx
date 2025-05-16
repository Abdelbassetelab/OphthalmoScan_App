'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { 
  Users, Home, FileText, Calendar, Settings, 
  BarChart, User, Eye, PlusCircle, Menu, X 
} from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// Role-based navigation configuration
const navigationConfig: Record<string, NavigationItem[]> = {
  admin: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/dashboard/admin/users', label: 'User Management', icon: <Users className="h-5 w-5" /> },
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: <BarChart className="h-5 w-5" /> },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
  doctor: [
    { href: '/dashboard/doctor', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/dashboard/doctor/patients', label: 'Patients', icon: <Users className="h-5 w-5" /> },
    { href: '/dashboard/doctor/scans', label: 'Scans', icon: <Eye className="h-5 w-5" /> },
    { href: '/dashboard/doctor/appointments', label: 'Appointments', icon: <Calendar className="h-5 w-5" /> },
  ],
  patient: [
    { href: '/dashboard/patient', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/dashboard/patient/profile', label: 'My Profile', icon: <User className="h-5 w-5" /> },
    { href: '/dashboard/patient/scans', label: 'My Scans', icon: <Eye className="h-5 w-5" /> },
    { href: '/dashboard/patient/appointments', label: 'Appointments', icon: <Calendar className="h-5 w-5" /> },
  ]
};

export function SidebarLink({ href, icon, label, active, collapsed }: SidebarLinkProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200",
        active && "bg-blue-50 text-blue-700 font-medium",
        collapsed ? "justify-center" : ""
      )}
    >
      <span className={collapsed ? "" : "mr-3"}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { userRole } = useAuthContext();
  
  // Get navigation items based on user role
  const navigationItems = navigationConfig[userRole] || [];

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out h-screen",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div 
          className={cn(
            "h-16 flex items-center px-4 border-b border-gray-200",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <h1 className="text-xl font-bold text-blue-600">
              OphthalmoScan
            </h1>
          )}
          {collapsed && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white">
              <Eye className="h-5 w-5" />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <SidebarLink
            href="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            collapsed={collapsed}
          />
        </div>
      </div>
    </aside>
  );
}