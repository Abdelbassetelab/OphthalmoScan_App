import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { UserRole } from '@/lib/auth/clerk-auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate that the role is one of the allowed values
    if (!['admin', 'doctor', 'patient'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Use Clerk API to update the user metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role' },
      { status: 500 }
    );
  }
}