'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export interface AdminSettingsProps {
  className?: string;
}

export default function AdminSettings({ className }: AdminSettingsProps) {
  return (
    <Tabs defaultValue="system" className={`mt-8 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Administrator Settings</h2>
      
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="system">System</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="ai-models">AI Models</TabsTrigger>
        <TabsTrigger value="audit">Audit</TabsTrigger>
      </TabsList>

      <TabsContent value="system">
        <Card className="p-6">
          <h3 className="text-lg font-medium">System Settings</h3>
          <p className="text-gray-500">Manage system-wide configurations</p>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <Card className="p-6">
          <h3 className="text-lg font-medium">User Management</h3>
          <p className="text-gray-500">Manage user accounts and permissions</p>
        </Card>
      </TabsContent>

      <TabsContent value="ai-models">
        <Card className="p-6">
          <h3 className="text-lg font-medium">AI Model Settings</h3>
          <p className="text-gray-500">Manage AI model configurations</p>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Audit Logs</h3>
          <p className="text-gray-500">View system audit logs</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
