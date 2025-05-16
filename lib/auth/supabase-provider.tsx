'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Database } from '@/types/database.types';

export default function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  useEffect(() => {
    // Set up auth state listener for client-side navigation
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Refresh the current route when auth state changes
      // This ensures components reflect the current auth state
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return children;
}