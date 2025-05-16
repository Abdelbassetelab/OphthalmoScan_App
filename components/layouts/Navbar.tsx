'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bell, User, Search, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignOutButton from '@/components/auth/sign-out-button';
import { useUser, useClerk } from '@clerk/nextjs';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function Navbar({ onToggleSidebar, sidebarCollapsed }: NavbarProps) {
  const { userRole } = useAuthContext();
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Get user's full name from Clerk profile
  const userFullName = user?.fullName || user?.firstName || 'User';

  // Get appropriate dashboard path based on role
  const getDashboardPath = (): string => {
    switch (userRole) {
      case 'admin':
        return '/dashboard';
      case 'doctor':
        return '/dashboard';
      case 'patient':
      default:
        return '/dashboard';
    }
  };

  // Handler for opening Clerk's user profile management
  const handleOpenUserProfile = () => {
    setUserMenuOpen(false);
    openUserProfile();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center">
      <div className="flex-1 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center max-w-md w-full bg-gray-100 rounded-md px-3 py-2">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none w-full focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 focus:outline-none ml-1"
            >
              {/* Clerk User Profile Image */}
              {user?.imageUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image 
                    src={user.imageUrl} 
                    alt="User profile" 
                    width={32} 
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{userFullName}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Loading...'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                <Link
                  href={getDashboardPath()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleOpenUserProfile}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Profile Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-4 py-2">
                  <SignOutButton 
                    className="w-full flex items-center text-sm text-red-600 hover:text-red-800" 
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