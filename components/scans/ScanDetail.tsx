'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ScanViewer from './ScanViewer';
import type { ScanDetailProps } from './types';

export default function ScanDetail({ scanId }: ScanDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [scanData, setScanData] = useState<any>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Fetch the scan data if we don't have it yet
      if (!scanData?.imageUrl) {
        const response = await fetch(`/api/scans/${scanId}`);
        if (!response.ok) throw new Error('Failed to fetch scan data');
        const data = await response.json();
        setScanData(data);
      }

      // Start download
      const response = await fetch(scanData.imageUrl);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan-${scanId}.jpg`; // You can adjust the extension based on actual file type
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Complete',
        description: 'The scan has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the scan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scan Details</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </Button>
          <Button variant="default">Start Analysis</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Scan Viewer */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <ScanViewer imageUrl="" controls />
          </Card>
        </div>

        {/* Metadata and Actions Panel */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Scan Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Patient</dt>
                <dd className="font-medium">Loading...</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Date</dt>
                <dd className="font-medium">Loading...</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="font-medium">Loading...</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Analysis Status</h3>
            {/* Analysis status indicators will go here */}
          </Card>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Card className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="py-4">
              {/* Overview content */}
              <p>Loading scan overview...</p>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="py-4">
              {/* Analysis results content */}
              <p>Loading analysis results...</p>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="py-4">
              {/* History content */}
              <p>Loading scan history...</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
