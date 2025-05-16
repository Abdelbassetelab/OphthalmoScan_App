import { auth, clerkClient } from '@clerk/nextjs';
import { UserRole } from './clerk-auth';

/**
 * Check if the current user has a specific role
 * Can be used in server components
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const { userId } = auth();
  
  if (!userId) {
    return false;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const userRole = (user.publicMetadata?.role as UserRole) || 'patient';
    
    return userRole === role;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if the current user is an admin
 * Can be used in server components
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Check if the current user is a doctor
 * Can be used in server components
 */
export async function isDoctor(): Promise<boolean> {
  return hasRole('doctor');
}

/**
 * Check if the current user is a patient
 * Can be used in server components
 */
export async function isPatient(): Promise<boolean> {
  return hasRole('patient');
}

/**
 * Check if the current user can access certain data
 * For example, a doctor can access their assigned patients
 * An admin can access all data
 */
export async function canAccess(resourceType: string, resourceId?: string): Promise<boolean> {
  const { userId } = auth();
  
  if (!userId) {
    return false;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const userRole = (user.publicMetadata?.role as UserRole) || 'patient';
    
    // Admins can access everything
    if (userRole === 'admin') {
      return true;
    }
    
    // Add resource-specific access logic here
    // For example:
    if (resourceType === 'patient' && userRole === 'doctor') {
      // Check if this doctor is assigned to this patient
      // This would require a database query
      return true; // Simplified for now
    }
    
    if (resourceType === 'scan' && userRole === 'patient') {
      // Check if this scan belongs to the current patient
      // This would require a database query
      return userId === resourceId;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
}

/**
 * Get the appropriate dashboard path for the current user's role
 */
export async function getDashboardPathForCurrentUser(): Promise<string> {
  const { userId } = auth();
  
  if (!userId) {
    return '/login';
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const userRole = (user.publicMetadata?.role as UserRole) || 'patient';
    
    switch (userRole) {
      case 'admin':
        return '/dashboard/admin';
      case 'doctor':
        return '/dashboard/doctor';
      case 'patient':
      default:
        return '/dashboard/patient';
    }
  } catch (error) {
    console.error('Error getting dashboard path:', error);
    return '/login';
  }
}