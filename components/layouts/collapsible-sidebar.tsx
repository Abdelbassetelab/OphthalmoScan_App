'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Users, 
  FileImage, 
  Activity, 
  Settings, 
  User, 
  Eye,
  BarChart,
  Clipboard,
  Calendar,
  BookOpen,
  Bell,
  HelpCircle,
  Shield,
  FileText,
  UserCog,
  Database,
  Stethoscope,
  HeartPulse,
  Clock,
  MessageSquare,
  UserPlus
} from 'lucide-react';

type MenuItem = {
  path: string;
  label: string;
  icon: React.ElementType;
  roleAccess: string[];
  children?: MenuItem[];
};

// Separate utility navigation items
const utilityItems: MenuItem[] = [
  { 
    path: '/scans', 
    label: 'Scans', 
    icon: FileImage, 
    roleAccess: ['admin', 'doctor', 'patient'],
  },
  { 
    path: '/settings', 
    label: 'Settings', 
    icon: Settings, 
    roleAccess: ['admin', 'doctor', 'patient'] 
  },
  { 
    path: '/help', 
    label: 'Help & Support', 
    icon: HelpCircle, 
    roleAccess: ['admin', 'doctor', 'patient']
  }
];

// Main navigation items (remove utility items from here)
const menuItems: MenuItem[] = [
  // Admin Routes
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    roleAccess: ['admin', 'doctor', 'patient'] 
  },
  { 
    path: '/admin', 
    label: 'Management', 
    icon: Shield, 
    roleAccess: ['admin'],
    children: [
      { path: '/admin/users', label: 'User Management', icon: UserCog, roleAccess: ['admin'] },
      { path: '/admin/doctors', label: 'Doctor Directory', icon: Stethoscope, roleAccess: ['admin'] },
      { path: '/admin/reports', label: 'System Reports', icon: FileText, roleAccess: ['admin'] }
    ]
  },
  {
    path: '/analytics', 
    label: 'Analytics', 
    icon: BarChart, 
    roleAccess: ['admin'],
    children: [
      { path: '/analytics/usage', label: 'System Usage', icon: Activity, roleAccess: ['admin'] },
      { path: '/analytics/scans', label: 'Scan Statistics', icon: FileImage, roleAccess: ['admin'] }
    ]
  },

  // Doctor Routes
  { 
    path: '/patients', 
    label: 'Patient Management', 
    icon: Users, 
    roleAccess: ['doctor'],
    children: [
      { path: '/patients/list', label: 'Patient List', icon: Clipboard, roleAccess: ['doctor'] },
      { path: '/patients/appointments', label: 'Appointments', icon: Calendar, roleAccess: ['doctor'] },
      { path: '/patients/referrals', label: 'Referrals', icon: UserPlus, roleAccess: ['doctor'] }
    ]
  },
  { 
    path: '/diagnosis', 
    label: 'Diagnosis', 
    icon: HeartPulse, 
    roleAccess: ['doctor'],
    children: [
      { path: '/diagnosis/new', label: 'New Diagnosis', icon: FileImage, roleAccess: ['doctor'] },
      { path: '/diagnosis/history', label: 'History', icon: Clock, roleAccess: ['doctor'] }
    ]
  },

  // Patient Routes
  { 
    path: '/my-health', 
    label: 'My Health', 
    icon: Activity, 
    roleAccess: ['patient'],
    children: [
      { path: '/my-health/diagnoses', label: 'My Diagnoses', icon: FileText, roleAccess: ['patient'] },
      { path: '/my-health/appointments', label: 'My Appointments', icon: Calendar, roleAccess: ['patient'] }
    ]
  },

  // Common Routes
  { 
    path: '/messages', 
    label: 'Messages', 
    icon: MessageSquare, 
    roleAccess: ['admin', 'doctor', 'patient'] 
  },
  { 
    path: '/notifications', 
    label: 'Notifications', 
    icon: Bell, 
    roleAccess: ['admin', 'doctor', 'patient'] 
  },
  { 
    path: '/profile', 
    label: 'Profile', 
    icon: User, 
    roleAccess: ['admin', 'doctor', 'patient'] 
  }
].filter(item => !utilityItems.some(util => util.path === item.path));

interface CollapsibleSidebarProps {
  userRole?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function NavItem({ item, isActive, collapsed, level = 0, isUtility = false }: { 
  item: MenuItem; 
  isActive: boolean; 
  collapsed: boolean;
  level?: number;
  isUtility?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();

  // Calculate padding based on nesting level
  const paddingLeft = level * 1 + (collapsed ? 1 : 4);

  return (
    <div>
      <Link
        href={item.path}
        className={`
          flex items-center py-2 transition-colors
          ${isActive 
            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
            : 'text-gray-600 hover:bg-gray-50'}
          ${hasChildren ? 'cursor-pointer' : ''}
          ${level === 0 ? 'px-4' : `pl-${paddingLeft} pr-4`}
          ${isUtility ? 'text-sm text-gray-500' : ''}
        `}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : isUtility ? 'text-gray-400' : ''}`} />
        {!collapsed && (
          <>
            <span className="ml-3 flex-1 transition-opacity duration-200">{item.label}</span>
            {hasChildren && (
              <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            )}
          </>
        )}
      </Link>
      
      {!collapsed && hasChildren && isOpen && (
        <div className="ml-4">
          {item.children?.map((child) => (
            <NavItem
              key={child.path}
              item={child}
              isActive={pathname === child.path}
              collapsed={collapsed}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
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

  const filteredUtilityItems = utilityItems.filter(item =>
    item.roleAccess.includes(userRole)
  );

  return (
    <div 
      className={`h-screen bg-white border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h2 className="font-semibold text-xl text-gray-800">OphthalmoScan</h2>
        )}
        <button
          onClick={handleToggleCollapse}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Main navigation - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-4 space-y-1" aria-label="Main navigation">
          {filteredMenuItems.map(item => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>

      {/* Utility navigation - fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200">
        <nav className="mt-2 space-y-1" aria-label="Utility navigation">
          {filteredUtilityItems.map(item => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              collapsed={collapsed}
              isUtility={true}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}