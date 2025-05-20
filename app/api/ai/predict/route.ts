import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the FastAPI backend
    const apiResponse = await fetch('http://localhost:8000/predict/', {
      method: 'POST',
      body: formData,
    });
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to analyze image' },
        { status: apiResponse.status }
      );
    }
      const data = await apiResponse.json();
      // Log the raw response for debugging
    console.log('Raw FastAPI response:', data);
    
    // Convert the FastAPI response format to our application's format if needed
    const formattedResponse = {
      predictions: data.class_probabilities,
      top_prediction: data.predicted_class
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
