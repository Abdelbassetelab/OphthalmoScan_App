import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:8000/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // 3 second timeout
      signal: AbortSignal.timeout(3000),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: 'AI model service is not responding properly' },
        { status: 503 }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'online',
      message: data.message || 'AI model service is running',
    });
  } catch (error) {
    console.error('Error checking model status:', error);
    return NextResponse.json(
      { status: 'offline', message: 'AI model service is currently offline' },
      { status: 503 }
    );
  }
}
