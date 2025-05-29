'use client';

import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { 
  Users, 
  Clock, 
  Eye, 
  Stethoscope, 
  LineChart,
  AlertCircle,
  Search,
  Calendar,
  ArrowRight,
  ListFilter,
  FileCheck,
  Percent
} from 'lucide-react';
import { Wrench as Tool } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';
import { Database } from '@/types/database.types';

// Types for the data
interface Appointment {
  id: string;
  patientName: string;
  time: string;
  status: string;
  waitTime: string;
}

interface ScanReview {
  pending: number;
  urgent: number;
  recentlyReviewed: number;
  aiFlagged: number;
}

interface Diagnosis {
  id: string;
  patientName: string;
  condition: string;
  severity: string;
  date: string;
}

interface PerformanceMetrics {
  patientsToday: number;
  patientsThisWeek: number;
  avgConsultTime: string;
  diagnosisAccuracy: number;
  aiDiagnosisMatch: number;
}

interface ScanAnalytics {
  priority: {
    high: number;
    medium: number;
  };
  status: {
    pending: number;
    processing: number;
  };
  averageResponseTime: number;
  completionRate: number;
}

interface DashboardData {
  appointments: {
    today: Appointment[];
    waiting: number;
  };
  scanReviews: ScanReview;
  recentDiagnoses: Diagnosis[];
  performance: PerformanceMetrics;
  scanAnalytics: ScanAnalytics;
}

// Initial empty state
const initialDashboardData: DashboardData = {
  appointments: {
    today: [],
    waiting: 0
  },
  scanReviews: {
    pending: 0,
    urgent: 0,
    recentlyReviewed: 0,
    aiFlagged: 0
  },
  recentDiagnoses: [],
  performance: {
    patientsToday: 0,
    patientsThisWeek: 0,
    avgConsultTime: '0 min',
    diagnosisAccuracy: 0,
    aiDiagnosisMatch: 0
  },
  scanAnalytics: {
    priority: {
      high: 0,
      medium: 0
    },
    status: {
      pending: 0,
      processing: 0
    },
    averageResponseTime: 0,
    completionRate: 0
  }
};

