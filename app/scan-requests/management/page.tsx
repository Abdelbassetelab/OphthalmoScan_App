'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';
import { 
  Calendar, 
  Eye, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Calendar as CalendarIcon,
  Info,
  AlertTriangle,
  Flag
} from 'lucide-react';

// Define interfaces and types
interface ScanRequest {
  id: string;
  description: string;
  created_at: string;
  status: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  patient_id: string;
  doctor_id?: string;
}

type StatusFilter = 'all' | 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'urgent';

// Component for scan requests management
const ScanRequestsManagement = () => {
  const [scanRequests, setScanRequests] = useState<ScanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  const { supabase } = useSupabaseWithClerk();
  const router = useRouter();

  // Status badge component
  const getStatusBadge = (status: ScanRequest['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium flex items-center">
          <Clock className="h-3 w-3 mr-1.5 text-gray-600" />Pending
        </span>;
      case 'assigned':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center">
          <Info className="h-3 w-3 mr-1.5 text-blue-600" />Assigned
        </span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium flex items-center">
          <CalendarIcon className="h-3 w-3 mr-1.5 text-purple-600" />Scheduled
        </span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium flex items-center">
          <CheckCircle className="h-3 w-3 mr-1.5 text-green-600" />Completed
        </span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium flex items-center">
          <X className="h-3 w-3 mr-1.5 text-red-600" />Cancelled
        </span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium flex items-center">
          {status}
        </span>;
    }
  };

  // Priority badge component
  const getPriorityBadge = (priority: ScanRequest['priority']) => {
    switch (priority) {
      case 'low':
        return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>Low
        </span>;
      case 'medium':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center">
          <span className="h-2 w-2 bg-blue-500 rounded-full mr-1.5"></span>Medium
        </span>;
      case 'high':
        return <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1.5 text-orange-600" />High
        </span>;
      case 'urgent':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium flex items-center">
          <Flag className="h-3 w-3 mr-1.5 text-red-600" />Urgent
        </span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium flex items-center">
          {priority}
        </span>;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts = {
      all: scanRequests.length,
      pending: 0,
      assigned: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0
    };
    
    scanRequests.forEach(request => {
      if (counts[request.status as keyof typeof counts] !== undefined) {
        counts[request.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [scanRequests]);

  // Get priority counts for filter badges
  const priorityCounts = useMemo(() => {
    const counts = {
      all: scanRequests.length,
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };
    
    scanRequests.forEach(request => {
      if (counts[request.priority as keyof typeof counts] !== undefined) {
        counts[request.priority as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [scanRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return scanRequests.filter(request => {
      const statusMatch = statusFilter === 'all' || request.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || request.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  }, [scanRequests, statusFilter, priorityFilter]);

  // Fetch scan requests
  useEffect(() => {
    const fetchScanRequests = async () => {
      if (!supabase) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('scan_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching scan requests:', error);
          return;
        }

        setScanRequests(data || []);
      } catch (error) {
        console.error('Error loading scan requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScanRequests();
  }, [supabase]);

  // Handle scroll events for infinite scrolling
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.scrollHeight - target.scrollTop === target.clientHeight) {
        // At the bottom of scroll
        console.log('Reached bottom of scroll');
        // Here you would implement loading more items if needed
      }
    };

    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
      return () => tableContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
  };

  return (
    <div className="h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with stats - Sticky */}
      <div className="py-4 bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Scan Requests Management</h1>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-sm">Total Requests:</span>
              <span className="px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-md">
                {scanRequests.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter section - Sticky */}
        <div className="mt-4 bg-white rounded-lg border border-gray-200">
          <div className="p-4 space-y-4">
            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Filter by Status</h3>
              <nav className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleStatusFilter('all')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${statusFilter === 'all' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  All
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {statusCounts.all}
                  </span>
                </button>
                
                <button 
                  onClick={() => handleStatusFilter('pending')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${statusFilter === 'pending' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <Clock className="h-4 w-4 mr-1.5" />
                  Pending
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {statusCounts.pending}
                  </span>
                </button>
                
                <button 
                  onClick={() => handleStatusFilter('assigned')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${statusFilter === 'assigned' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <Info className="h-4 w-4 mr-1.5" />
                  Assigned
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {statusCounts.assigned}
                  </span>
                </button>
                
                <button 
                  onClick={() => handleStatusFilter('scheduled')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${statusFilter === 'scheduled' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  Scheduled
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {statusCounts.scheduled}
                  </span>
                </button>
                
                <button 
                  onClick={() => handleStatusFilter('completed')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${statusFilter === 'completed' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Completed
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {statusCounts.completed}
                  </span>
                </button>
                
                <button 
                  onClick={() => handleStatusFilter('cancelled')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${statusFilter === 'cancelled' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancelled
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {statusCounts.cancelled}
                  </span>
                </button>
              </nav>
            </div>

            {/* Priority Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Filter by Priority</h3>
              <nav className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setPriorityFilter('all')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${priorityFilter === 'all' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  All
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {priorityCounts.all}
                  </span>
                </button>
                
                <button 
                  onClick={() => setPriorityFilter('low')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${priorityFilter === 'low' 
                      ? 'bg-green-50 text-green-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
                  Low
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {priorityCounts.low}
                  </span>
                </button>
                
                <button 
                  onClick={() => setPriorityFilter('medium')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${priorityFilter === 'medium' 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <span className="h-2 w-2 bg-blue-500 rounded-full mr-1.5"></span>
                  Medium
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {priorityCounts.medium}
                  </span>
                </button>
                
                <button 
                  onClick={() => setPriorityFilter('high')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${priorityFilter === 'high' 
                      ? 'bg-orange-50 text-orange-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <AlertTriangle className="h-4 w-4 mr-1.5 text-orange-500" />
                  High
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {priorityCounts.high}
                  </span>
                </button>
                
                <button 
                  onClick={() => setPriorityFilter('urgent')}
                  className={`
                    px-3 py-2 rounded-md flex items-center text-sm font-medium transition-all
                    ${priorityFilter === 'urgent' 
                      ? 'bg-red-50 text-red-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <Flag className="h-4 w-4 mr-1.5 text-red-500" />
                  Urgent
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {priorityCounts.urgent}
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - Scrollable */}
      <div className="flex-1 overflow-hidden mt-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-gray-600">Loading scan requests...</p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No scan requests found</h3>
              <p className="text-gray-500">
                {statusFilter !== 'all' && priorityFilter !== 'all'
                  ? `There are no scan requests with '${statusFilter}' status and '${priorityFilter}' priority.`
                  : statusFilter !== 'all'
                  ? `There are no scan requests with '${statusFilter}' status.`
                  : priorityFilter !== 'all'
                  ? `There are no scan requests with '${priorityFilter}' priority.`
                  : "There are no scan requests in the system."}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">ID</th>
                  <th scope="col" className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Description</th>
                  <th scope="col" className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Date</th>
                  <th scope="col" className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                  <th scope="col" className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Priority</th>
                  <th scope="col" className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                      {request.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div 
                        className="truncate cursor-help"
                        onMouseEnter={() => setShowTooltip(request.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                        title={request.description}
                      >
                        {request.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => router.push(`/scan-requests/${request.id}`)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </button>
                        <button 
                          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ScanRequestsManagementPage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      router.replace('/login');
      return;
    }

    const role = user?.publicMetadata?.role as string || 'patient';
    setUserRole(role);
    
    // Only allow admins to access this page
    if (role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    
    setIsLoading(false);
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading management interface</h2>
        </div>
      </div>
    );
  }

  return <ScanRequestsManagement />;
}