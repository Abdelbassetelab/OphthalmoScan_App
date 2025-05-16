import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase'; // This is your globally initialized client
import { createClient } from '@supabase/supabase-js'; // For a fresh client test

export async function GET() {
  console.log('[Supabase Test] Endpoint called.');

  const results: { [key: string]: any } = {};
  const errors: { [key: string]: any } = {};

  // Test 0: Log environment variables as seen by this route
  results.envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded (partial: ' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').substring(0,10) + '...)' : 'MISSING',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'MISSING',
  };
  console.log('[Supabase Test] Environment Variables:', results.envVars);

  // Test 1: Check the configuration of the imported global Supabase client
  try {
    // @ts-ignore // Accessing private/internal properties for debugging
    const globalSupabaseUrl = supabase.supabaseUrl;
    // @ts-ignore
    const globalSupabaseKey = supabase.supabaseKey;
    results.globalSupabaseClientConfig = {
      url: globalSupabaseUrl || 'Not set',
      key: globalSupabaseKey ? 'Set (partial: ' + globalSupabaseKey.substring(0,10) + '...)' : 'Not set',
    };
  } catch (e: any) {
    errors.globalSupabaseClientConfig = e.message;
  }
  console.log('[Supabase Test] Global Supabase Client Config:', results.globalSupabaseClientConfig, errors.globalSupabaseClientConfig || '');

  // Test 2: Generic HTTPS fetch test from Node.js
  try {
    console.log('[Supabase Test] Attempting generic HTTPS fetch to example.com...');
    const response = await fetch('https://example.com');
    results.genericFetchTest = {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    };
    console.log('[Supabase Test] Generic HTTPS fetch to example.com successful.');
  } catch (e: any) {
    console.error('[Supabase Test] Generic HTTPS fetch to example.com FAILED:', e);
    errors.genericFetchTest = {
      message: e.message,
      name: e.name,
      cause: e.cause, // Important for "fetch failed"
      stack: e.stack,
    };
  }

  // Test 2.5: Direct fetch to Supabase auth endpoint
  const supabaseAuthUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`;
  try {
    console.log(`[Supabase Test] Attempting direct fetch to Supabase auth URL: ${supabaseAuthUrl}`);
    const response = await fetch(supabaseAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({ email: `test-direct-fetch-${Date.now()}@example.com`, password: "password123" })
    });
    results.directFetchToSupabaseAuth = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    };
    if(response.ok){
        results.directFetchToSupabaseAuth.body = await response.json();
    } else {
        results.directFetchToSupabaseAuth.bodyText = await response.text();
    }
    console.log('[Supabase Test] Direct fetch to Supabase auth URL completed.');
  } catch (e: any) {
    console.error('[Supabase Test] Direct fetch to Supabase auth URL FAILED:', e);
    errors.directFetchToSupabaseAuth = {
      message: e.message,
      name: e.name,
      cause: e.cause, 
      stack: e.stack,
    };
  }

  // Test 3: Supabase signUp test with detailed error logging
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = `TestPassword${Date.now()}!`;
  try {
    console.log(`[Supabase Test] Attempting supabase.auth.signUp() with email: ${testEmail}`);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('[Supabase Test] supabase.auth.signUp() FAILED:', signUpError);
      errors.signUpTest = {
        message: signUpError.message,
        name: signUpError.name,
        status: signUpError.status,
        cause: (signUpError as any).cause, // Dig deeper for cause
        fullError: JSON.parse(JSON.stringify(signUpError)), // Serialize the whole error
      };
    } else {
      results.signUpTest = {
        success: true,
        userId: data.user?.id,
        session: data.session !== null,
      };
      console.log('[Supabase Test] supabase.auth.signUp() successful (or user already exists).');
      if (data.user && !data.session) {
        console.log(`[Supabase Test] Test user ${data.user.id} created. Manual cleanup may be needed.`);
      }
    }
  } catch (e: any) {
    console.error('[Supabase Test] supabase.auth.signUp() threw an unexpected exception:', e);
    errors.signUpTestThrewException = {
      message: e.message,
      name: e.name,
      cause: e.cause,
      stack: e.stack,
    };
  }
  
  // Test 4: Create a fresh Supabase client instance inside the API route
  let freshClientResults = {};
  try {
    console.log('[Supabase Test] Attempting to create and use a fresh Supabase client instance...');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase URL or Key is missing in env for fresh client test.');
    }
    const freshSupabase = createClient(url, key);
    const { data: freshData, error: freshError } = await freshSupabase.auth.getSession();
    if (freshError) {
      throw freshError;
    }
    freshClientResults = { success: true, session: freshData.session !== null };
    console.log('[Supabase Test] Fresh client getSession successful.');
  } catch (e: any) {
    console.error('[Supabase Test] Fresh client test FAILED:', e);
    errors.freshClientTest = {
      message: e.message,
      name: e.name,
      cause: e.cause,
    };
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({
      success: false,
      message: 'One or more tests failed. Check errors and console logs.',
      results,
      errors,
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'All Supabase connection tests completed.',
    results,
  });
}