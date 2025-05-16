'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export interface PatientSettingsProps {
  className?: string;
}

export default function PatientSettings({ className }: PatientSettingsProps) {
  return (
    <Tabs defaultValue="privacy" className={`mt-8 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Patient Settings</h2>
      
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="medical-info">Medical Info</TabsTrigger>
        <TabsTrigger value="access">Access</TabsTrigger>
      </TabsList>

      <TabsContent value="privacy">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Privacy Settings</h3>
          <p className="text-gray-500">Manage your privacy preferences</p>
        </Card>
      </TabsContent>

      <TabsContent value="medical-info">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Medical Information</h3>
          <p className="text-gray-500">Manage your medical information</p>
        </Card>
      </TabsContent>

      <TabsContent value="access">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Access Control</h3>
          <p className="text-gray-500">Manage access to your medical records</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
