'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export interface CommonSettingsProps {
  className?: string;
}

export default function CommonSettings({ className }: CommonSettingsProps) {
  return (
    <Tabs defaultValue="profile" className={className}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Profile Settings</h3>
          <p className="text-gray-500">Manage your profile information</p>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Appearance Settings</h3>
          <p className="text-gray-500">Customize the application appearance</p>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Notification Preferences</h3>
          <p className="text-gray-500">Manage your notification settings</p>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Security Settings</h3>
          <p className="text-gray-500">Manage your security preferences</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
