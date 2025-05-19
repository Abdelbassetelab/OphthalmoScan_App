'use client';

import { Card } from '@/components/ui/card';
import { UserRole } from '@/lib/auth/clerk-auth';
import { useUser } from '@clerk/nextjs';
import { 
  Users, 
  Server, 
  Eye, 
  Stethoscope, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Sample data - in a real application, you would fetch this from your API
const mockData = {
  totalUsers: 256,
  userGrowth: 12.5,
  userRoles: { doctors: 45, patients: 201, admins: 10 },
  systemHealth: {
    status: 'Healthy', // 'Healthy', 'Warning', or 'Critical'
    serverLoad: 32,
    dbLatency: '24ms',
    apiResponseTime: '125ms'
  },
  scanStats: {
    total: 1248,
    today: 24,
    pending: 5,
    aiSuccessRate: 92.7
  },
  diagnosis: {
    completedToday: 18,
    avgTimeToComplete: '2.5h',
    aiAssistedPercentage: 85,
    needingManualReview: 3
  }
};

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const formatCurrentDate = () => {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date().toLocaleDateString('en-US', options);
    };

    setGreeting('Welcome back');
    setCurrentDate(formatCurrentDate());
  }, []);
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {greeting}, {user?.username || user?.firstName || user?.lastName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || ''}
            </h1>
            <p className="text-gray-500">{currentDate}</p>
          </div>
        </div>
      </Card>

      {/* Metric Cards Grid - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Users Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-blue-100">
              <Users className="h-5 w-5 text-[#0A84FF]" />
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-[#20C997] mr-1" />
              <span className="text-sm font-medium text-[#20C997]">+{mockData.userGrowth}%</span>
            </div>
          </div>
          <h3 className="text-base font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{mockData.totalUsers}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="mr-2">{mockData.userRoles.doctors} Doctors</span>
            <span className="mr-2">{mockData.userRoles.patients} Patients</span>
            <span>{mockData.userRoles.admins} Admins</span>
          </div>
        </Card>
          {/* System Health Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-green-100">
              <Server className="h-5 w-5 text-[#20C997]" />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium
              ${mockData.systemHealth.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                mockData.systemHealth.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}>
              {mockData.systemHealth.status}
            </div>
          </div>
          <h3 className="text-base font-medium text-gray-500">System Health</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {mockData.systemHealth.serverLoad}% Load
          </p>
          <div className="mt-2 text-sm text-gray-500">
            DB: {mockData.systemHealth.dbLatency} | API: {mockData.systemHealth.apiResponseTime}
          </div>
        </Card>
          {/* Scan Statistics Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-indigo-100">
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">{mockData.scanStats.today} today</span>
            </div>
          </div>
          <h3 className="text-base font-medium text-gray-500">Scan Statistics</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{mockData.scanStats.total}</p>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">Success Rate: <span className="font-medium text-[#0A84FF]">{mockData.scanStats.aiSuccessRate}%</span></span>
            <span className="text-gray-500">Pending: <span className="font-medium text-amber-600">{mockData.scanStats.pending}</span></span>
          </div>
        </Card>
          {/* Diagnosis Activity Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-teal-100">
              <Stethoscope className="h-5 w-5 text-[#20C997]" />
            </div>
            <div className="flex items-center">
              {mockData.diagnosis.needingManualReview > 0 && (
                <span className="text-sm font-medium text-amber-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {mockData.diagnosis.needingManualReview} need review
                </span>
              )}
            </div>
          </div>
          <h3 className="text-base font-medium text-gray-500">Diagnosis Today</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{mockData.diagnosis.completedToday}</p>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">AI-Assisted: <span className="font-medium text-[#20C997]">{mockData.diagnosis.aiAssistedPercentage}%</span></span>
            <span className="text-gray-500">Avg. Time: <span className="font-medium">{mockData.diagnosis.avgTimeToComplete}</span></span>
          </div>
        </Card>
      </div>
        {/* Admin Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-2">User Management</h2>
          <p className="text-gray-600 mb-3">Manage users, roles and permissions</p>
          <a href="/dashboard/admin/users" className="text-[#0A84FF] hover:text-blue-700 font-medium">
            View Users →
          </a>
        </Card>
          <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-2">System Analytics</h2>
          <p className="text-gray-600 mb-3">View system usage and performance metrics</p>
          <a href="/dashboard/admin/analytics" className="text-[#0A84FF] hover:text-blue-700 font-medium">
            View Analytics →
          </a>
        </Card>
        
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-2">Audit Logs</h2>
          <p className="text-gray-600 mb-3">Review system audit logs and activities</p>
          <a href="/dashboard/admin/logs" className="text-[#0A84FF] hover:text-blue-700 font-medium">
            View Logs →
          </a>
        </Card>
      </div>      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <p className="text-gray-600">No recent activity to display</p>
        </Card>
      </div>
    </div>
  );
}