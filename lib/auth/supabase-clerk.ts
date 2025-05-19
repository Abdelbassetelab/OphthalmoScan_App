import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

// Creates a Supabase client with authentication from Clerk
export function createClerkSupabaseClient() {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options: {
      global: {
        fetch: async (url, options = {}) => {
          try {
            // Get the session from Clerk
            const session = await getClerkSession();
            
            if (!session) {
              console.warn('No active Clerk session found for Supabase authentication');
              return fetch(url, options);
            }
            
            // Get the Supabase JWT template from Clerk
            const token = await session.getToken({ template: 'supabase' });
            
            if (!token) {
              console.warn('Failed to get Supabase token from Clerk');
              return fetch(url, options);
            }
            
            // Add the token to the request headers
            const headers = new Headers(options?.headers);
            headers.set('Authorization', `Bearer ${token}`);
            
            return fetch(url, {
              ...options,
              headers,
            });
          } catch (error) {
            console.error('Error setting up authenticated Supabase client:', error);
            return fetch(url, options);
          }
        },
      },
    },
  });
}

// Helper to get the current Clerk session (for use outside of React components)
async function getClerkSession() {
  // For client-side usage only
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore - Clerk's global object
      const clerk = window.Clerk;
      if (!clerk) {
        console.warn('Clerk is not initialized');
        return null;
      }
      
      return clerk.session;
    } catch (error) {
      console.error('Error getting Clerk session:', error);
      return null;
    }
  }
  return null;
}

// Hook to use Supabase with Clerk authentication in React components
export function useSupabaseWithClerk() {
  const { session } = useSession();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  
  useEffect(() => {
    if (session) {
      const client = createClerkSupabaseClient();
      setSupabaseClient(client);
    }
  }, [session]);
  
  return { supabase: supabaseClient, isLoaded: !!supabaseClient };
}
