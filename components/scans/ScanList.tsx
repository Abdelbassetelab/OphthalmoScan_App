'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import ScanCard from './ScanCard';
import type { ScanListProps } from './types';

export default function ScanList({ userRole }: ScanListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Role-specific sections
  const renderAdminSection = () => (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Total Scans</h3>
        <p className="text-2xl">0</p>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Pending Analysis</h3>
        <p className="text-2xl">0</p>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Completed Today</h3>
        <p className="text-2xl">0</p>
      </Card>
    </div>
  );

  const renderDoctorSection = () => (
    <div className="mb-6">
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-2">Awaiting Review</h3>
        {/* Awaiting review scans will go here */}
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Recently Diagnosed</h3>
        {/* Recently diagnosed scans will go here */}
      </Card>
    </div>
  );

  const renderPatientSection = () => (
    <div className="mb-6">
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-2">My Scans</h3>
        {/* Patient's scans will go here */}
      </Card>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scans</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="analyzed">Analyzed</SelectItem>
              <SelectItem value="diagnosed">Diagnosed</SelectItem>
            </SelectContent>
          </Select>
          {userRole !== 'patient' && (
            <Button variant="default">Upload New Scan</Button>
          )}
        </div>
      </div>

      {userRole === 'admin' && renderAdminSection()}
      {userRole === 'doctor' && renderDoctorSection()}
      {userRole === 'patient' && renderPatientSection()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Scan cards will be mapped here */}
      </div>
    </div>
  );
}
