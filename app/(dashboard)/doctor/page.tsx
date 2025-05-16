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
  ArrowRight
} from 'lucide-react';
import { Wrench as Tool } from 'lucide-react';
import { useEffect, useState } from 'react';

// Sample data - in a real application, you would fetch this from your API
const mockData = {
  appointments: {
    today: [
      { id: 1, patientName: 'John Smith', time: '09:30', status: 'Waiting', waitTime: '10 min' },
      { id: 2, patientName: 'Sarah Johnson', time: '10:45', status: 'Scheduled', waitTime: '1h 25m' },
      { id: 3, patientName: 'Michael Brown', time: '13:15', status: 'Scheduled', waitTime: '3h 55m' },
      { id: 4, patientName: 'Emily Davis', time: '15:00', status: 'Scheduled', waitTime: '5h 40m' }
    ],
    waiting: 1
  },
  scanReviews: {
    pending: 8,
    urgent: 2,
    recentlyReviewed: 12,
    aiFlagged: 3
  },
  recentDiagnoses: [
    { id: 1, patientName: 'Robert Wilson', condition: 'Glaucoma', severity: 'Moderate', date: '2025-05-13' },
    { id: 2, patientName: 'Amanda Lee', condition: 'Cataracts', severity: 'Mild', date: '2025-05-13' },
    { id: 3, patientName: 'Thomas Harris', condition: 'Diabetic Retinopathy', severity: 'Severe', date: '2025-05-12' },
    { id: 4, patientName: 'Jessica Garcia', condition: 'Macular Degeneration', severity: 'Moderate', date: '2025-05-12' },
    { id: 5, patientName: 'David Martinez', condition: 'Dry Eye Syndrome', severity: 'Mild', date: '2025-05-11' }
  ],
  performance: {
    patientsToday: 7,
    patientsThisWeek: 32,
    avgConsultTime: '22 min',
    diagnosisAccuracy: 92.5,
    aiDiagnosisMatch: 88
  }
};

export default function DoctorDashboardPage() {
  const { user } = useUser();
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

    setCurrentDate(formatCurrentDate());
  }, []);

  // Function to determine the severity color class
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild': return 'text-[#20C997]';
      case 'moderate': return 'text-[#F59E0B]';
      case 'severe': return 'text-[#EF4444]';
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
              Welcome back, Doctor {user?.username || user?.firstName || user?.lastName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || ''}
            </h1>
            <p className="text-gray-500">{currentDate}</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 rounded-lg flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#0A84FF] mr-2"></div>
            <span className="text-sm font-medium text-gray-700">Patient Queue: 
              <span className="ml-1 text-[#0A84FF]">{mockData.appointments.waiting} waiting</span>
            </span>
          </div>
        </div>
      </Card>
      
      {/* Quick Actions Panel - Moved to appear right after welcome section */}
      <Card className="p-5 bg-white shadow-sm rounded-xl border-none">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/doctor/scans/review" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Eye className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">New Scan Review</span>
          </a>
          
          <a href="/dashboard/doctor/patients/search" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Search className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">Search Patients</span>
          </a>
          
          <a href="/dashboard/doctor/appointments/schedule" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Calendar className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">Schedule Follow-up</span>
          </a>
          
          <a href="/dashboard/doctor/tools" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <Tool className="h-8 w-8 text-gray-500 group-hover:text-[#0A84FF] mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A84FF]">Diagnostic Tools</span>
          </a>
        </div>
      </Card>
      
      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Queue Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-blue-100">
              <Clock className="h-5 w-5 text-[#0A84FF]" />
            </div>
            <span className="text-sm font-medium text-[#0A84FF]">Today's Schedule</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Patient Queue</h3>
          
          <div className="mt-4 space-y-2">
            {mockData.appointments.today.map(appointment => (
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
            ))}
          </div>
          
          <div className="mt-4">
            <button className="w-full py-2 text-center text-sm font-medium text-white bg-[#0A84FF] rounded-lg hover:bg-blue-600 transition-colors">
              Start Next Consultation
            </button>
          </div>
        </Card>
        
        {/* Scan Review Status Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-indigo-100">
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex items-center">
              {mockData.scanReviews.urgent > 0 && (
                <span className="text-sm font-medium text-[#EF4444] flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {mockData.scanReviews.urgent} urgent
                </span>
              )}
            </div>
          </div>
          <h3 className="text-base font-medium text-gray-700">Scan Review Status</h3>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-500">Pending Review</span>
              <p className="text-2xl font-bold text-gray-900">{mockData.scanReviews.pending}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-500">AI-Flagged</span>
              <p className="text-2xl font-bold text-[#F59E0B]">{mockData.scanReviews.aiFlagged}</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Recently Reviewed: <span className="font-medium">{mockData.scanReviews.recentlyReviewed}</span></span>
            <a href="/dashboard/doctor/scans" className="text-sm text-[#0A84FF] hover:text-blue-700 font-medium flex items-center">
              Review All Scans <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </Card>
        
        {/* Recent Diagnoses Summary */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-teal-100">
              <Stethoscope className="h-5 w-5 text-[#20C997]" />
            </div>
            <span className="text-sm font-medium text-gray-500">Last 5 diagnoses</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Recent Diagnoses</h3>
          
          <div className="mt-4 space-y-3">
            {mockData.recentDiagnoses.map(diagnosis => (
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
            ))}
          </div>
          
          <div className="mt-4">
            <a href="/dashboard/doctor/diagnoses" className="text-sm text-[#0A84FF] hover:text-blue-700 font-medium">
              View All Diagnoses →
            </a>
          </div>
        </Card>
        
        {/* Performance Metrics Card */}
        <Card className="p-5 bg-white shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="rounded-full p-2 bg-purple-100">
              <LineChart className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">May 14, 2025</span>
          </div>
          <h3 className="text-base font-medium text-gray-700">Your Performance</h3>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-gray-500">Patients Today</span>
              <p className="text-xl font-bold text-gray-900">{mockData.performance.patientsToday}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Patients This Week</span>
              <p className="text-xl font-bold text-gray-900">{mockData.performance.patientsThisWeek}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Avg. Consultation</span>
              <p className="text-xl font-bold text-gray-900">{mockData.performance.avgConsultTime}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Diagnosis Accuracy</span>
              <p className="text-xl font-bold text-gray-900">{mockData.performance.diagnosisAccuracy}%</p>
            </div>
          </div>
          
          <div className="mt-4 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">AI Diagnosis Match</span>
              <span className="text-sm font-medium">{mockData.performance.aiDiagnosisMatch}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-[#0A84FF]" 
                style={{ width: `${mockData.performance.aiDiagnosisMatch}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}