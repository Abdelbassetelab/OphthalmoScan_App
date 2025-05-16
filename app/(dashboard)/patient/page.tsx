'use client';

import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { 
  Calendar, 
  Clock, 
  Eye, 
  FileText, 
  TrendingUp,
  AlertCircle,
  Upload,
  MessageSquare,
  RefreshCw,
  BookOpen,
  PlusCircle,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Sample data - in a real application, you would fetch this from your API
const mockData = {
  appointments: {
    next: {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Ophthalmologist",
      date: "2025-05-20T10:30:00",
      location: "OphthalmoScan Clinic, Room 305"
    },
    upcoming: [
      { id: 2, doctorName: "Dr. Sarah Johnson", specialty: "Ophthalmologist", date: "2025-06-10T14:15:00" },
      { id: 3, doctorName: "Dr. Michael Chen", specialty: "Retina Specialist", date: "2025-06-25T09:00:00" }
    ]
  },
  scans: {
    recent: {
      id: 12,
      date: "2025-05-01",
      status: "Reviewed", // Pending, Processing, Reviewed
      findings: "Mild macular edema, reduced from previous scan",
      images: ["/images/scan-sample-1.jpg", "/images/scan-sample-2.jpg"]
    },
    history: [
      { id: 11, date: "2025-04-01", status: "Reviewed" },
      { id: 10, date: "2025-03-03", status: "Reviewed" },
      { id: 9, date: "2025-02-02", status: "Reviewed" }
    ]
  },
  treatment: {
    current: {
      medication: "Latanoprost 0.005% eye drops",
      instructions: "One drop in affected eye every evening",
      startDate: "2025-04-02",
      endDate: "2025-07-02",
      progress: 40, // percentage complete
      nextSteps: "Follow-up examination after 3 months of treatment"
    },
    compliance: 92 // percentage
  },
  metrics: {
    vision: {
      left: "20/30",
      right: "20/25",
      previousLeft: "20/40",
      previousRight: "20/30",
      improvementLeft: 25, // percentage
      improvementRight: 16.7 // percentage
    },
    pressure: {
      left: 18,
      right: 17,
      previousLeft: 22,
      previousRight: 20,
      target: "Under 21",
      improvementLeft: 18.2, // percentage
      improvementRight: 15 // percentage
    }
  }
};

export default function PatientDashboardPage() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    // Format current date
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

    // Calculate appointment countdown
    if (mockData.appointments.next) {
      calculateCountdown();
      const timer = setInterval(calculateCountdown, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, []);

  // Function to calculate countdown to next appointment
  const calculateCountdown = () => {
    const now = new Date();
    const appointmentDate = new Date(mockData.appointments.next.date);
    const timeRemaining = appointmentDate.getTime() - now.getTime();
    
    if (timeRemaining <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0 });
      return;
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    setCountdown({ days, hours, minutes });
  };

  // Function to get the status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-amber-500';
      case 'processing': return 'text-blue-500';
      case 'reviewed': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6 bg-white shadow-sm rounded-xl border-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.username || user?.firstName || user?.lastName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || ''}
            </h1>
            <p className="text-gray-500">{currentDate}</p>
          </div>
          {mockData.appointments.next && (
            <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 rounded-lg flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#0A84FF] mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Next Appointment: 
                <span className="ml-1 text-[#0A84FF]">
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m
                </span>
              </span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Quick Actions Panel - At the top for immediate access */}
      <Card className="p-5 bg-white shadow-sm rounded-xl border-none">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/patient/scans/upload" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Upload className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">Upload New Scan</span>
          </a>
          
          <a href="/dashboard/patient/messages" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <MessageSquare className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">Message Doctor</span>
          </a>
          
          <a href="/dashboard/patient/prescriptions/refill" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <RefreshCw className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">Request Refill</span>
          </a>
          
          <a href="/dashboard/patient/resources" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <BookOpen className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">Educational Resources</span>
          </a>
        </div>
      </Card>
      
      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-blue-100">
              <Calendar className="h-5 w-5 text-[#0A84FF]" />
            </div>
            <span className="text-sm font-medium text-[#0A84FF]">{new Date(mockData.appointments.next?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Upcoming Appointment</h3>
          
          {mockData.appointments.next ? (
            <div className="mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{mockData.appointments.next.doctorName}</h4>
                    <p className="text-sm text-gray-500">{mockData.appointments.next.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{new Date(mockData.appointments.next.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-gray-500">{countdown.days}d {countdown.hours}h {countdown.minutes}m</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{mockData.appointments.next.location}</p>
                
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 text-center text-xs font-medium text-white bg-[#0A84FF] rounded-lg hover:bg-blue-600 transition-colors">
                    Reschedule
                  </button>
                  <button className="flex-1 py-2 text-center text-xs font-medium text-red-500 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
              
              {mockData.appointments.upcoming.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Future Appointments</h4>
                  <div className="space-y-2">
                    {mockData.appointments.upcoming.map(appointment => (
                      <div key={appointment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{appointment.doctorName}</p>
                          <p className="text-xs text-gray-500">{appointment.specialty}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-700">
                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col items-center">
              <p className="text-gray-600 mb-3">No upcoming appointments scheduled</p>
              <a href="/dashboard/patient/appointments/book" className="inline-flex items-center text-sm font-medium text-[#0A84FF]">
                <PlusCircle className="h-4 w-4 mr-1" /> Book an appointment
              </a>
            </div>
          )}
        </Card>
        
        {/* Scan Results Status Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-indigo-100">
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
            <span className={`text-sm font-medium ${getStatusColor(mockData.scans.recent.status)}`}>
              {mockData.scans.recent.status}
            </span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Recent Scan Results</h3>
          
          <div className="mt-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-3">
                <p className="text-sm text-gray-600">
                  Scan Date: <span className="font-medium">{mockData.scans.recent.date}</span>
                </p>
                <a href={`/dashboard/patient/scans/${mockData.scans.recent.id}`} className="text-xs text-[#0A84FF]">View Details</a>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{mockData.scans.recent.findings}</p>
              
              {/* Scan Images Preview */}
              <div className="flex gap-2 mb-2">
                {mockData.scans.recent.images.map((image, index) => (
                  <div key={index} className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden">
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scan History */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Scans</h4>
              <div className="space-y-2">
                {mockData.scans.history.map(scan => (
                  <div key={scan.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800">Scan #{scan.id}</p>
                    <div className="flex items-center">
                      <span className={`text-xs mr-2 ${getStatusColor(scan.status)}`}>{scan.status}</span>
                      <p className="text-xs text-gray-500">{scan.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Treatment Plan Summary */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-teal-100">
              <FileText className="h-5 w-5 text-[#20C997]" />
            </div>
            <span className="text-sm font-medium text-teal-500">Active Treatment</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Treatment Plan</h3>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-800">Current Medication</h4>
              <p className="text-sm text-gray-700">{mockData.treatment.current.medication}</p>
              <p className="text-xs text-gray-500 mt-1">{mockData.treatment.current.instructions}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Treatment Progress</span>
                <span>{mockData.treatment.current.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#20C997]"
                  style={{ width: `${mockData.treatment.current.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{mockData.treatment.current.startDate}</span>
                <span>{mockData.treatment.current.endDate}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-800">Next Steps</h4>
              <p className="text-sm text-gray-700">{mockData.treatment.current.nextSteps}</p>
            </div>
            
            {/* Compliance Indicator */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Treatment Compliance</span>
                <span className={mockData.treatment.compliance >= 90 ? "text-green-500" : "text-amber-500"}>
                  {mockData.treatment.compliance}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full ${mockData.treatment.compliance >= 90 ? "bg-green-500" : "bg-amber-500"}`}
                  style={{ width: `${mockData.treatment.compliance}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Health Metrics Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Last Updated: May 1, 2025</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Health Metrics</h3>
          
          <div className="mt-4 space-y-4">
            {/* Vision Metrics */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Vision Acuity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Left Eye</p>
                  <div className="flex items-center mt-1">
                    <p className="text-lg font-bold text-gray-800">{mockData.metrics.vision.left}</p>
                    {mockData.metrics.vision.improvementLeft > 0 && (
                      <span className="ml-2 text-xs text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {mockData.metrics.vision.improvementLeft}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Previous: {mockData.metrics.vision.previousLeft}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Right Eye</p>
                  <div className="flex items-center mt-1">
                    <p className="text-lg font-bold text-gray-800">{mockData.metrics.vision.right}</p>
                    {mockData.metrics.vision.improvementRight > 0 && (
                      <span className="ml-2 text-xs text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {mockData.metrics.vision.improvementRight}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Previous: {mockData.metrics.vision.previousRight}</p>
                </div>
              </div>
            </div>
            
            {/* Pressure Metrics */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Intraocular Pressure (mmHg)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Left Eye</p>
                  <div className="flex items-center mt-1">
                    <p className="text-lg font-bold text-gray-800">{mockData.metrics.pressure.left}</p>
                    {mockData.metrics.pressure.improvementLeft > 0 && (
                      <span className="ml-2 text-xs text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {mockData.metrics.pressure.improvementLeft}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Previous: {mockData.metrics.pressure.previousLeft}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Right Eye</p>
                  <div className="flex items-center mt-1">
                    <p className="text-lg font-bold text-gray-800">{mockData.metrics.pressure.right}</p>
                    {mockData.metrics.pressure.improvementRight > 0 && (
                      <span className="ml-2 text-xs text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {mockData.metrics.pressure.improvementRight}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Previous: {mockData.metrics.pressure.previousRight}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Target: {mockData.metrics.pressure.target}</p>
            </div>
            
            <a href="/dashboard/patient/metrics" className="block text-center text-sm text-[#0A84FF] hover:text-blue-700">
              View All Health Metrics →
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}