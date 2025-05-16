import { UserRole } from '@/lib/auth/clerk-auth';
import { auth } from '@clerk/nextjs/server';

/**
 * Checks if the user has one of the allowed roles
 * @param allowedRoles Array of roles that have access
 * @returns Boolean indicating if the user has permission
 */
export function hasRequiredRole(allowedRoles: UserRole[]): boolean {
  const { userId } = auth();
  const user = auth().user;
  
  if (!userId || !user) {
    return false;
  }
  
  const userRole = user.publicMetadata?.role as UserRole || 'patient';
  
  return allowedRoles.includes(userRole);
}

/**
 * Role-specific access guards
 */
export const roleGuards = {
  /**
   * Checks if the user is an admin
   */
  isAdmin: (): boolean => {
    return hasRequiredRole(['admin']);
  },
  
  /**
   * Checks if the user is a doctor
   */
  isDoctor: (): boolean => {
    return hasRequiredRole(['doctor', 'admin']);
  },
  
  /**
   * Checks if the user is a patient
   */
  isPatient: (): boolean => {
    return hasRequiredRole(['patient']);
  },
  
  /**
   * Checks if the user is either a doctor or an admin
   */
  isDoctorOrAdmin: (): boolean => {
    return hasRequiredRole(['doctor', 'admin']);
  },
  
  /**
   * Checks if the user is a specific user by ID
   */
  isUser: (userId: string): boolean => {
    const clerkUserId = auth().userId;
    
    if (!clerkUserId) {
      return false;
    }
    
    return clerkUserId === userId;
  }
};

/**
 * Route access configuration for different parts of the app
 */
export const routePermissions = {
  // Dashboard routes
  '/dashboard': ['admin', 'doctor', 'patient'],
  '/dashboard/profile': ['admin', 'doctor', 'patient'],
  '/dashboard/settings': ['admin', 'doctor', 'patient'],
  
  // Patient-related routes
  '/dashboard/patients': ['admin', 'doctor'],
  '/dashboard/patients/new': ['admin', 'doctor'],
  '/dashboard/patients/[id]': ['admin', 'doctor'],
  
  // Scan-related routes
  '/dashboard/scans': ['admin', 'doctor', 'patient'],
  '/dashboard/scans/new': ['admin', 'doctor'],
  '/dashboard/scans/[id]': ['admin', 'doctor', 'patient'],
  
  // Diagnosis-related routes
  '/dashboard/diagnoses': ['admin', 'doctor', 'patient'],
  '/dashboard/diagnoses/new': ['admin', 'doctor'],
  '/dashboard/diagnoses/[id]': ['admin', 'doctor', 'patient'],
  
  // Admin-only routes
  '/dashboard/admin': ['admin'],
  '/dashboard/admin/users': ['admin'],
  '/dashboard/admin/audit': ['admin'],
} as const;