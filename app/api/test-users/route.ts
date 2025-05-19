import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      userCount: data?.length || 0,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Internal server error'
    }, { status: 500 });
  }
}
