import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Authenticated client using route handler (follows RLS policies)
const getSupabaseClient = () => {
  return createRouteHandlerClient<Database>({ cookies });
};

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Required Supabase environment variables are missing');
}

// Admin client with service role key (bypasses RLS policies)
const adminSupabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// Check database constraints
async function checkDatabaseConstraints() {
  try {
    console.log('Checking database constraints...');
    
    // Try to get table info
    const { data: tableInfo, error: tableError } = await adminSupabase
      .from('scan_requests')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking table:', tableError);
      return false;
    }
    
    console.log('Table check successful');
    return true;
  } catch (error) {
    console.error('Error checking database constraints:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Get user ID from Clerk
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Parse request data
    const data = await request.json();
    console.log('Received scan request data:', data);
    console.log('Clerk userId:', userId);
    
    // Check database constraints
    await checkDatabaseConstraints();
    
    // Validate required fields and data types
    if (!data.description || typeof data.description !== 'string') {
      return NextResponse.json(
        { message: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
      return NextResponse.json(
        { message: 'Priority must be one of: low, medium, high, urgent' },
        { status: 400 }
      );
    }

    // Validate symptoms and medical_history if provided
    if (data.symptoms && typeof data.symptoms !== 'string') {
      return NextResponse.json(
        { message: 'Symptoms must be a string if provided' },
        { status: 400 }
      );
    }

    if (data.medical_history && typeof data.medical_history !== 'string') {
      return NextResponse.json(
        { message: 'Medical history must be a string if provided' },
        { status: 400 }
      );
    }
      // Prepare scan request data with Clerk user ID
    const scanRequest = {
      description: data.description,
      symptoms: data.symptoms || null,
      medical_history: data.medical_history || null,
      patient_id: userId, // Clerk user ID is now compatible with TEXT column
      user_id: userId,    // Set user_id to the same as patient_id
      status: 'pending' as const,
      priority: (data.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
      has_image: false, // Default to false, update to true when image is attached
      image_url: null // Explicitly set to null initially
    };

    // Get authenticated Supabase client
    const supabase = getSupabaseClient();
    
    // Insert the scan request
    const { data: result, error } = await supabase
      .from('scan_requests')
      .insert([scanRequest])
      .select();
    
    if (error) {
      console.error('Error creating scan request:', error);
      
      // If RLS policy is blocking the insert, try with admin client
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        console.log('Attempting insert with admin client...');
        
        const { data: adminResult, error: adminError } = await adminSupabase
          .from('scan_requests')
          .insert([scanRequest])
          .select();
        
        if (adminError) {
          console.error('Admin insert error:', adminError);
          return NextResponse.json(
            { message: 'Failed to create scan request', error: adminError },
            { status: 500 }
          );
        }
        
        return NextResponse.json(adminResult[0], { status: 201 });
      }
      
      return NextResponse.json(
        { message: 'Failed to create scan request', error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error in scan request route:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get authenticated Supabase client
    const supabase = getSupabaseClient();
      // Get scan requests where user is either the creator or the patient
    const { data: scanRequests, error } = await supabase
      .from('scan_requests')
      .select('*')
      .or(`user_id.eq.${userId},patient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching scan requests:', error);
      return NextResponse.json(
        { message: 'Failed to fetch scan requests', error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(scanRequests);
  } catch (error) {
    console.error('Error in scan request route:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}