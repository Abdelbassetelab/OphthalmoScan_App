'use client';

import type { UserRole } from './clerk-auth';

/**
 * Helper function to check if a user has admin privileges
 * @param role The user's role
 * @returns boolean indicating if the user has admin privileges
 */
export function isAdminOrDoctor(role: UserRole | null): boolean {
  return role === 'admin' || role === 'doctor';
}

/**
 * Helper function to check if a user is a patient
 * @param role The user's role
 * @returns boolean indicating if the user is a patient
 */
export function isPatient(role: UserRole | null): boolean {
  return role === 'patient';
}

/**
 * Helper function to check if a user has admin privileges
 * @param role The user's role
 * @returns boolean indicating if the user has admin privileges
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'admin';
}

/**
 * Helper function to check if a user has doctor privileges
 * @param role The user's role
 * @returns boolean indicating if the user has doctor privileges
 */
export function isDoctor(role: UserRole | null): boolean {
  return role === 'doctor';
}
