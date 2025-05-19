import { toast } from '@/hooks/use-toast';

export interface PredictionResult {
  predictions: {
    cataract: number;
    diabetic_retinopathy: number;
    glaucoma: number;
    normal: number;
  };
  top_prediction: string;
}

export const predictEyeDisease = async (
  image: File
): Promise<PredictionResult | null> => {
  try {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze image');
    }

    const data = await response.json();
    return data as PredictionResult;
  } catch (error) {
    console.error('Error predicting eye disease:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to analyze image',
      variant: 'destructive',
    });
    return null;
  }
};
