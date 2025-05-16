'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// API endpoint for the Python backend
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ModelInfoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverStatus, setServerStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Check API health on page load
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      setServerStatus('checking');
      const response = await fetch(`${API_ENDPOINT}/api/health`);
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'healthy' && data.modelLoaded) {
        setServerStatus('available');
        toast({
          title: 'Server Status',
          description: 'Analysis server is up and running with the model loaded.',
          variant: 'default',
        });
      } else {
        setServerStatus('unavailable');
        toast({
          title: 'Server Warning',
          description: 'Analysis server is running but the model is not loaded properly.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setServerStatus('unavailable');
      toast({
        title: 'Server Error',
        description: 'Cannot connect to the analysis server. Please ensure it is running.',
        variant: 'destructive',
      });
    }
  };

  const goToAnalysis = () => {
    router.push('/scan-analysis');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Eye Scan Analysis Server</h1>

      <Card className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Server-Side Model Information</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <p className="mb-2">
              <span className="font-bold">Model Type:</span> EfficientNetB3
            </p>
            <p className="mb-2">
              <span className="font-bold">Accuracy:</span> 94.93%
            </p>
            <p className="mb-2">
              <span className="font-bold">Classes:</span> Cataract, Diabetic Retinopathy, Glaucoma, Normal
            </p>
            <p className="mb-2">
              <span className="font-bold">Resolution:</span> 224 x 224 pixels
            </p>
            <p>
              <span className="font-bold">Server Status:</span> 
              {serverStatus === 'checking' && <span className="text-blue-600"> Checking...</span>}
              {serverStatus === 'available' && <span className="text-green-600"> Active</span>}
              {serverStatus === 'unavailable' && <span className="text-red-600"> Unavailable</span>}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-bold mb-2">Technical Information</h3>
            <p className="mb-2">
              The eye scan analysis is now performed on a dedicated Python backend server using TensorFlow and the original EfficientNetB3 model. This approach provides more accurate results compared to client-side processing.
            </p>
            <p>
              The server loads the pre-trained model directly and processes images via a RESTful API, returning well-calibrated predictions for eye conditions.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={goToAnalysis}>
              Go to Scan Analysis
            </Button>
            <Button variant="outline" onClick={checkApiHealth}>
              Check Server Status
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
