'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Clipboard, 
  ClipboardCheck, 
  Eye, 
  X, 
  Check, 
  Calendar,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';
import { Database } from '@/types/database.types';

// Types for scan requests based on Supabase schema
type DbScanRequest = Database['public']['Tables']['scan_requests']['Row'];

// Extended interface for display purposes
interface ScanRequestWithDetails extends DbScanRequest {
  patientName?: string;
  doctorName?: string;
}

const MyRequestsList = ({ userRole }: { userRole: string | null }) => {
  const [scanRequests, setScanRequests] = useState<DbScanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const { supabase, isLoaded: isSupabaseLoaded } = useSupabaseWithClerk();

  useEffect(() => {
    // Fetch scan requests from Supabase
    const fetchMyScanRequests = async () => {
      if (!user || !supabase || !isSupabaseLoaded) return;
      
      try {
        setIsLoading(true);
        
        let query = supabase.from('scan_requests').select('*');
        
        // Filter requests based on user role
        if (userRole === 'doctor') {
          // For doctors, show requests assigned to them
          query = query.eq('assigned_doctor_id', user.id);
        } else {
          // For patients, show their own requests
          query = query.eq('patient_id', user.id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching scan requests:', error);
          throw error;
        }
        
        setScanRequests(data || []);
      } catch (error) {
        console.error('Error fetching scan requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyScanRequests();
  }, [userRole, user, supabase, isSupabaseLoaded]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Pending</span>;
      case 'assigned':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Assigned</span>;
      case 'scheduled':
        return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">Scheduled</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Low</span>;
      case 'medium':
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Medium</span>;
      case 'high':
        return <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">High</span>;
      case 'urgent':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Urgent</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{priority}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewRequest = (requestId: string) => {
    router.push(`/scan-requests/${requestId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
        <span className="ml-3">Loading your scan requests...</span>
      </div>
    );
  }
  if (scanRequests.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Clipboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No scan requests found</h3>
        <p className="text-gray-500 mb-4">
          {userRole === 'patient' 
            ? "You don't have any scan requests yet." 
            : "You don't have any scan requests assigned to you."}
        </p>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scanRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{request.id.substring(0, 8)}...</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.description.length > 30 
                      ? `${request.description.substring(0, 30)}...` 
                      : request.description}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(request.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getPriorityBadge(request.priority)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewRequest(request.id)}
                        className="flex items-center text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      {userRole === 'doctor' && request.status === 'assigned' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      )}
                      
                      {userRole === 'patient' && request.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const MyRequestsPage = () => {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    const role = user?.publicMetadata?.role as string || 'patient';
    setUserRole(role);
    setIsLoading(false);
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading your scan requests</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="space-y-8 md:space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Scan Requests</h1>
          {userRole === 'patient' && (
            <Button onClick={() => router.push('/scan-requests/new')} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Scan Request
            </Button>
          )}
        </div>
        <MyRequestsList userRole={userRole} />
      </div>
    </div>
  );
};

export default MyRequestsPage;