'use client';

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import Image from 'next/image';
import { FileImage, UploadCloud, X, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { predictEyeDisease } from '@/lib/ai/predict-disease';

interface AnalysisResult {
  prediction: string;
  confidence: number;
  allPredictions: { label: string; probability: number }[];
}

export default function ModelTestPage() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();

  // Sample images
  const sampleImages = [
    { name: "1435_leftca.jpg", label: "Cataract Sample" },
    { name: "10007_right_dr.jpeg", label: "Diabetic Retinopathy Sample" },
    { name: "1212_rightg.jpg", label: "Glaucoma Sample" }
  ];

  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const response = await fetch('/api/ai/status');
        if (response.ok) {
          const data = await response.json();
          setServiceStatus(data.status === 'online' ? 'online' : 'offline');
        } else {
          setServiceStatus('offline');
        }
      } catch (error) {
        console.error('Error checking model status:', error);
        setServiceStatus('offline');
      }
    };

    checkModelStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };  const analyzeSampleImage = async (imageName: string) => {
    try {
      if (!user?.id) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to analyze images',
          variant: 'destructive',
        });
        return;
      }

      setIsAnalyzing(true);
      setResult(null);
      
      // Fetch the sample image from the public folder
      const response = await fetch(`/images/samples/${imageName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sample image');
      }
      
      const blob = await response.blob();
      // Create a File object from the blob
      const file = new File([blob], imageName, { type: blob.type });
      
      // Show the image preview
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Analyze the image with user ID
      const predictionResult = await predictEyeDisease(file, user.id);
      
      if (!predictionResult) {
        throw new Error('Failed to analyze the image');
      }
      
      const predictions = Object.entries(predictionResult.predictions).map(([label, probability]) => ({
        label,
        probability: probability * 100
      }));
      
      const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
      
      setResult({
        prediction: predictionResult.top_prediction,
        confidence: sortedPredictions[0].probability,
        allPredictions: sortedPredictions,
      });
      
      toast({
        title: 'Analysis Complete',
        description: `Primary diagnosis: ${formatCondition(predictionResult.top_prediction)}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error analyzing sample image:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze the sample image',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };  const handleAnalyzeImage = async () => {
    if (!file) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image to analyze',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to analyze images',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setResult(null);
      
      // Analyze the image with user ID
      const predictionResult = await predictEyeDisease(file, user.id);
      
      if (!predictionResult) {
        throw new Error('Failed to analyze the image');
      }
      
      const predictions = Object.entries(predictionResult.predictions).map(([label, probability]) => ({
        label,
        probability: probability * 100
      }));
      
      const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
      
      setResult({
        prediction: predictionResult.top_prediction,
        confidence: sortedPredictions[0].probability,
        allPredictions: sortedPredictions,
      });
      
      toast({
        title: 'Analysis Complete',
        description: `Primary diagnosis: ${formatCondition(predictionResult.top_prediction)}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze the image',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const clearImage = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
  };

  const formatCondition = (condition: string): string => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Model Testing Dashboard</h1>
        <div className="flex items-center gap-2">          <span>AI Service Status:</span>
          {serviceStatus === 'checking' && (
            <span className="text-gray-500">Checking...</span>
          )}
          {serviceStatus === 'online' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          )}
          {serviceStatus === 'offline' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Offline
            </span>
          )}
        </div></div>

      {serviceStatus === 'offline' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-yellow-700">
                The AI service is currently offline. Please ensure the FastAPI backend server is running.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample Images Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sample Images</h2>
          <div className="space-y-4">
            {sampleImages.map((sample) => (
              <div key={sample.name} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileImage className="h-5 w-5 text-blue-500" />
                  <span>{sample.label}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analyzeSampleImage(sample.name)}
                  disabled={isAnalyzing}
                  className="min-w-[80px]"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Upload Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Image Upload</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isAnalyzing}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-gray-600">Click to upload or drag and drop</span>
                <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>              </label>
            </div>

            {imagePreview && (
              <div className="relative mt-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                    unoptimized
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-2 right-2 rounded-full" 
                    onClick={clearImage}
                    disabled={isAnalyzing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                  {isAnalyzing && (
                  <div className="mt-2">
                    <div className="flex justify-center mt-2">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Analyzing image...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {file && !isAnalyzing && (
              <Button
                onClick={handleAnalyzeImage}
                className="w-full mt-4"
              >
                Analyze Image
              </Button>            )}
          </div>
        </Card>
      </div>

      {/* Results Card */}
      {result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <div className="space-y-4">
            <div className="bg-secondary p-4 rounded-lg">                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Primary Diagnosis:</span>
                  <span className="text-lg font-bold">{formatCondition(result.prediction)}</span>
                </div>
                <div className="space-y-3">
                  {result.allPredictions.map(({ label, probability }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span>{formatCondition(label)}:</span>
                        <span className="font-mono">{probability.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
