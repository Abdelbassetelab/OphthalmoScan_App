import { serve } from 'https://deno.land/std@0.170.0/http/server.ts';

serve(async (req) => {
  try {
    const event = await req.json();
    console.log('create-user function received event:', event);
    // TODO: implement custom user creation logic or rely on SQL trigger
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});