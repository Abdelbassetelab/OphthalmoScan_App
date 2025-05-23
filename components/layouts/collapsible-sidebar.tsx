'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useUserRole from '@/hooks/use-user-role';
import { MenuItem, menuItemsByRole, utilityItemsByRole, commonMenuItems } from './sidebar-menu-items';

interface CollapsibleSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function NavItem({ 
  item, 
  isActive, 
  collapsed, 
  level = 0, 
  isUtility = false 
}: { 
  item: MenuItem; 
  isActive: boolean; 
  collapsed: boolean;
  level?: number;
  isUtility?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();
  
  return (
    <div className="relative">
      <Link
        href={hasChildren ? '#' : item.path}
        className={`
          flex items-center py-2 transition-colors
          ${isActive 
            ? `bg-${item.color?.replace('text-', '')?.replace('600', '50')} ${item.color} border-r-2 border-${item.color?.replace('text-', '')}` 
            : 'text-gray-600 hover:bg-gray-50'}
          ${hasChildren ? 'cursor-pointer' : ''}
          ${level === 0 ? 'px-4' : `pl-${level + (collapsed ? 1 : 4)} pr-4`}
          ${isUtility ? 'text-sm text-gray-500' : ''}
          ${item.color && !isActive ? item.color : ''}
        `}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        title={item.label}
        aria-label={item.label}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? item.color : isUtility ? 'text-gray-400' : item.color || ''}`} />
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
  collapsed: externalCollapsed, 
  onToggleCollapse 
}: CollapsibleSidebarProps) {
  const { role, isLoading } = useUserRole();
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

  // Don't render anything while loading the role
  if (isLoading) {
    return (
      <div className="h-screen bg-white border-r border-gray-200 w-64 animate-pulse">
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // If no role is found, don't show any navigation
  if (!role) {
    return null;
  }

  const filteredMenuItems = menuItemsByRole[role] || [];
  const filteredUtilityItems = utilityItemsByRole[role] || [];
  const roleColor = 'text-teal-600';

  // Add color to common menu items based on role
  const coloredCommonItems = commonMenuItems.map(item => ({
    ...item,
    color: roleColor
  }));

  return (
    <div 
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h2 className={`font-semibold text-xl ${roleColor}`}>
            OphthalmoScan
          </h2>
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
              isActive={pathname === item.path || pathname.startsWith(`${item.path}/`)}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>

      {/* Common items */}
      <div className="border-t border-gray-200">
        <nav className="mt-2 space-y-1">
          {coloredCommonItems.map(item => (
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
        <nav className="mt-2 space-y-1 mb-2" aria-label="Utility navigation">
          {filteredUtilityItems.map(item => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path || pathname.startsWith(`${item.path}/`)}
              collapsed={collapsed}
              isUtility={true}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}