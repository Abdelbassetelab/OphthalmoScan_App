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
  metadata?: {
    prediction_result?: {
      prediction: string;
      confidence: number;
      allPredictions: Array<{ label: string; probability: number }>;
    };
    analyzed_at?: string;
    analyzed_by?: string;
    analyzed_by_name?: string;
    model_version?: string;
  };
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
  
  // Helper function to format condition names
  const formatCondition = (condition: string): string => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      case 'analyzed':
        return <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">Analyzed</span>;
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
        </div>        {/* Notes Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-800 flex items-center mb-4">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            Notes
          </h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">{scanRequest.notes || 'No notes provided'}</p>
          </div>
        </div>

        {/* Analysis Results Section - Only show if analyzed or reviewed */}
        {(scanRequest.status === 'analyzed' || scanRequest.status === 'reviewed') && scanRequest.metadata?.prediction_result && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-800 flex items-center mb-4">
              <Eye className="h-5 w-5 mr-2 text-gray-500" />
              Analysis Results
              {scanRequest.metadata?.analyzed_at && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Analyzed on {new Date(scanRequest.metadata.analyzed_at).toLocaleDateString()})
                </span>
              )}
            </h3>
              {/* Primary Diagnosis Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-full p-2 mr-3">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-medium text-gray-700">Primary Diagnosis</span>
                </div>                <div className="mt-2 md:mt-0">
                  <span className="text-xl font-bold text-blue-700 bg-white px-4 py-2 rounded-full shadow-sm border border-blue-200">
                    {formatCondition(scanRequest.metadata.prediction_result.prediction)}
                  </span>
                </div>
              </div>
              
              {/* Display the retinal scan image if available */}
              {scanRequest.image_url && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border rounded-lg overflow-hidden shadow-md">
                    <div className="bg-gray-800 px-3 py-2 flex justify-between items-center">
                      <span className="text-white text-sm font-medium">Retinal Scan Image</span>
                      {scanRequest.metadata?.analyzed_at && (
                        <span className="text-gray-300 text-xs">
                          {new Date(scanRequest.metadata.analyzed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="bg-black">
                      <img 
                        src={scanRequest.image_url} 
                        alt="Retinal Scan" 
                        className="object-contain w-full h-64"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-5">
                    <div className="mb-4">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Primary Diagnosis</h4>
                      <div className="flex items-center">
                        <div className="bg-blue-600 rounded-full p-1 mr-2">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-blue-700">
                          {formatCondition(scanRequest.metadata.prediction_result.prediction)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-blue-100 pt-3 mt-3">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Confidence Score</h4>
                      <div className="text-3xl font-bold text-blue-700">
                        {scanRequest.metadata.prediction_result.confidence.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="border-t border-blue-100 pt-3 mt-3">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Analysis By</h4>
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-gray-700">{scanRequest.metadata.analyzed_by_name || "Doctor"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Confidence Levels</h3>
                <div className="space-y-4">
                  {scanRequest.metadata.prediction_result.allPredictions.map(({ label, probability }) => (
                    <div key={label} className="space-y-1">                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          {formatCondition(label)}
                        </span>
                        <span className="font-mono text-blue-700 font-semibold">{probability.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-3 shadow-inner">
                        <div
                          className={`${
                            label === scanRequest.metadata.prediction_result.prediction 
                              ? 'bg-blue-600' 
                              : probability > 30 
                                ? 'bg-blue-400' 
                                : 'bg-gray-300'
                          } h-3 rounded-full transition-all duration-500 ease-in-out`}
                          style={{ width: `${probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Doctor's Notes Section (if available) */}
            {scanRequest.doctor_note && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                  Doctor's Assessment
                </h3>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-700">{scanRequest.doctor_note}</p>
                </div>
              </div>
            )}
            
            {/* Recommendations Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-4">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Recommendations
              </h3>
              <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-gray-700 font-medium mb-3">
                  {scanRequest.metadata.prediction_result.prediction === 'normal' 
                    ? 'No follow-up needed at this time. Regular routine eye examinations are recommended.'
                    : `Based on the AI analysis (${formatCondition(scanRequest.metadata.prediction_result.prediction)}), further clinical evaluation is recommended to confirm this diagnosis.`}
                </p>
                
                {scanRequest.metadata.prediction_result.prediction !== 'normal' && (
                  <ul className="list-disc list-inside text-gray-600 space-y-2 pl-2">
                    <li>Schedule follow-up examination within 2-4 weeks</li>
                    <li>Consider additional specialized tests to confirm diagnosis</li>
                    <li>Review patient history for risk factors related to {formatCondition(scanRequest.metadata.prediction_result.prediction)}</li>
                    <li>Monitor for any changes in symptoms or vision</li>
                  </ul>
                )}
              </div>
            </div>
            
            {/* Download Report Button */}
            <div className="mt-4 flex justify-end">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 flex items-center"
                onClick={() => router.push(`/scan-requests/analyse/${scanRequest.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Complete Analysis
              </Button>
            </div>
          </div>
        )}

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
        )}        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t flex flex-wrap gap-3 justify-end">
          {/* For Doctors */}
          {isDoctor(userRole) && scanRequest.status === 'pending' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAssignToMe}
              disabled={isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign to Me'}
            </Button>
          )}
          
          {isDoctor(userRole) && (
            <>
              {scanRequest.status === 'assigned' && (
                <>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => router.push(`/scan-requests/analyse/${scanRequest.id}`)}
                  >
                    Analyze Scan
                  </Button>
                </>
              )}
              
              {(scanRequest.status === 'analyzed' || scanRequest.status === 'reviewed') && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push(`/scan-requests/analyse/${scanRequest.id}`)}
                >
                  View Analysis Details
                </Button>
              )}
            </>
          )}
          
          {/* For Patients */}
          {isPatient(userRole) && (
            <>
              {scanRequest.status === 'pending' && (
                <Button variant="destructive">
                  Cancel Request
                </Button>
              )}
              
              {(scanRequest.status === 'analyzed' || scanRequest.status === 'reviewed') && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push(`/scan-requests/analyse/${scanRequest.id}`)}
                >
                  View Analysis Results
                </Button>
              )}
            </>
          )}
          
          {/* For Admins */}
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
        
        // If the scan request has an image, add it to the images array
        if (data.image_url) {
          scanRequestData.images = [
            {
              id: 'main-image',
              url: data.image_url,
              uploadedAt: data.updated_at || data.created_at
            }
          ];
        }
        
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