'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';

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
  completed_at: string | null;
  has_image: boolean;
  scan_id: string | null;
  image_url: string | null;
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
  createScanRequest,
}: { 
  userRole: string | null;
  scanRequests: ScanRequest[];
  loading: boolean;
  createScanRequest: (data: CreateScanRequestData) => Promise<void>;
}) => {  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        
        {loading && (
          <div className="text-center py-4">
            <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-600">Loading scan requests...</p>
          </div>
        )}

        {!loading && scanRequests.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-600">No scan requests found</p>
          </div>
        )}

        {!loading && scanRequests.length > 0 && (
          <div className="space-y-4">
            {scanRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="font-medium">{request.description}</p>
                    {request.symptoms && (
                      <p className="text-gray-600">{request.symptoms}</p>
                    )}                    <div className="text-sm text-gray-500 space-x-2">
                      <span>Patient ID: {request.patient_id}</span>
                      {request.assigned_doctor_id && (
                        <span>• Doctor ID: {request.assigned_doctor_id}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">                    <span className={`px-2 py-1 rounded text-sm ${
                      request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      request.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      request.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                      request.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}        {userRole === 'patient' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">New Scan Request</h2>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={3}
                required
                placeholder="Describe your scan request"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
                Symptoms (optional)
              </label>
              <textarea
                id="symptoms"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={2}
                placeholder="Describe any symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                Medical History (optional)
              </label>
              <textarea
                id="medicalHistory"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={2}
                placeholder="Relevant medical history"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>              <select
                id="priority"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Submit Scan Request
            </button>
          </form>
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
  const [userRole, setUserRole] = useState<string | null>(null);  const [isLoading, setIsLoading] = useState(true);
  const [scanRequests, setScanRequests] = useState<ScanRequest[]>([]);

  async function loadScanRequests() {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }

    try {
      const query = supabase.from('scan_requests').select('*')
      
      // Filter based on user role
      if (userRole === 'patient') {
        query.eq('patient_id', user?.id)
      } else if (userRole === 'doctor') {
        query.eq('assigned_doctor_id', user?.id)
      }
      // Admin can see all requests
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching scan requests:', error);
        return;
      }
      
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

    try {      const newRequest = {
        ...data,
        status: 'pending',
        priority: data.priority || 'medium',
        patient_id: user?.id,
        has_image: false, // Default to false, will be updated when image is added
        image_url: null // Will be set when an image is uploaded
      }

      const { error } = await supabase
        .from('scan_requests')
        .insert([newRequest])

      if (error) {
        console.error('Error creating scan request:', error);
        return;
      }

      // Reload the scan requests
      await loadScanRequests();
    } catch (error) {
      console.error('Error creating scan request:', error)
    }
  }
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded || !isSupabaseLoaded) return;

    if (!isSignedIn) {
      router.replace('/login');
      return;
    }

    const role = user?.publicMetadata?.role as string || 'patient';
    setUserRole(role);
    
    setIsLoading(true);
    const loadData = async () => {
      await loadScanRequests();
      setIsLoading(false);
    };
    loadData();
  }, [isAuthLoaded, isUserLoaded, isSupabaseLoaded, isSignedIn, user, router]);

  useEffect(() => {
    if (userRole && supabase) {
      setIsLoading(true);
      const loadData = async () => {
        await loadScanRequests();
        setIsLoading(false);
      };
      loadData();
    }
  }, [userRole, supabase]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading scan requests</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6">
      <ScanRequestsContent 
        userRole={userRole}
        scanRequests={scanRequests}
        loading={isLoading}
        createScanRequest={createScanRequest}
      />
    </div>
  );
}