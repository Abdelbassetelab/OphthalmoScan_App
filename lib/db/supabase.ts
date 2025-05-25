import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/types/database.types';

// Helper function to create a client-side Supabase client
export function createClient() {
  return createClientComponentClient<Database>();
}

// Helper function to create a server-side Supabase client (requires cookies)
export async function createServerClient() {
  const { cookies } = await import('next/headers');
  return createServerComponentClient<Database>({ cookies });
}

// Helper to handle common errors in Supabase operations
export async function handleSupabaseError<T>(
  operation: () => Promise<T>,
  customErrorMessage = 'An error occurred while processing your request'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation();
    return { data: result, error: null };
  } catch (error) {
    console.error('Supabase operation error:', error);
    return { data: null, error: customErrorMessage };
  }
}

// Type-safe query helper
export async function supabaseQuery<T = any>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error('Supabase query error:', error);
      return { 
        data: null, 
        error: error.message || 'Database query failed' 
      };
    }
    
    return { data, error: null };
  } catch (e) {
    console.error('Unexpected error during Supabase query:', e);
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    };
  }
}