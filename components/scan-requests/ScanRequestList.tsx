'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clipboard, 
  ClipboardCheck, 
  Eye, 
  X, 
  Check, 
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types for scan requests
interface ScanRequest {
  id: string;
  patientName: string;
  patientId: string;
  doctorName?: string;
  doctorId?: string;
  requestDate: string;
  status: 'pending' | 'assigned' | 'reviewed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

// Mock data - in a real application, you would fetch this from your API
const mockScanRequests: ScanRequest[] = [
  {
    id: 'req-001',
    patientName: 'John Smith',
    patientId: 'pat-123',
    requestDate: '2025-05-20T09:30:00Z',
    status: 'pending',
    priority: 'medium',
    notes: 'Regular checkup scan'
  },
  {
    id: 'req-002',
    patientName: 'Sarah Johnson',
    patientId: 'pat-456',
    doctorName: 'Dr. Michael Brown',
    doctorId: 'doc-789',
    requestDate: '2025-05-21T14:15:00Z',
    status: 'assigned',
    priority: 'high',
    notes: 'Follow-up after surgery'
  },
  {
    id: 'req-003',
    patientName: 'Robert Wilson',
    patientId: 'pat-789',
    doctorName: 'Dr. Emily Davis',
    doctorId: 'doc-456',
    requestDate: '2025-05-19T11:00:00Z',
    status: 'reviewed',
    priority: 'urgent',
    notes: 'Possible glaucoma case'
  },
  {
    id: 'req-004',
    patientName: 'Amanda Lee',
    patientId: 'pat-101',
    doctorName: 'Dr. Emily Davis',
    doctorId: 'doc-456',
    requestDate: '2025-05-18T13:45:00Z',
    status: 'completed',
    priority: 'low',
    notes: 'Routine annual checkup'
  }
];

const ScanRequestList = ({ userRole }: { userRole: string | null }) => {
  const [scanRequests, setScanRequests] = useState<ScanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real application, you would fetch data from your API
    // based on the user's role
    const fetchScanRequests = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter requests based on user role
        let filteredRequests = [...mockScanRequests];
        
        if (userRole === 'doctor') {
          // For doctors, only show assigned or unassigned requests
          filteredRequests = mockScanRequests.filter(req => 
            req.status === 'pending' || 
            req.status === 'assigned' || 
            (req.status === 'reviewed' && req.doctorId === 'doc-456') // assuming current doctor id
          );
        } else if (userRole === 'patient') {
          // For patients, only show their own requests
          filteredRequests = mockScanRequests.filter(req => 
            req.patientId === 'pat-123' // assuming current patient id
          );
        }
        
        setScanRequests(filteredRequests);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching scan requests:', error);
        setIsLoading(false);
      }
    };

    fetchScanRequests();
  }, [userRole]);

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
        <span className="ml-3">Loading scan requests...</span>
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
            : "There are no scan requests available."}
        </p>
        {userRole === 'patient' && (
          <Button onClick={() => router.push('/scan-requests/new')}>
            Request a New Scan
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {userRole === 'patient' && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => router.push('/scan-requests/new')}>
            Request a New Scan
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                {(userRole === 'admin' || userRole === 'patient') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scanRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{request.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.patientName}</td>
                  {(userRole === 'admin' || userRole === 'patient') && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {request.doctorName || 'Not assigned'}
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(request.requestDate)}
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
                      
                      {userRole === 'doctor' && request.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        >
                          <ClipboardCheck className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      )}
                      
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
                      
                      {(userRole === 'admin' || (userRole === 'patient' && request.status === 'pending')) && (
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

export default ScanRequestList;