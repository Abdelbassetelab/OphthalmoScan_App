import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createSupabaseAdmin } from '@/lib/db/supabase';
import { clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  const eventType = evt.type;
  const { id: userId } = evt.data;
  const supabase = createSupabaseAdmin();

  switch (eventType) {
    case 'user.created':
      try {
        // Set default role in Clerk
        const metadata = { role: 'patient' };
        await clerkClient.users.updateUserMetadata(userId, { publicMetadata: metadata });

        // Create user in Supabase
        const { error } = await supabase.from('users').insert({
          id: userId,
          role: metadata.role,
        });

        if (error) throw error;
        return NextResponse.json({ message: 'User created successfully' });
      } catch (error) {
        console.error('Error in user.created webhook:', error);
        return new Response('Error processing user creation', { status: 500 });
      }

    case 'user.updated':
      try {
        // Get the updated user from Clerk to ensure we have the latest metadata
        const user = await clerkClient.users.getUser(userId);
        const role = user.publicMetadata.role as string || 'patient';

        // Update role in Supabase
        const { error } = await supabase
          .from('users')
          .update({ role })
          .eq('id', userId);

        if (error) throw error;
        return NextResponse.json({ message: 'User updated successfully' });
      } catch (error) {
        console.error('Error in user.updated webhook:', error);
        return new Response('Error processing user update', { status: 500 });
      }

    case 'user.deleted':
      try {
        // Delete user from Supabase
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        return NextResponse.json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Error in user.deleted webhook:', error);
        return new Response('Error processing user deletion', { status: 500 });
      }
  }

  return NextResponse.json({ message: 'Webhook processed successfully' });
}