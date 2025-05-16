import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Environment variables are automatically exposed to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create a singleton Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    // Add custom headers if needed
    headers: {
      'x-application-name': 'OphthalmoScan-AI',
    },
  },
});

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