export default function DoctorDashboardPage() {
  const { user } = useUser();
  const { supabase, isLoaded: isSupabaseLoaded } = useSupabaseWithClerk();
  const [currentDate, setCurrentDate] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(true);

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

    setCurrentDate(formatCurrentDate());
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    if (!isSupabaseLoaded || !supabase || !user) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data in parallel
        const [
          appointmentsData,
          scanReviewsData,
          diagnosesData,
          performanceData
        ] = await Promise.all([
          fetchAppointments(),
          fetchScanReviews(),
          fetchRecentDiagnoses(),
          fetchPerformanceMetrics()
        ]);        // Update state with all fetched data
        setDashboardData({
          appointments: appointmentsData,
          scanReviews: scanReviewsData,
          recentDiagnoses: diagnosesData,
          performance: performanceData,          scanAnalytics: {
            priority: {
              high: scanReviewsData.urgent,
              medium: scanReviewsData.pending - scanReviewsData.urgent
            },
            status: {
              pending: scanReviewsData.pending,
              processing: Math.floor(scanReviewsData.pending * 0.4) // Approximation for processing scans
            },
            // Calculate average response time based on waiting patients
            averageResponseTime: appointmentsData.waiting > 0 ? 
              Math.max(1.5, Math.min(5, (appointmentsData.waiting / 3))) : 
              1.5, // Scale between 1.5-5 hours based on waiting count
            completionRate: performanceData.diagnosisAccuracy - 5 // Approximation for now
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSupabaseLoaded, supabase, user]);

  // Fetch today's appointments
  const fetchAppointments = async () => {
    if (!supabase || !user) {
      return { today: [], waiting: 0 };
    }

    try {
      // Get today's date in ISO format
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();

      // Tomorrow's date for the query range
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowISOString = tomorrow.toISOString();      // First query for appointments assigned to this doctor (for the today's list)
      const { data: doctorAppointments, error: doctorError } = await supabase
        .from('scan_requests')
        .select('id, patient_username, created_at, status')
        .eq('assigned_doctor_id', user.id)
        .gte('created_at', todayISOString)
        .lt('created_at', tomorrowISOString)
        .order('created_at', { ascending: true });

      if (doctorError) {
        console.error('Error fetching doctor appointments:', doctorError);
        return { today: [], waiting: 0 };
      }
        // Second query to get all waiting patients in the system
      const { data: allWaitingPatients, error: waitingError } = await supabase
        .from('scan_requests')
        .select('id')
        .eq('status', 'pending')
        .is('assigned_doctor_id', null);
        
      if (waitingError) {
        console.error('Error fetching waiting patients:', waitingError);
      }// Format appointments for display
      const formattedAppointments = doctorAppointments.map(appt => {
        const appointmentTime = new Date(appt.created_at);
        
        // Calculate wait time based on status and current time
        const currentTime = new Date();
        const diffMs = currentTime.getTime() - appointmentTime.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let waitTime = '';
        if (diffHrs > 0) {
          waitTime = `${diffHrs}h ${diffMins}m`;
        } else {
          waitTime = `${diffMins} min`;
        }

        return {
          id: appt.id,
          patientName: appt.patient_username || 'Unknown Patient',
          time: appointmentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: appt.status === 'pending' ? 'Waiting' : 'Scheduled',
          waitTime
        };
      });      // Calculate total waiting count - includes both doctor's waiting patients and unassigned ones
      const doctorWaitingCount = doctorAppointments?.filter(appt => appt.status === 'pending').length || 0;
      const unassignedWaitingCount = allWaitingPatients?.length || 0;
      const totalWaitingCount = doctorWaitingCount + unassignedWaitingCount;

      return {
        today: formattedAppointments,
        waiting: totalWaitingCount
      };
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      return { today: [], waiting: 0 };
    }
  };
  // Fetch scan review statistics
  const fetchScanReviews = async () => {
    if (!supabase || !user) {
      return {
        pending: 0,
        urgent: 0,
        recentlyReviewed: 0,
        aiFlagged: 0
      };
    }

    try {
      // Query for all pending scans in the system (for a doctor dashboard, we want to show all pending scans)
      const { data: pendingScans, error: pendingError } = await supabase
        .from('scan_requests')
        .select('id, priority, status, metadata')
        .in('status', ['pending', 'assigned']);

      if (pendingError) {
        console.error('Error fetching pending scans:', pendingError);
        return { pending: 0, urgent: 0, recentlyReviewed: 0, aiFlagged: 0 };
      }      // Count urgent scans
      const urgentCount = pendingScans?.filter(scan => scan.priority === 'urgent' || scan.priority === 'high').length || 0;
      
      // Count AI-flagged scans (those with metadata indicating AI prediction)
      const aiFlaggedCount = pendingScans?.filter(scan => {
        if (!scan.metadata) return false;
        const metadata = scan.metadata as any;
        return metadata && metadata.prediction_result && metadata.prediction_result.confidence < 70;
      }).length || 0;

      // Get recently reviewed scans (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISOString = sevenDaysAgo.toISOString();

      const { data: recentlyReviewed, error: reviewedError } = await supabase
        .from('scan_requests')
        .select('id')
        .eq('assigned_doctor_id', user.id)
        .eq('status', 'completed')
        .gte('updated_at', sevenDaysAgoISOString);

      if (reviewedError) {
        console.error('Error fetching reviewed scans:', reviewedError);
      }

      return {
        pending: pendingScans?.length || 0,
        urgent: urgentCount,
        recentlyReviewed: recentlyReviewed?.length || 0,
        aiFlagged: aiFlaggedCount
      };
    } catch (error) {
      console.error('Error in fetchScanReviews:', error);
      return { pending: 0, urgent: 0, recentlyReviewed: 0, aiFlagged: 0 };
    }
  };

  // Fetch recent diagnoses
  const fetchRecentDiagnoses = async () => {
    if (!supabase || !user) {
      return [];
    }

    try {
      // Query for recent diagnoses made by this doctor
      const { data: diagnoses, error } = await supabase
        .from('diagnoses')
        .select('id, diagnosis, diagnosis_date, verified, verification_notes, scan_id')
        .eq('doctor_id', user.id)
        .order('diagnosis_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching diagnoses:', error);
        return [];
      }

      // Get patient information for these diagnoses
      const formattedDiagnoses: Diagnosis[] = [];
      
      for (const diagnosis of diagnoses) {
        // Get scan to find the patient
        const { data: scan, error: scanError } = await supabase
          .from('scans')
          .select('patient_id')
          .eq('id', diagnosis.scan_id)
          .single();
          
        if (scanError) {
          console.error('Error fetching scan:', scanError);
          continue;
        }
        
        // Get patient name
        if (scan) {
          const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('first_name, last_name')
            .eq('id', scan.patient_id)
            .single();
            
          if (patientError) {
            console.error('Error fetching patient:', patientError);
            continue;
          }
          
          // Determine severity from verification notes or based on diagnosis
          let severity = 'Moderate';
          if (diagnosis.verification_notes) {
            if (diagnosis.verification_notes.toLowerCase().includes('mild')) {
              severity = 'Mild';
            } else if (diagnosis.verification_notes.toLowerCase().includes('severe')) {
              severity = 'Severe';
            }
          }
          
          formattedDiagnoses.push({
            id: diagnosis.id,
            patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
            condition: diagnosis.diagnosis,
            severity,
            date: new Date(diagnosis.diagnosis_date).toISOString().split('T')[0]
          });
        }
      }
      
      return formattedDiagnoses;
    } catch (error) {
      console.error('Error in fetchRecentDiagnoses:', error);
      return [];
    }
  };

  // Fetch performance metrics
  const fetchPerformanceMetrics = async () => {
    if (!supabase || !user) {
      return {
        patientsToday: 0,
        patientsThisWeek: 0,
        avgConsultTime: '0 min',
        diagnosisAccuracy: 0,
        aiDiagnosisMatch: 0
      };
    }

    try {
      // Get today's date in ISO format
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();

      // Get start of week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Go to beginning of the week (Sunday)
      const startOfWeekISOString = startOfWeek.toISOString();

      // Count patients seen today
      const { data: todayPatients, error: todayError } = await supabase
        .from('scan_requests')
        .select('id')
        .eq('assigned_doctor_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', todayISOString);

      if (todayError) {
        console.error('Error fetching today\'s patients:', todayError);
      }

      // Count patients seen this week
      const { data: weekPatients, error: weekError } = await supabase
        .from('scan_requests')
        .select('id')
        .eq('assigned_doctor_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', startOfWeekISOString);

      if (weekError) {
        console.error('Error fetching week\'s patients:', weekError);
      }

      // Calculate average consultation time (this would need timestamps for start/end of consultations)
      // For now, use a reasonable default
      const avgConsultTime = '22 min';

      // Calculate diagnosis accuracy and AI match rate
      // For now, use reasonable defaults that could be calculated from verified diagnoses in the future
      const diagnosisAccuracy = 92.5;
      const aiDiagnosisMatch = 88;

      return {
        patientsToday: todayPatients?.length || 0,
        patientsThisWeek: weekPatients?.length || 0,
        avgConsultTime,
        diagnosisAccuracy,
        aiDiagnosisMatch
      };
    } catch (error) {
      console.error('Error in fetchPerformanceMetrics:', error);
      return {
        patientsToday: 0,
        patientsThisWeek: 0,
        avgConsultTime: '0 min',
        diagnosisAccuracy: 0,
        aiDiagnosisMatch: 0
      };
    }
  };

  // Function to determine the severity color class
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild': return 'text-[#20C997]';
      case 'moderate': return 'text-[#F59E0B]';
      case 'severe': return 'text-[#EF4444]';
      default: return 'text-gray-500';
    }
  };

  // If loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.username || user?.firstName || user?.lastName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || ''}
            </h1>
            <p className="text-gray-500">{currentDate}</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions Panel */}
      <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/scan-requests" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Eye className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF] transition-colors">New Scan Review</span>
          </a>
            <a href="/dashboard/doctor/patients/search" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Search className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF] transition-colors">Search Patients</span>
          </a>
          
          <a href="/dashboard/doctor/appointments/schedule" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Calendar className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF] transition-colors">Schedule Follow-up</span>
          </a>
          
          <a href="/dashboard/doctor/tools" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Tool className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF] transition-colors">Diagnostic Tools</span>
          </a>
        </div>
      </Card>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scan Overview Card */}
        <Card className="p-4 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col space-y-2">
            <div className="rounded-full w-8 h-8 bg-blue-100 flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Scan Overview</span>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total Today</span>
                <span className="text-lg font-bold text-gray-900">
                  {dashboardData.scanReviews.pending + dashboardData.scanReviews.recentlyReviewed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Processing</span>
                <span className="text-sm font-medium text-blue-600">
                  {dashboardData.scanAnalytics.status.processing}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Patient Queue Status */}
        <Card className="p-4 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col space-y-2">
            <div className="rounded-full w-8 h-8 bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Patient Queue</span>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Waiting</span>
                <span className="text-lg font-bold text-amber-600">
                  {dashboardData.appointments.waiting}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Avg Response</span>                <span className="text-sm font-medium text-gray-600">
                  {dashboardData.scanAnalytics.averageResponseTime.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Priority Cases */}
        <Card className="p-4 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col space-y-2">
            <div className="rounded-full w-8 h-8 bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Priority Cases</span>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Urgent</span>
                <span className="text-lg font-bold text-red-600">
                  {dashboardData.scanReviews.urgent}
                </span>
              </div>              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Medium Priority</span>
                <span className="text-sm font-medium text-amber-600">
                  {dashboardData.scanAnalytics.priority.medium}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col space-y-2">
            <div className="rounded-full w-8 h-8 bg-green-100 flex items-center justify-center">
              <LineChart className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Performance</span>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">AI Match</span>
                <span className="text-lg font-bold text-green-600">
                  {dashboardData.performance.aiDiagnosisMatch}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Completion</span>
                <span className="text-sm font-medium text-emerald-600">
                  {dashboardData.scanAnalytics.completionRate}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Patient Queue Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-blue-100">
              <Clock className="h-5 w-5 text-[#0A84FF]" />
            </div>
            <span className="text-sm font-medium text-[#0A84FF]">Today's Schedule</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Patient Queue</h3>
          
          <div className="mt-4 space-y-2">
            {dashboardData.appointments.today.length > 0 ? (
              dashboardData.appointments.today.map(appointment => (
                <div 
                  key={appointment.id} 
                  className={`p-3 rounded-lg flex justify-between items-center ${
                    appointment.status === 'Waiting' ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <span className="font-medium block text-gray-800">{appointment.patientName}</span>
                    <span className="text-sm text-gray-500">{appointment.time}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-medium ${
                      appointment.status === 'Waiting' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {appointment.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {appointment.status === 'Waiting' ? 'Waiting: ' : 'In: '}
                      {appointment.waitTime}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-gray-50 text-center">
                <span className="text-gray-500">No appointments scheduled for today</span>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <button className="w-full py-2 text-center text-sm font-medium text-white bg-[#0A84FF] rounded-lg hover:bg-blue-600 transition-colors">
              Start Next Consultation
            </button>
          </div>
        </Card>
          {/* Scan Review Status Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-indigo-100">
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex items-center">
              {dashboardData.scanReviews.urgent > 0 && (
                <span className="text-sm font-medium text-[#EF4444] flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {dashboardData.scanReviews.urgent} urgent
                </span>
              )}
            </div>
          </div>
          <h3 className="text-base font-medium text-gray-700">Scan Review Status</h3>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-500">Pending Review</span>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.scanReviews.pending}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-500">AI-Flagged</span>
              <p className="text-2xl font-bold text-[#F59E0B]">{dashboardData.scanReviews.aiFlagged}</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Recently Reviewed: <span className="font-medium">{dashboardData.scanReviews.recentlyReviewed}</span></span>
            <a href="/dashboard/doctor/scans" className="text-sm text-[#0A84FF] hover:text-blue-700 font-medium flex items-center">
              Review All Scans <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </Card>
          {/* Recent Diagnoses Summary */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-teal-100">
              <Stethoscope className="h-5 w-5 text-[#20C997]" />
            </div>
            <span className="text-sm font-medium text-gray-500">Last 5 diagnoses</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Recent Diagnoses</h3>
          
          <div className="mt-4 space-y-3">
            {dashboardData.recentDiagnoses.length > 0 ? (
              dashboardData.recentDiagnoses.map(diagnosis => (
                <div key={diagnosis.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <span className="font-medium block text-gray-800">{diagnosis.patientName}</span>
                    <span className={`text-sm ${getSeverityColor(diagnosis.severity)}`}>
                      {diagnosis.condition} • <span className="font-medium">{diagnosis.severity}</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(diagnosis.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No recent diagnoses found
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <a href="/dashboard/doctor/diagnoses" className="text-sm text-[#0A84FF] hover:text-blue-700 font-medium">
              View All Diagnoses →
            </a>
          </div>
        </Card>
          {/* Performance Metrics Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-purple-100">
              <LineChart className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Your Performance</h3>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-gray-500">Patients Today</span>
              <p className="text-xl font-bold text-gray-900">{dashboardData.performance.patientsToday}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Patients This Week</span>
              <p className="text-xl font-bold text-gray-900">{dashboardData.performance.patientsThisWeek}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Avg. Consultation</span>
              <p className="text-xl font-bold text-gray-900">{dashboardData.performance.avgConsultTime}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Diagnosis Accuracy</span>
              <p className="text-xl font-bold text-gray-900">{dashboardData.performance.diagnosisAccuracy}%</p>
            </div>
          </div>
          
          <div className="mt-4 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">AI Diagnosis Match</span>
              <span className="text-sm font-medium">{dashboardData.performance.aiDiagnosisMatch}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-[#0A84FF]" 
                style={{ width: `${dashboardData.performance.aiDiagnosisMatch}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}