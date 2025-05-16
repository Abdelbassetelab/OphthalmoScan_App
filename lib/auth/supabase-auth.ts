import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type User } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// Create a typed client for type safety
const supabase = createClientComponentClient<Database>();

// Type for additional metadata when signing up
export type SignUpMetadata = {
  first_name?: string;
  last_name?: string;
  role?: 'patient' | 'doctor' | 'admin';
  [key: string]: any;
};

// Sign up with email and password
export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  metadata: SignUpMetadata = {}
) {
  // Get the callback URL from environment variables
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?type=signup`;

  // Sign up the user
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        ...metadata,
        // Set default role to 'patient' if not provided
        role: metadata.role || 'patient',
      },
    },
  });
}

// Sign in with email and password
export async function signInWithEmailAndPassword(email: string, password: string) {
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  
  return supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      redirectTo: redirectUrl,
    },
  });
}

// Sign out the current user
export async function signOut() {
  return supabase.auth.signOut();
}

// Reset password with email
export async function resetPasswordWithEmail(email: string) {
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?type=recovery`;
  
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
}

// Update user password
export async function updatePassword(password: string) {
  return supabase.auth.updateUser({
    password,
  });
}

// Update user metadata
export async function updateUserMetadata(metadata: SignUpMetadata) {
  return supabase.auth.updateUser({
    data: metadata,
  });
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// Get current user session
export async function getSession() {
  return supabase.auth.getSession();
}

// Get current user role
export async function getUserRole(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.user_metadata?.role || null;
}

// Refresh session
export async function refreshSession() {
  return supabase.auth.refreshSession();
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}