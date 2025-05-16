import { auth, clerkClient } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from './clerk-auth';

type HandlerFunction = (req: NextRequest) => Promise<NextResponse> | NextResponse;

export function withRoleProtection(allowedRoles: UserRole[], handler: HandlerFunction) {
  return async (req: NextRequest) => {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      const user = await clerkClient.users.getUser(userId);
      const userRole = (user.publicMetadata?.role as UserRole) || 'patient';

      if (!allowedRoles.includes(userRole)) {
        return new NextResponse('Forbidden', { status: 403 });
      }

      // Attach the user role to the request for use in the handler
      (req as any).userRole = userRole;
      return handler(req);
    } catch (error) {
      console.error('Error in role protection:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  };
}

// Helper function to check if the current user is an admin
export async function isAdmin(): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;

  try {
    const user = await clerkClient.users.getUser(userId);
    return user.publicMetadata?.role === 'admin';
  } catch {
    return false;
  }
}

// Helper function to check if the current user is a doctor
export async function isDoctor(): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;

  try {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role as UserRole;
    return role === 'doctor' || role === 'admin';
  } catch {
    return false;
  }
}

// Helper function to verify user has access to a specific patient
export async function canAccessPatient(patientId: string): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;

  try {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role as UserRole;

    // Admins and doctors can access all patients
    if (role === 'admin' || role === 'doctor') return true;

    // Patients can only access their own records
    if (role === 'patient') {
      return userId === patientId;
    }

    return false;
  } catch {
    return false;
  }
}