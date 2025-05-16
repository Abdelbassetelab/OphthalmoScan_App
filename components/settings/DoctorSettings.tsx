'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export interface DoctorSettingsProps {
  className?: string;
}

export default function DoctorSettings({ className }: DoctorSettingsProps) {
  return (
    <Tabs defaultValue="diagnosis" className={`mt-8 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Doctor Settings</h2>
      
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
        <TabsTrigger value="patients">Patients</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="diagnosis">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Diagnosis Settings</h3>
          <p className="text-gray-500">Manage diagnosis preferences</p>
        </Card>
      </TabsContent>

      <TabsContent value="patients">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Patient Management</h3>
          <p className="text-gray-500">Configure patient management settings</p>
        </Card>
      </TabsContent>

      <TabsContent value="reports">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Report Settings</h3>
          <p className="text-gray-500">Customize report templates and preferences</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
