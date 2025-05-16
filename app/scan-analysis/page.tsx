'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// API endpoint from environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Prediction {
  label: string;
  probability: number;
}

interface AnalysisResult {
  prediction: string;
  confidence: number;
  allPredictions: Prediction[];
}

export default function ScanAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select an image to analyze',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const analysisData = await response.json();
      
      if (analysisData.error) {
        throw new Error(analysisData.error);
      }
      
      const predictions = analysisData.predictions;
      const sortedPredictions = [...predictions].sort((a, b) => 
        b.probability - a.probability
      );
      
      const topPrediction = sortedPredictions[0];
      
      setResult({
        prediction: topPrediction.label.toLowerCase(),
        confidence: topPrediction.probability * 100,
        allPredictions: sortedPredictions.map(p => ({
          label: p.label.toLowerCase(),
          probability: p.probability * 100
        })),
      });
      
      toast({
        title: 'Analysis Complete',
        description: `Primary diagnosis: ${formatCondition(topPrediction.label.toLowerCase())}`,
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'normal':
        return 'text-green-600';
      case 'cataract':
      case 'diabetic retinopathy':
      case 'glaucoma':
        return 'text-amber-600';
      default:
        return 'text-gray-700';
    }
  };

  const formatCondition = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'normal':
        return 'Normal (Healthy)';
      case 'cataract':
        return 'Cataract';
      case 'diabetic retinopathy':
      case 'diabetic_retinopathy':
        return 'Diabetic Retinopathy';
      case 'glaucoma':
        return 'Glaucoma';
      default:
        return condition;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Eye Scan Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Eye Scan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                {imagePreview ? (
                  <div className="relative w-full h-64 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="Eye scan preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload an eye scan image
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={!file || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          </form>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          
          {!result && !isAnalyzing && (
            <div className="text-center py-12 text-gray-500">
              <p>Upload and analyze an image to see results</p>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <p className="text-gray-600">Analyzing eye scan...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </div>
          )}
          
          {result && (
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-lg mb-1">Diagnosis:</p>
                <p className={`text-2xl font-bold ${getConditionColor(result.prediction)}`}>
                  {formatCondition(result.prediction)}
                </p>
                <p className="text-gray-600 mt-1">
                  Confidence: {result.confidence.toFixed(2)}%
                </p>
              </div>
              
              <div>
                <p className="font-medium mb-2">All detected conditions:</p>
                <div className="space-y-2">
                  {result.allPredictions.map((pred) => (
                    <div key={pred.label} className="flex justify-between items-center">
                      <span className="font-medium">{formatCondition(pred.label)}</span>
                      <div className="relative w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                          style={{ width: `${pred.probability}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 ml-2 w-16 text-right">
                        {pred.probability.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p className="italic">
                  Note: This analysis is for informational purposes only and should not replace 
                  professional medical advice.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
