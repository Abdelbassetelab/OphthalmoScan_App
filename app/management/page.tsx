'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function ManagementDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in and has admin role
    if (user) {
      const userRole = user.publicMetadata?.role as string;
      if (userRole !== 'admin') {
        router.push('/');
      }
      setLoading(false);
    }
  }, [user, router]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Management Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-500 mb-4">Manage all users of the OphthalmoScan AI system.</p>
          <a href="/management/users" className="text-blue-600 hover:underline">Access User Management →</a>
        </Card>
        
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p className="text-gray-500 mb-4">Configure system-wide settings and preferences.</p>
          <a href="#" className="text-blue-600 hover:underline">Access System Settings →</a>
        </Card>
        
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Database Management</h2>
          <p className="text-gray-500 mb-4">Monitor and manage database operations.</p>
          <a href="#" className="text-blue-600 hover:underline">Access Database Management →</a>
        </Card>
      </div>
    </div>
  )
}