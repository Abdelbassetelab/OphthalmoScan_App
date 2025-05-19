import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ count: data, url: process.env.NEXT_PUBLIC_SUPABASE_URL });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
