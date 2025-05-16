import { auth, clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/lib/auth/clerk-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Get the user from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Get the role from user's public metadata
    const role = (user.publicMetadata?.role as UserRole) || 'patient';

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    // Only admins can change roles
    const currentUser = await clerkClient.users.getUser(userId!);
    if (currentUser.publicMetadata?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { userId: targetUserId, role } = await request.json();

    if (!targetUserId || !role) {
      return new NextResponse('User ID and role are required', { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'doctor', 'patient'];
    if (!validRoles.includes(role)) {
      return new NextResponse('Invalid role', { status: 400 });
    }

    // Update the user's public metadata with their role
    await clerkClient.users.updateUser(targetUserId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}