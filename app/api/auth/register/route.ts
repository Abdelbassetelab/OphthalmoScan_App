import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, firstName, lastName, role } = requestData;
    
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // 1. Register the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }
    
    // Get the user ID from the sign-up response
    const userId = authData.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    // 2. Update profile with first name and last name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    // 3. Set the user role using our custom function
    const { error: roleError } = await supabase
      .rpc('set_user_role', {
        user_id: userId,
        role_name: role
      });
    
    if (roleError) {
      console.error('Role assignment error:', roleError);
      return NextResponse.json(
        { error: 'Failed to assign role' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Registration successful', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}