'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { predictEyeDisease, PredictionResult } from '@/lib/ai/predict-disease';

interface AnalysisResult {
  prediction: string;
  confidence: number;
  allPredictions: { label: string; probability: number }[];
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
      
      const predictionResult = await predictEyeDisease(file);
      
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

  const formatCondition = (condition: string): string => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Eye Disease Analysis</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
              disabled={isAnalyzing}
            />
          </div>

          {imagePreview && (
            <div className="relative w-full aspect-video max-w-2xl mx-auto">
              <Image
                src={imagePreview}
                alt="Selected scan"
                fill
                className="rounded-lg shadow-lg object-contain"
                unoptimized
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={!file || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Analysis Results</h2>
            <div className="bg-secondary p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Primary Diagnosis:</span>
                <span className="text-lg font-bold">{formatCondition(result.prediction)}</span>
              </div>
              <div className="space-y-2">
                {result.allPredictions.map(({ label, probability }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span>{formatCondition(label)}:</span>
                    <span className="font-mono">{probability.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
