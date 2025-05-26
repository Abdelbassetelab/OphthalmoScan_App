'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';
import useUserRole from '@/hooks/use-user-role';
import type { UserRole } from '@/lib/auth/clerk-auth';
import { isPatient, isAdminOrDoctor } from '@/lib/auth/role-helpers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ScanRequest {
  id: string;
  created_at: string;
  updated_at: string;
  patient_id: string;
  user_id: string;
  description: string;
  symptoms: string | null;
  medical_history: string | null;
  status: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_doctor_id: string | null;
  assigned_doctor_username: string | null;
  patient_username: string | null;
  completed_at: string | null;
  has_image: boolean;
  scan_id: string | null;
  image_url: string | null;
  patientName?: string;
  doctorName?: string;
}

interface CreateScanRequestData {
  description: string;
  symptoms?: string | null;
  medical_history?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  patient_id?: string;  // Optional, defaults to current user if not provided
}

const ScanRequestsContent = ({ 
  userRole,
  scanRequests,
  loading,
  isRejecting,
  isApproving,
  createScanRequest,
  rejectScanRequest,
  approveScanRequest,
}: { 
  userRole: UserRole | null;
  scanRequests: ScanRequest[];
  loading: boolean;
  isRejecting: boolean;
  isApproving: boolean;
  createScanRequest: (data: CreateScanRequestData) => Promise<void>;
  rejectScanRequest: (requestId: string) => Promise<void>;
  approveScanRequest: (requestId: string) => Promise<void>;
}) => {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting scan request...');
    await createScanRequest({ 
      description, 
      symptoms: symptoms || null, 
      medical_history: medicalHistory || null,
      priority: priority 
    });
    setDescription('');
    setSymptoms('');
    setMedicalHistory('');
    setPriority('medium');
  };
  return (
    <div className="space-y-6">
      <div className="space-y-8 md:space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan Requests</h1>
        
        {isAdminOrDoctor(userRole) && (
          <div className="mb-4">
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm font-medium">
              Showing all scan requests in the system
            </span>
          </div>
        )}
          {loading && (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-700 font-medium">Loading scan requests...</p>
            <p className="text-gray-500 text-sm mt-1">Please wait while we retrieve your data</p>
          </div>
        )}{!loading && scanRequests.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <path d="M12 12h.01"></path>
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No scan requests found</p>
            <p className="text-gray-500 text-sm mt-1">Create a new request to get started</p>
          </div>
        )}{!loading && scanRequests.length > 0 && (
          <div className="space-y-6">
            {scanRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left section with patient info */}
                  <div className="flex-1 flex">
                    {/* Patient avatar */}
                    <div className="mr-4 flex-shrink-0">
                      <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    </div>
                      {/* Patient details */}
                    <div className="space-y-1">                      <h3 className="font-medium text-gray-900">
                        {request.patientName ? (
                          <span>{request.patientName}</span>
                        ) : request.patient_username ? (
                          <span>{request.patient_username}</span>
                        ) : (
                          <span>Patient #{request.patient_id.substring(0, 8)}</span>
                        )}
                      </h3>
                      <p className="text-md font-semibold text-gray-800">{request.description}</p>
                      {request.symptoms && (
                        <p className="text-gray-600 text-sm line-clamp-2">{request.symptoms}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>
                          {new Date(request.created_at).toLocaleString('en-US', {
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                          })}
                          <span className="mx-1">·</span>
                          {new Date(request.created_at).toLocaleString('en-US', {
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                          <path d="M3 9h18"></path>
                          <path d="M9 21V9"></path>
                        </svg>
                        <span>Request #{request.id.substring(0, 6)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right section with status and actions */}
                  <div className="flex flex-col justify-between md:items-end gap-3">
                    {/* Status and priority badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-sm ${
                        request.priority === 'urgent' ? 'bg-red-100 text-red-800 border border-red-200' :
                        request.priority === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        request.priority === 'medium' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                          <path d="M4 22h16"></path>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        request.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                        request.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                          {request.status === 'completed' ? 
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path> : 
                            <circle cx="12" cy="12" r="10"></circle>
                          }
                          {request.status === 'completed' && <polyline points="22 4 12 14.01 9 11.01"></polyline>}
                          {request.status === 'pending' && <polyline points="12 6 12 12 16 14"></polyline>}
                        </svg>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                      {/* Doctor info if assigned */}
                    {request.assigned_doctor_id && (
                      <div className="text-xs text-gray-600 flex items-center">                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1">
                          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                          <path d="M12 3v6"></path>
                        </svg>
                        {request.doctorName ? request.doctorName : 
                          request.assigned_doctor_username ? request.assigned_doctor_username : 
                          `Doctor #${request.assigned_doctor_id?.substring(0, 8)}`}
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => router.push(`/scan-requests/${request.id}`)}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View Details
                      </button>
                        {isAdminOrDoctor(userRole) && request.status === 'pending' && (
                        <button 
                          onClick={() => approveScanRequest(request.id)}
                          disabled={isApproving}
                          className={`px-3 py-1.5 bg-green-50 border border-green-200 rounded-md text-xs font-medium text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center ${
                            isApproving ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isApproving ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 mr-1.5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Approving...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Approve
                            </>
                          )}
                        </button>
                      )}{/* Reject button - allows users to delete their scan requests */}
                      {(isAdminOrDoctor(userRole) || isPatient(userRole)) && request.status === 'pending' && (
                        <button 
                          onClick={() => rejectScanRequest(request.id)}
                          disabled={isRejecting}
                          className={`px-3 py-1.5 border rounded-md text-xs font-medium transition-colors flex items-center ${
                            isRejecting 
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                        >
                          {isRejecting ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 mr-1.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                              Reject
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}        {userRole === 'patient' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-8">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">Create New Scan Request</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  className="block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
                  rows={3}
                  required
                  placeholder="Describe why you need an eye scan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Please provide a clear description of your eye condition.</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
                  Symptoms
                </label>
                <textarea
                  id="symptoms"
                  className="block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
                  rows={2}
                  placeholder="Describe any symptoms you're experiencing..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                  Medical History
                </label>
                <textarea
                  id="medicalHistory"
                  className="block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
                  rows={2}
                  placeholder="Relevant medical history that might be important..."
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'urgent'].map((p) => (
                    <div 
                      key={p}
                      onClick={() => setPriority(p as 'low' | 'medium' | 'high' | 'urgent')}
                      className={`rounded-lg border p-3 flex items-center cursor-pointer transition-all ${
                        priority === p 
                          ? p === 'urgent' ? 'bg-red-50 border-red-200 text-red-700' :
                            p === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                            p === 'medium' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            'bg-green-50 border-green-200 text-green-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                        {p === 'urgent' && <><path d="m8 2 1.88 1.88"></path><path d="M14.12 3.88 16 2"></path><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"></path><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"></path><path d="M12 20v-9"></path><path d="M8.5 13.5 12 17l3.5-3.5"></path></>}
                        {p === 'high' && <><path d="M15 4h4a1 1 0 0 1 1 1v4"></path><path d="M20 15v4a1 1 0 0 1-1 1h-4"></path><path d="M9 20H5a1 1 0 0 1-1-1v-4"></path><path d="M4 9V5a1 1 0 0 1 1-1h4"></path><path d="M17 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"></path></>}
                        {p === 'medium' && <><path d="M5 3a2 2 0 0 0-2 2"></path><path d="M19 3a2 2 0 0 1 2 2"></path><path d="M21 19a2 2 0 0 1-2 2"></path><path d="M5 21a2 2 0 0 1-2-2"></path><path d="M9 3h1"></path><path d="M9 21h1"></path><path d="M14 3h1"></path><path d="M14 21h1"></path><path d="M3 9v1"></path><path d="M21 9v1"></path><path d="M3 14v1"></path><path d="M21 14v1"></path></>}
                        {p === 'low' && <><path d="M15 8h.01"></path><path d="M11 5h1"></path><path d="M13 16h1"></path><path d="M4 7h1"></path><path d="M19 10h1"></path><path d="M5 15h1"></path><path d="M4 11h1"></path><path d="M18 14h1"></path><path d="M9 15h1"></path><path d="M18 6h.01"></path></>}
                      </svg>
                      <span className="capitalize text-sm font-medium">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center font-medium mt-6"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Submit Scan Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ScanRequestsPage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const { supabase, isLoaded: isSupabaseLoaded } = useSupabaseWithClerk();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [scanRequests, setScanRequests] = useState<ScanRequest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const { toast } = useToast();

  async function loadScanRequests() {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }

    try {      console.log(`Loading scan requests for user role: ${role}`);
      const query = supabase.from('scan_requests').select('*')
      
      // Filter based on user role
      // For main scan-requests page:
      // - Patients see only their own requests
      // - Doctors and admins see ALL requests in the system
      if (isPatient(role)) {
        query.eq('patient_id', user?.id)
      } else if (isAdminOrDoctor(role)) {
        // No filtering for admin and doctor roles - they see all requests
        console.log(`User has ${role} role: showing all scan requests`);
      } else {
        // Default case: only show user's own requests
        query.eq('patient_id', user?.id)
      }
      
      // Add explicit limit to override any default limits
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1000) // Set a high limit to make sure we get all records
      
      if (error) {
        console.error('Error fetching scan requests:', error);
        return;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} scan requests from database`);
      setScanRequests(data || []);
    } catch (error) {
      console.error('Error loading scan requests:', error)
    }
  }
  async function createScanRequest(data: CreateScanRequestData) {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    try {
      // Debug information about the user
      console.log('Creating scan request with user info:', {
        userId: user?.id,
        username: user?.username,
        firstName: user?.firstName,
        lastName: user?.lastName
      });
      
      // Make sure we have a valid username - if not, fall back to first+last name or "Unknown User"
      const patientUsername = user?.username || 
        (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown User');
      
      console.log('Using patient_username:', patientUsername);
      
      const newRequest = {
        ...data,
        status: 'pending',
        priority: data.priority || 'medium',
        patient_id: user?.id,
        patient_username: patientUsername,
        has_image: false, // Default to false, will be updated when image is added
        image_url: null // Will be set when an image is uploaded
      };      console.log('Saving scan request with data:', JSON.stringify(newRequest, null, 2));

      const { data: insertedData, error } = await supabase
        .from('scan_requests')
        .insert([newRequest])
        .select();

      if (error) {
        console.error('Error creating scan request:', error);
        return;
      }

      console.log('Successfully inserted scan request, response:', insertedData);

      // Reload the scan requests
      await loadScanRequests();
    } catch (error) {
      console.error('Error creating scan request:', error)
    }
  }  async function rejectScanRequest(requestId: string) {
    // Just set the request to reject and open the dialog
    setRequestToReject(requestId);
    setDialogOpen(true);
  }

  async function handleConfirmReject() {
    if (!requestToReject || !supabase) {
      return;
    }

    try {
      setIsRejecting(true);

      const { error } = await supabase
        .from('scan_requests')
        .delete()
        .eq('id', requestToReject);

      if (error) {
        console.error('Error rejecting scan request:', error);
        toast({
          title: "Error rejecting scan request",
          description: "The request could not be rejected. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Show success toast
      toast({
        title: "Scan request rejected",
        description: "The scan request has been successfully rejected.",
        variant: "default",
      });

      // Reload the scan requests to update the UI
      await loadScanRequests();
    } catch (error) {
      console.error('Error rejecting scan request:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
      setDialogOpen(false);
      setRequestToReject(null);
    }
  }

  async function approveScanRequest(requestId: string) {
    if (!supabase || !user) {
      return;
    }

    try {
      setIsApproving(true);

      // Update the scan request with doctor's ID and change status to 'assigned'
      const { error } = await supabase
        .from('scan_requests')
        .update({
          assigned_doctor_id: user.id,
          assigned_doctor_username: user.username || user.firstName + ' ' + user.lastName,
          status: 'assigned'
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error approving scan request:', error);
        toast({
          title: "Error approving scan request",
          description: "The request could not be approved. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Show success toast
      toast({
        title: "Scan request approved",
        description: "The scan request has been assigned to you successfully.",
        variant: "default",
      });

      // Reload the scan requests to update the UI
      await loadScanRequests();
    } catch (error) {
      console.error('Error approving scan request:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  }

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded || !isSupabaseLoaded || isRoleLoading) return;

    if (!isSignedIn) {
      router.replace('/login');
      return;
    }
    
    setIsLoading(true);
    const loadData = async () => {
      await loadScanRequests();
      setIsLoading(false);
    };
    loadData();
  }, [isAuthLoaded, isUserLoaded, isSupabaseLoaded, isRoleLoading, isSignedIn, user, router, role]);
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-6 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Loading Scan Requests</h2>
          <p className="text-gray-500">Please wait while we retrieve your eye scan data...</p>
        </div>
      </div>
    );
  }
  
  // Debug log - outside of JSX to avoid TypeScript issues
  console.log(`Rendering ScanRequestsPage with ${scanRequests.length} scan requests, user role: ${role}`);  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      <ScanRequestsContent 
        userRole={role}
        scanRequests={scanRequests}
        loading={isLoading}
        isRejecting={isRejecting}
        isApproving={isApproving}
        createScanRequest={createScanRequest}
        rejectScanRequest={rejectScanRequest}
        approveScanRequest={approveScanRequest}
      />

      {/* Rejection Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Scan Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this scan request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              No, Keep Request
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Yes, Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}