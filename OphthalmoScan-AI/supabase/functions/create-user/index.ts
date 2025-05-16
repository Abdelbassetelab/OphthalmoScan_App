import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('Create User Edge Function initializing...');

serve(async (req: Request) => {
  try {
    // Ensure the request method is POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Replace parsing logic to handle Supabase auth trigger payload
    const event = await req.json();
    console.log('create-user function received event:', event);

    // Extract new user record from auth trigger
    const userRecord = event.record;
    if (!userRecord?.id || !userRecord?.email) {
      console.error('Invalid event payload, missing record.id or record.email');
      return new Response(JSON.stringify({ error: 'Bad Request: invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Extract metadata fields
    const metadata = userRecord.raw_user_meta_data || {};
    const first_name = metadata.first_name || '';
    const last_name = metadata.last_name || '';
    const role = metadata.role || 'patient';

    // Environment variable validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase Edge Function env vars', { supabaseUrl, supabaseKey });
      return new Response(JSON.stringify({ error: 'Internal Server Error: function not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Insert profile into public.users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{ id: userRecord.id, email: userRecord.email, first_name, last_name, role }]);

    if (insertError) {
      console.error('Error inserting user profile:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('User profile created successfully for', userRecord.id);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Unexpected error in Edge Function:', e);
    return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
