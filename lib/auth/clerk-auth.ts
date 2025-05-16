import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export type UserRole = "admin" | "doctor" | "patient";

export async function getUserRole(): Promise<UserRole> {
  const { userId } = auth();
  
  if (!userId) {
    return "patient"; // Default role for unauthenticated users
  }
  
  // With Clerk, you can store custom user metadata like role
  // This code assumes you've set up user roles in Clerk's dashboard or during sign-up
  const user = auth().user;
  
  return (user?.publicMetadata?.role as UserRole) || "patient";
}

export function isAuthenticated(): boolean {
  return !!auth().userId;
}

export function getCurrentUserId(): string | null {
  return auth().userId;
}

// Helper to check if a user has access to a route based on their role
export function hasRoleAccess(requiredRoles: UserRole[]): boolean {
  const user = auth().user;
  if (!user) return false;
  
  const userRole = (user.publicMetadata?.role as UserRole) || "patient";
  return requiredRoles.includes(userRole);
}

// For use in API routes
export async function getUserFromRequest(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return null;
  
  return auth().user;
}