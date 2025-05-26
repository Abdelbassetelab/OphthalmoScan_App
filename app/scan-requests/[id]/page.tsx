'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  Eye,
  Tag,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import useUserRole from '@/hooks/use-user-role';
import type { UserRole } from '@/lib/auth/clerk-auth';
import { isAdmin, isDoctor, isPatient, isAdminOrDoctor } from '@/lib/auth/role-helpers';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';
import { Database } from '@/types/database.types';

// Types for scan request
type DbScanRequest = Database['public']['Tables']['scan_requests']['Row'];

interface ScanRequest extends DbScanRequest {
  patientName?: string;
  doctorName?: string;
  requestDate?: string;
  notes?: string;
  doctorId?: string;
  patientId?: string;
  images?: { id: string; url: string; uploadedAt: string }[];
}

// Component for displaying scan request details
const ScanRequestDetail = ({ 
  scanRequest, 
  userRole,
  onAssignToMe,
  isAssigning
}: { 
  scanRequest: ScanRequest | null, 
  userRole: UserRole | null,
  onAssignToMe: () => Promise<void>,
  isAssigning: boolean
}) => {
  const router = useRouter();

  const handleAssignToMe = async () => {
    await onAssignToMe();
  };

  if (!scanRequest) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow">        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Scan Request Not Found</h3>
        <p className="text-gray-500 mb-4">The scan request you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/scan-requests/my-requests')}>
          Back to Scan Requests
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Pending</span>;
      case 'assigned':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Assigned</span>;
      case 'reviewed':
        return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">Reviewed</span>;
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

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">        <Button 
          variant="outline" 
          onClick={() => router.push('/scan-requests/my-requests')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scan Requests
        </Button>

        {userRole === 'admin' && (
          <Button 
            variant="destructive"
            size="sm"
            className="flex items-center"
          >
            Cancel Request
          </Button>
        )}
      </div>

      {/* Request details card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Request: {scanRequest.id}</h1>
            <div className="flex items-center space-x-4">
              {getStatusBadge(scanRequest.status)}
              {getPriorityBadge(scanRequest.priority)}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center text-gray-500 mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Requested: {formatDate(scanRequest.requestDate || scanRequest.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              Patient Information            </h3>
            <div className="pl-7">
              <p className="font-medium">{scanRequest.patientName || `Patient ${scanRequest.patient_id?.substring(0, 8)}`}</p>
              <p className="text-sm text-gray-500">ID: {scanRequest.patientId || scanRequest.patient_id}</p>
            </div>
          </div>

          {/* Doctor Info (if assigned) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-gray-500" />
              Doctor Information
            </h3>
            <div className="pl-7">
              {scanRequest.doctorName || scanRequest.assigned_doctor_id ? (
                <>
                  <p className="font-medium">{scanRequest.doctorName || `Doctor ${scanRequest.assigned_doctor_id?.substring(0, 8)}`}</p>
                  <p className="text-sm text-gray-500">ID: {scanRequest.doctorId || scanRequest.assigned_doctor_id}</p>
                </>
              ) : (
                <p className="text-gray-500">Not assigned yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-800 flex items-center mb-4">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            Notes
          </h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">{scanRequest.notes || 'No notes provided'}</p>
          </div>
        </div>

        {/* Uploaded Images (if any) */}
        {scanRequest.images && scanRequest.images.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-800 flex items-center mb-4">
              <Eye className="h-5 w-5 mr-2 text-gray-500" />
              Uploaded Scans
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {scanRequest.images.map(image => (
                <div key={image.id} className="border rounded-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img 
                      src={image.url} 
                      alt="Scan" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        // Fallback for missing images
                        e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Scan+Image';
                      }}
                    />
                  </div>
                  <div className="p-2 text-xs text-gray-500">
                    Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t flex flex-wrap gap-3 justify-end">          {isDoctor(userRole) && scanRequest.status === 'pending' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAssignToMe}
              disabled={isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign to Me'}
            </Button>
          )}
          
          {isDoctor(userRole) && scanRequest.status === 'assigned' && (
            <Button className="bg-green-600 hover:bg-green-700">
              Review Scan
            </Button>
          )}
          
          {isPatient(userRole) && scanRequest.status === 'pending' && (
            <Button variant="destructive">
              Cancel Request
            </Button>
          )}
          
          {isAdmin(userRole) && (
            <Button className="bg-purple-600 hover:bg-purple-700">
              Reassign Request
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default function ScanRequestDetailPage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { supabase, isLoaded: isSupabaseLoaded } = useSupabaseWithClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [scanRequest, setScanRequest] = useState<ScanRequest | null>(null);
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const fetchScanRequest = async () => {
    try {
      if (!supabase) return;
      
      // Get scan request by ID
      const { data, error } = await supabase
        .from('scan_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching scan request:', error);
        setScanRequest(null);
      } else if (data) {
        // Convert the Supabase data to our ScanRequest format
        const scanRequestData: ScanRequest = {
          ...data,
          requestDate: data.created_at,
          notes: data.symptoms || data.medical_history || 'No additional notes available'
        };
        
        setScanRequest(scanRequestData);
      } else {
        setScanRequest(null);
      }
    } catch (error) {
      console.error('Error fetching scan request:', error);
      setScanRequest(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded || isRoleLoading || !isSupabaseLoaded || !supabase) return;

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    fetchScanRequest();
  }, [isAuthLoaded, isUserLoaded, isRoleLoading, isSignedIn, user, router, id, supabase, isSupabaseLoaded]);
  const handleAssignToMe = async () => {
    if (!supabase || !user || !scanRequest) return;
    
    try {
      setIsAssigning(true);
      
      // Update the scan request with doctor's ID and change status to 'assigned'
      const { error } = await supabase
        .from('scan_requests')
        .update({
          assigned_doctor_id: user.id,
          assigned_doctor_username: user.username || user.firstName + ' ' + user.lastName,  // Add username
          status: 'assigned'
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error assigning scan request:', error);
        toast({
          title: 'Error',
          description: 'Failed to assign scan request',
          variant: 'destructive',
        });
        return;
      }
      
      // Refresh the scan request data
      await fetchScanRequest();
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Scan request assigned to you successfully',
      });
      
    } catch (error) {
      console.error('Error assigning scan request:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign scan request',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };
  if (isLoading || isRoleLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading scan request details</h2>
        </div>
      </div>
    );
  }
  return <ScanRequestDetail 
    scanRequest={scanRequest} 
    userRole={role} 
    onAssignToMe={handleAssignToMe}
    isAssigning={isAssigning}
  />;
}