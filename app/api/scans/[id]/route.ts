import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const scanId = params.id;

    // TODO: Replace with your actual database query
    // This is a mock response for now
    const scanData = {
      id: scanId,
      patientId: 'mock-patient-id',
      doctorId: 'mock-doctor-id',
      imageUrl: `/uploads/${scanId}.jpg`, // Adjust based on your actual file storage
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      type: 'fundus',
      metadata: {}
    };

    return NextResponse.json(scanData);
  } catch (error) {
    console.error('Error fetching scan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
