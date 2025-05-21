import { toast } from '@/hooks/use-toast';

export interface PredictionResult {
  predicted_class: string;
  confidence: number;
  class_probabilities: {
    cataract: number;
    diabetic_retinopathy: number;
    glaucoma: number;
    normal: number;
  };
}

// Interface to maintain backward compatibility
export interface LegacyPredictionResult {
  predictions: {
    cataract: number;
    diabetic_retinopathy: number;
    glaucoma: number;
    normal: number;
  };
  top_prediction: string;
}

export const predictEyeDisease = async (
  image: File,
  userId: string
): Promise<LegacyPredictionResult | null> => {
  try {
    const formData = new FormData();
    formData.append('file', image); // 'file' is the parameter name expected by FastAPI
    formData.append('user_id', String(userId)); // Convert to string explicitly

    // Use our internal API route instead of directly accessing the FastAPI server
    const response = await fetch('/api/ai/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze image');
    }

    const data = await response.json();
    
    // Log the response for debugging
    console.log('API response:', data);
    
    return data as LegacyPredictionResult;
  } catch (error) {
    console.error('Error predicting eye disease:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An error occurred',
      variant: 'destructive',
    });
    return null;
  }
};
