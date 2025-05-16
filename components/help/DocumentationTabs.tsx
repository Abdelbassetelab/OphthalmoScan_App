'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function DocumentationTabs() {
  return (
    <Tabs defaultValue="getting-started" className="space-y-4">
      <TabsList>
        <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
        <TabsTrigger value="user-guides">User Guides</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
      </TabsList>

      <TabsContent value="getting-started">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Getting Started with OphthalmoScan-AI</h2>
          <div className="space-y-4">
            <section>
              <h3 className="text-lg font-medium mb-2">1. Account Setup</h3>
              <p className="text-gray-600">Learn how to create and configure your account.</p>
            </section>
            <section>
              <h3 className="text-lg font-medium mb-2">2. Basic Navigation</h3>
              <p className="text-gray-600">Understanding the dashboard and main features.</p>
            </section>
            <section>
              <h3 className="text-lg font-medium mb-2">3. First Scan</h3>
              <p className="text-gray-600">How to upload and analyze your first eye scan.</p>
            </section>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="user-guides">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">User Guides</h2>
          {/* Role-specific content placeholders */}
          <div className="space-y-6">
            {/* @role-content: admin */}
            <section className="admin-content">
              <h3 className="text-lg font-medium mb-2">Administrator Guide</h3>
              <p className="text-gray-600">Managing users, system settings, and analytics.</p>
            </section>

            {/* @role-content: doctor */}
            <section className="doctor-content">
              <h3 className="text-lg font-medium mb-2">Doctor's Guide</h3>
              <p className="text-gray-600">Patient management and diagnosis tools.</p>
            </section>

            {/* @role-content: patient */}
            <section className="patient-content">
              <h3 className="text-lg font-medium mb-2">Patient's Guide</h3>
              <p className="text-gray-600">Viewing scans and understanding results.</p>
            </section>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="features">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">Advanced eye scan analysis using machine learning.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Patient Management</h3>
              <p className="text-gray-600">Comprehensive patient record system.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Real-time Collaboration</h3>
              <p className="text-gray-600">Share and discuss cases with colleagues.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Reporting</h3>
              <p className="text-gray-600">Generate detailed diagnostic reports.</p>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="troubleshooting">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-4">
            <section>
              <h3 className="text-lg font-medium mb-2">Common Issues</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Upload problems and solutions</li>
                <li>Account access issues</li>
                <li>Analysis errors</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-medium mb-2">System Requirements</h3>
              <p className="text-gray-600">Recommended browsers and settings.</p>
            </section>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
