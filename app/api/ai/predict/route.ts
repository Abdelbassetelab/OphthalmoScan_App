import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

interface PredictionResponse {
  predictions?: Record<string, number>;
  class_probabilities?: Record<string, number>;
  top_prediction?: string;
  predicted_class?: string;
  confidence?: number;
  prediction_id?: string;
  saved_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the user ID from Clerk
    const { userId } = await auth();
    if (!userId || userId.toLowerCase() === 'anonymous') {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication required' },
        { status: 401 }
      );
    }

    // Get the original form data
    const originalFormData = await request.formData();
    const newFormData = new FormData();
    
    // Add user_id first (as required by FastAPI endpoint)
    newFormData.append('user_id', String(userId));
    
    // Add the file
    const file = originalFormData.get('file');
    if (file) {
      newFormData.append('file', file);
    }
    
    // Forward the request to the FastAPI backend
    const apiResponse = await fetch('http://localhost:8000/predict/', {
      method: 'POST',
      body: newFormData,
    });
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to analyze image' },
        { status: apiResponse.status }
      );
    }

    const data: PredictionResponse = await apiResponse.json();
    console.log('Raw FastAPI response:', data);

    // Format response for frontend to maintain backward compatibility
    const formattedResponse = {
      predictions: data.predictions || data.class_probabilities || {},
      top_prediction: data.top_prediction || data.predicted_class || 'unknown',
      confidence: data.confidence || 0,
      prediction_id: data.prediction_id || undefined,
      saved_at: data.saved_at || undefined
    };
    
    console.log('Formatted response:', formattedResponse);
    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
