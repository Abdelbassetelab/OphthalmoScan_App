'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bell, User, Search, ChevronDown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignOutButton from '@/components/auth/sign-out-button';
import { useUser, useClerk } from '@clerk/nextjs';
import useUserRole from '@/hooks/use-user-role';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function Navbar({ onToggleSidebar, sidebarCollapsed }: NavbarProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { openUserProfile } = useClerk();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Get user's display name from Clerk profile
  const userDisplayName = user?.username || user?.fullName || user?.firstName || 'User';

  // Get appropriate dashboard path based on role
  const getDashboardPath = (): string => {
    if (!role) return '/dashboard';
    
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'doctor':
        return '/dashboard/doctor';
      case 'patient':
        return '/dashboard/patient';
      default:
        return '/dashboard';
    }
  };

  // Handler for opening Clerk's user profile management
  const handleOpenUserProfile = () => {
    setUserMenuOpen(false);
    openUserProfile();
  };

  // Format role for display with proper capitalization
  const getDisplayRole = (): string => {
    if (isRoleLoading || !isUserLoaded) return 'Loading...';
    if (!role) return 'Guest';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (    <header className="bg-white border-b border-gray-100 h-16 flex items-center shadow-sm backdrop-blur-sm bg-white/90 sticky top-0 z-40">
      <div className="flex-1 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-teal-50 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all duration-200"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center max-w-md w-full bg-gray-50/80 rounded-lg px-3 py-2 ring-1 ring-gray-200/50 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all duration-200">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search in OphthalmoScan..."
              className="bg-transparent border-none w-full focus:outline-none text-sm text-gray-600 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">          <button className="p-2 rounded-lg text-gray-500 hover:bg-teal-50 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all duration-200 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-200 rounded-lg p-1 ml-1 transition-all duration-200 hover:bg-teal-50"
            >              {user?.imageUrl ? (
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-teal-100">
                  <Image 
                    src={user.imageUrl} 
                    alt="User profile" 
                    width={36} 
                    height={36}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center ring-2 ring-teal-100">
                  <User className="h-5 w-5" />
                </div>
              )}<div className="hidden md:block text-left">
                <p className="text-sm font-medium text-teal-700">{userDisplayName}</p>
                <p className="text-xs text-teal-600">{getDisplayRole()}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-teal-600" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl py-1 ring-1 ring-black/5 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
                <Link
                  href={getDashboardPath()}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={handleOpenUserProfile}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-4 py-2">
                  <SignOutButton 
                    className="w-full flex items-center text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors px-2 py-1.5" 
                    variant="ghost"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}